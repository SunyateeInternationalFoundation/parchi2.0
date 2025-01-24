import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import addItem from "../../../assets/addItem.png";
import { db } from "../../../firebase";
import { cn, formatDate } from "../../../lib/utils";
import CreateCustomer from "../../Customers/CreateCustomer";
import { Calendar } from "../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
import SideBarAddServices from "./SideBarAddServices";

function SetService() {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  let companyDetails;
  if (userDetails.selectedDashboard === "staff") {
    companyDetails =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails;
  } else {
    companyDetails = userDetails.companies[userDetails.selectedCompanyIndex];
  }
  const phoneNo = userDetails.phone;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [membershipPeriod, setMembershipPeriod] = useState("");
  const [membershipEndDate, setMembershipEndDate] = useState("");
  const [membershipStartDate, setMembershipStartDate] = useState(
    Timestamp.fromDate(new Date())
  );

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: Timestamp.fromDate(new Date()),
    dueDate: Timestamp.fromDate(new Date()),
    extraDiscount: 0,
    extraDiscountType: true,
    status: "Active",
    notes: "",
    serviceNo: "",
    subTotal: 0,
    total: 0,
    tax: 0,
    terms: "",
  });

  const [totalAmounts, setTotalAmounts] = useState({
    totalTaxableAmount: 0,
    totalSgstAmount_2_5: 0,
    totalCgstAmount_2_5: 0,
    totalSgstAmount_6: 0,
    totalCgstAmount_6: 0,
    totalSgstAmount_9: 0,
    totalCgstAmount_9: 0,
    totalAmount: 0,
    subTotalAmount: 0,
  });
  const [preServicesList, setPreServicesList] = useState([]);

  const [servicesList, setServicesList] = useState([]);
  const [selectedServicesList, setSelectedServicesList] = useState([]);

  const [customersData, setCustomersData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState({
    name: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    function addSelectedService() {
      if (
        formData?.servicesList?.length === 0 ||
        servicesList.length === 0 ||
        !id
      ) {
        return;
      }
      let serviceData = [];

      for (let ele of formData.servicesList) {
        serviceData.push(
          ...servicesList.filter((ser) => {
            return ser.id === ele.serviceRef.id;
          })
        );
      }

      const service = serviceData.map((ele) => {
        ele.isSelected = true;
        return ele;
      });
      setSelectedServicesList(service);
      calculationService(service);
    }
    addSelectedService();
    if (id) {
      fetchServicesNumbers();
    }
  }, [formData.servicesList]);

  const fetchServicesNumbers = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "companies", companyDetails.companyId, "services")
      );

      const noList = querySnapshot.docs.map((doc) => doc.data().serviceNo);
      if (id) {
        setPreServicesList(noList.filter((ele) => ele !== formData.serviceNo));
      } else {
        setPreServicesList(noList);
        setFormData((val) => ({
          ...val,
          serviceNo: String(noList.length + 1).padStart(4, 0),
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchPrefix = async () => {
      try {
        const companyDocRef = doc(db, "companies", companyDetails.companyId);
        const companySnapshot = await getDoc(companyDocRef);

        if (companySnapshot.exists()) {
          const companyData = companySnapshot.data();
          setPrefix(companyData.prefix.service || "SRE");
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    async function fetchServiceData() {
      if (!id) {
        return;
      }
      try {
        const docRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "services",
          id
        );
        const getData = (await getDoc(docRef)).data();

        const customerData = (
          await getDoc(getData.customerDetails.customerRef)
        ).data();
        handleSelectCustomer({
          customerId: getData.customerDetails.customerRef.id,
          ...customerData,
        });
        setMembershipStartDate(getData.membershipStartDate);
        setMembershipEndDate(getData.membershipEndDate);
        setMembershipPeriod(getData.typeOfEndMembership);
        setFormData(getData);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceData ~ error:", error);
      }
    }
    const fetchServices = async () => {
      try {
        const companyRef = doc(db, "companies", companyDetails.companyId);
        const serviceRef = collection(db, "services");
        const q = query(serviceRef, where("companyRef", "==", companyRef));
        const getData = await getDocs(q);
        const serviceData = getData.docs.map((doc) => {
          const data = doc.data();
          const temp = {
            id: doc.id,
            ...data,
            isSelected: false,
            isAddDescription: false,
          };

          // let discount = +data.discount || 0;

          // if (data.discountType) {
          //   discount = (+data.sellingPrice / 100) * data.discount;
          // }
          // const netAmount = +data.sellingPrice - discount;
          // const taxRate = data.tax || 0;
          // const sgst = taxRate / 2;
          // const cgst = taxRate / 2;
          // const taxAmount = netAmount * (taxRate / 100);
          // const sgstAmount = netAmount * (sgst / 100);
          // const cgstAmount = netAmount * (cgst / 100);
          return ModifiedServiceData(temp);
        });
        setServicesList(serviceData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    async function customerDetails() {
      try {
        const customersRef = collection(db, "customers");
        const companyRef = doc(db, "companies", companyDetails.companyId);
        const q = query(customersRef, where("companyRef", "==", companyRef));
        const company = await getDocs(q);
        const customerData = company.docs.map((doc) => ({
          customerId: doc.id,
          ...doc.data(),
        }));
        setCustomersData(customerData);
        setSuggestions(customerData);
      } catch (error) {
        console.log("🚀 ~ customerDetails ~ error:", error);
      }
    }
    if (!id) {
      fetchServicesNumbers();
    }
    fetchPrefix();
    fetchServiceData();
    customerDetails();
    fetchServices();
  }, [companyDetails, userDetails.selectedDashboard]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedCustomerData({ name: e.target.value });
    if (value) {
      const filteredSuggestions = customersData.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsDropdownVisible(true);
    } else {
      setSuggestions(customersData);
    }
  };

  const handleSelectCustomer = (item) => {
    setSelectedCustomerData(item);
    setIsDropdownVisible(false);
  };

  async function onSetService() {
    try {
      if (selectedServicesList.length == 0) {
        return;
      }
      if (!selectedCustomerData?.customerId) {
        return alert("select Customer");
      }
      const customerRef = doc(db, "customers", selectedCustomerData.customerId);
      const companyRef = doc(db, "companies", companyDetails.companyId);

      const serviceListPayload = [];
      for (const service of selectedServicesList) {
        const serviceRef = doc(db, "services", service.id);
        serviceListPayload.push({
          name: service.serviceName,
          description: service.description,
          discount: service.discount,
          discountType: service.discountType,
          sellingPrice: service.sellingPrice,
          sellingPriceTaxType: service.sellingPriceTaxType,
          tax: service.tax,
          serviceRef: serviceRef,
        });
      }

      const payload = {
        ...formData,
        prefix,
        subTotal: +totalAmounts.subTotalAmount,
        total: +totalAmounts.totalAmount,
        createdBy: {
          companyRef: companyRef,
          name: companyDetails.name,
          address: companyDetails.address ?? "",
          city: companyDetails.city ?? "",
          zipCode: companyDetails.zipCode ?? "",
          phoneNo: phoneNo,
          who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
        },
        customerDetails: {
          gstNumber: selectedCustomerData.gstNumber ?? "",
          customerRef: customerRef,
          address: selectedCustomerData.address ?? "",
          city: selectedCustomerData.city ?? "",
          zipCode: selectedCustomerData.zipCode ?? "",
          phone: selectedCustomerData.phone ?? "",
          name: selectedCustomerData.name,
          //   who: formData.createdBy.who,
        },
        servicesList: serviceListPayload,
        membershipStartDate: membershipStartDate,
        membershipEndDate,
        typeOfEndMembership: membershipPeriod,
      };
      if (id) {
        await updateDoc(
          doc(db, "companies", companyDetails.companyId, "services", id),
          payload
        );
      } else {
        await addDoc(
          collection(db, "companies", companyDetails.companyId, "services"),
          payload
        );
      }
      if (formData.membershipId) {
        await updateDoc(customerRef, {
          memberships: arrayUnion(formData.membershipId),
        });
      }
      alert(`successfully ${id ? "Updated" : "Created"}  Service`);
      navigate(
        userDetails.selectedDashboard === "staff"
          ? "/staff/subscriptions"
          : "/subscriptions"
      );
    } catch (err) {
      console.error(err);
    }
  }

  function DateFormate(timestamp) {
    if (!timestamp.seconds || !timestamp.nanoseconds) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getFullYear}-${getMonth}-${getDate}`;
  }

  function onSelectService(data) {
    setSelectedServicesList(data);
    calculationService(data);
  }

  useEffect(() => {
    if (selectedServicesList.length > 0) {
      calculationService(selectedServicesList);
    }
  }, [selectedServicesList]);

  function calculationService(data) {
    const totalTaxableAmount = data.reduce((sum, service) => {
      const cal = sum + (service.totalAmount - service.taxAmount);
      if (!service.sellingPriceTaxType) {
        return sum + service.totalAmount;
      }
      return cal;
    }, 0);

    const totalSgstAmount_2_5 = data.reduce(
      (sum, service) => (service.sgst === 2.5 ? sum + service.sgstAmount : sum),
      0
    );
    const totalCgstAmount_2_5 = data.reduce(
      (sum, service) => (service.cgst === 2.5 ? sum + service.cgstAmount : sum),
      0
    );

    const totalSgstAmount_6 = data.reduce(
      (sum, service) => (service.sgst === 6 ? sum + service.sgstAmount : sum),
      0
    );
    const totalCgstAmount_6 = data.reduce(
      (sum, service) => (service.cgst === 6 ? sum + service.cgstAmount : sum),
      0
    );

    const totalSgstAmount_9 = data.reduce(
      (sum, service) => (service.sgst === 9 ? sum + service.sgstAmount : sum),
      0
    );
    const totalCgstAmount_9 = data.reduce(
      (sum, service) => (service.cgst === 9 ? sum + service.cgstAmount : sum),
      0
    );

    const subTotalAmount =
      totalTaxableAmount +
      totalSgstAmount_2_5 +
      totalCgstAmount_2_5 +
      totalSgstAmount_6 +
      totalCgstAmount_6 +
      totalSgstAmount_9 +
      totalCgstAmount_9;

    let discountAmount = formData.extraDiscount || 0;
    if (formData.extraDiscountType) {
      discountAmount = (+subTotalAmount * discountAmount) / 100;
    }
    const totalAmount = +subTotalAmount - discountAmount;
    // Set state with the new values
    setTotalAmounts({
      totalTaxableAmount,
      totalSgstAmount_2_5,
      totalCgstAmount_2_5,
      totalSgstAmount_6,
      totalCgstAmount_6,
      totalSgstAmount_9,
      totalCgstAmount_9,
      subTotalAmount,
      totalAmount,
    });
  }

  useEffect(() => {
    let discountAmount = formData.extraDiscount || 0;
    if (formData.extraDiscountType) {
      discountAmount = (+totalAmounts.subTotalAmount * discountAmount) / 100;
    }
    const totalAmount = +totalAmounts.subTotalAmount - discountAmount;
    setTotalAmounts((val) => ({ ...val, totalAmount }));
  }, [formData.extraDiscount, formData.extraDiscountType]);

  useEffect(() => {
    function setMembershipDate() {
      if (!membershipStartDate?.seconds || !membershipPeriod) {
        return;
      }
      const milliseconds =
        membershipStartDate.seconds * 1000 +
        membershipStartDate.nanoseconds / 1000000;
      const inputDate = new Date(milliseconds);
      let endDate = new Date();
      if (membershipPeriod === "free") {
        endDate = new Date(inputDate.setDate(inputDate.getDate() + 15));
      } else if (membershipPeriod !== "custom") {
        endDate = new Date(
          inputDate.setMonth(inputDate.getMonth() + +membershipPeriod)
        );
      }
      setMembershipEndDate(Timestamp.fromDate(endDate));
    }
    setMembershipDate();
  }, [membershipStartDate, membershipPeriod]);
  function ModifiedServiceData(data) {
    let discount = +data.discount || 0;

    if (data.discountType) {
      discount = (+data.sellingPrice / 100) * data.discount;
    }
    const netAmount = +data.sellingPrice - discount;
    const taxRate = data.tax || 0;

    const sgst = taxRate / 2;
    const cgst = taxRate / 2;
    const taxAmount = netAmount * (taxRate / 100);
    const sgstAmount = netAmount * (sgst / 100);
    const cgstAmount = netAmount * (cgst / 100);

    return {
      ...data,
      netAmount: netAmount,
      sgst,
      cgst,
      sgstAmount,
      cgstAmount,
      taxAmount,
      totalAmount: +netAmount,
    };
  }
  function onChangeDiscount(value, name, id) {
    const updatedServices = selectedServicesList.map((service) => {
      if (service.id === id) {
        service[name] = value;
        return ModifiedServiceData(service);
      }
      return service;
    });
    setSelectedServicesList(updatedServices);
    calculationService(updatedServices);
  }
  return (
    <div className="bg-gray-100 overflow-y-auto" style={{ height: "92vh" }}>
      <div className="px-5 pb-5">
        <header className="flex items-center space-x-3  my-2">
          <Link className="flex items-center" to={"./../"}>
            <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold">
            {id ? "Edit" : "Create"} Service
          </h1>
        </header>
        <div className="bg-white p-6 rounded-lg shadow-lg ">
          <div className="flex gap-8 mb-6">
            <div className="flex-1">
              <h2 className="font-semibold mb-2">Customer Details</h2>
              <div className="border p-3 rounded-lg">
                <label className="text-sm text-gray-600">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <div className=" flex">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search your Customers, Company Name, GSTIN..."
                      className="text-base text-gray-900 font-semibold border  rounded-s-md w-full mt-1 px-5  py-2"
                      value={selectedCustomerData?.name ?? ""}
                      onChange={handleInputChange}
                      onFocus={() => {
                        setIsDropdownVisible(true);
                        setSuggestions(customersData || []);
                      }}
                      onBlur={() => {
                        if (!selectedCustomerData?.name) {
                          setSelectedCustomerData({ name: "" });
                        }
                        setIsDropdownVisible(false);
                      }}
                      required
                    />
                    {isDropdownVisible && suggestions.length > 0 && (
                      <div className="absolute z-10  bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-full">
                        {suggestions.map((item) => (
                          <div
                            key={item.customerId}
                            onMouseDown={() => handleSelectCustomer(item)}
                            className="text-sm text-gray-700 px-4 py-2 cursor-pointer hover:bg-blue-100"
                          >
                            Name :{item.name} Phone No. :{item.phone}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-1/4">
                    <button
                      className="text-base text-gray-500 font-semibold border  rounded-e-md w-full mt-1 px-5  py-2"
                      onClick={() => setIsModalOpen(true)}
                    >
                      + New
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-2">Service Details</h2>
              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-3 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600">
                    Service Date <span className="text-red-500">*</span>
                  </label>

                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !formData.date?.seconds && "text-muted-foreground"
                          )}
                        >
                          {formData.date?.seconds ? (
                            formatDate(
                              new Date(
                                formData.date?.seconds * 1000 +
                                  formData.date?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span className="text-gray-600">Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              formData.date?.seconds * 1000 +
                                formData.date?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              date: Timestamp.fromDate(new Date(val)),
                            }));
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Due Date <span className="text-red-500">*</span>
                  </label>

                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !formData.dueDate?.seconds &&
                              "text-muted-foreground"
                          )}
                        >
                          {formData.dueDate?.seconds ? (
                            formatDate(
                              new Date(
                                formData.dueDate?.seconds * 1000 +
                                  formData.dueDate?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span className="text-gray-600">
                              Pick a dueDate
                            </span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              formData.dueDate?.seconds * 1000 +
                                formData.dueDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              dueDate: Timestamp.fromDate(new Date(val)),
                            }));
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Service No. <span className="text-red-500">*</span>
                    {preServicesList.includes(formData.serviceNo) && (
                      <span className="text-red-800 text-xs">
                        &quot;Already Service No. exist&quot;{" "}
                      </span>
                    )}
                    {Number(formData.serviceNo) === 0 && (
                      <span className="text-red-800 text-xs">
                        &quot;Kindly Enter valid Service No.&quot;{" "}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center">
                    <span className="px-4 py-1 mt-1 border rounded-l-md text-gray-700 flex-grow  px-5  py-2">
                      {prefix}
                    </span>
                    <input
                      type="text"
                      placeholder="Enter Service No. "
                      className="border p-1 rounded-r-md w-full mt-1 flex-grow  px-5  py-2"
                      value={formData?.serviceNo || ""}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          serviceNo: e.target.value,
                        }));
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-violet-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Services</h2>
              <button
                className="bg-[#442799] text-white text-center w-48  px-5 py-4 font-semibold rounded-md"
                onClick={() => setIsSideBarOpen(true)}
              >
                + Add Services
              </button>
            </div>
            <div className="bg-white border-2 rounded-md overflow-hidden">
              <div className="mb-4 rounded-md">
                <table className="min-w-full text-center text-gray-500 font-semibold">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-gray-500 font-semibold text-start">
                        Service Name
                      </th>
                      <th className="px-4 py-3 text-gray-500 font-semibold ">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-gray-500 font-semibold ">
                        Discount
                      </th>
                      <th className="px-2 py-3 text-gray-500 font-semibold ">
                        Is Tax Included
                      </th>
                      <th className="px-4 py-3 text-gray-500 font-semibold ">
                        Total Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedServicesList.length ? (
                      selectedServicesList.map((service) => (
                        <tr key={service.id}>
                          <td className="px-4 py-2 text-start space-y-2">
                            <div>{service.serviceName}</div>
                            <div className="text-xs text-gray-400">
                              {!service.isAddDescription ? (
                                <button
                                  className="border-2 rounded-md px-2 py-1"
                                  onClick={() => {
                                    const updatedServices =
                                      selectedServicesList.map((ele) => {
                                        if (ele.id == service.id) {
                                          ele.isAddDescription = true;
                                        }
                                        return ele;
                                      });
                                    setSelectedServicesList(updatedServices);
                                  }}
                                >
                                  + Add Description
                                </button>
                              ) : (
                                <div>
                                  <input
                                    type="text"
                                    defaultValue={service.description}
                                    className="border rounded-md px-2 py-1"
                                    onBlur={(e) => {
                                      const updatedServices =
                                        selectedServicesList.map((ele) => {
                                          if (ele.id == service.id) {
                                            ele.description = e.target.value;
                                          }
                                          return ele;
                                        });
                                      setSelectedServicesList(updatedServices);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">₹{service.sellingPrice}</td>
                          <td className="w-32">
                            <div className="flex items-center">
                              <input
                                type="number"
                                defaultValue={service.discount.toFixed(2)}
                                className="border w-full rounded-s-md p-2"
                                onChange={(e) =>
                                  onChangeDiscount(
                                    +e.target.value,
                                    "discount",
                                    service.id
                                  )
                                }
                              />
                              <select
                                className="border w-fit rounded-e-md p-2"
                                name="discountType"
                                value={service.discountType}
                                onChange={(e) =>
                                  onChangeDiscount(
                                    e.target.value === "true" ? true : false,
                                    "discountType",
                                    service.id
                                  )
                                }
                              >
                                <option value="true">%</option>
                                <option value="false">₹</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            {service.sellingPriceTaxType ? "Yes" : "No"}
                          </td>
                          <td className="px-4 py-2">₹{service.totalAmount} </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-10 text-center">
                          <div className="w-full flex justify-center">
                            <img
                              src={addItem}
                              alt="add Item"
                              className="w-24 h-24"
                            />
                          </div>
                          <div>No Service Selected </div>
                          <button
                            className=" bg-[#442799] text-white text-center w-48  px-3 py-2 pt-1 font-semibold rounded-md"
                            onClick={() => setIsSideBarOpen(true)}
                          >
                            <div>Choose Service</div>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg  mb-6">
            <div className="w-full pt-4 bg-white p-4 rounded-lg">
              <div className="w-full grid grid-cols-3 gap-4">
                <div className="w-full ">
                  <div>MemberShip</div>
                  <input
                    type="text"
                    placeholder="Membership Id"
                    className="border p-2 rounded w-full"
                    value={formData?.membershipId || ""}
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        membershipId: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="w-full ">
                  <div>Start Date</div>

                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !membershipStartDate?.seconds &&
                              "text-muted-foreground"
                          )}
                        >
                          {membershipStartDate?.seconds ? (
                            formatDate(
                              new Date(
                                membershipStartDate?.seconds * 1000 +
                                  membershipStartDate?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span className="text-gray-600">Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              membershipStartDate?.seconds * 1000 +
                                membershipStartDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setMembershipStartDate(
                              Timestamp.fromDate(new Date(val))
                            );
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="w-full ">
                  <div>Membership Period</div>

                  <Select
                    value={membershipPeriod}
                    onValueChange={(value) => setMembershipPeriod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={" Membership Period"} />
                    </SelectTrigger>
                    <SelectContent className=" h-26">
                      <SelectItem value="free">
                        Free trial for 15 day
                      </SelectItem>
                      <SelectItem value="1">1 Months</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="9">9 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="custom">custom Months</SelectItem>
                    </SelectContent>
                  </Select>

                  {membershipPeriod === "custom" && (
                    <div>
                      <div>Select Custom Date</div>

                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                "w-full flex justify-between items-center input-tag ",
                                !membershipEndDate?.seconds &&
                                  "text-muted-foreground"
                              )}
                            >
                              {membershipEndDate?.seconds ? (
                                formatDate(
                                  new Date(
                                    membershipEndDate?.seconds * 1000 +
                                      membershipEndDate?.nanoseconds / 1000000
                                  ),
                                  "PPP"
                                )
                              ) : (
                                <span className="text-gray-600">
                                  Pick a date
                                </span>
                              )}
                              <CalendarIcon className="h-4 w-4 " />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="">
                            <Calendar
                              mode="single"
                              selected={
                                new Date(
                                  membershipEndDate?.seconds * 1000 +
                                    membershipEndDate?.nanoseconds / 1000000
                                )
                              }
                              onSelect={(val) => {
                                setMembershipEndDate(
                                  Timestamp.fromDate(new Date(val))
                                );
                              }}
                              initialFocus
                              required
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full ">
                  <div>Sign</div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={"Select Sign"} />
                    </SelectTrigger>
                    <SelectContent className=" h-26"></SelectContent>
                  </Select>
                </div>
                <div className="w-full ">
                  <div>Payment Mode</div>
                  <Select
                    value={formData.mode}
                    onValueChange={(value) =>
                      setFormData((val) => ({
                        ...val,
                        mode: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={"Select Payment Mode"} />
                    </SelectTrigger>
                    <SelectContent className=" h-26">
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Emi">Emi</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Net Banking">Net Banking</SelectItem>
                      <SelectItem value="Credit/Debit Card">
                        Credit/Debit Card
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className=" mt-4 ">
            <div className="flex justify-between">
              <div className="w-full bg-zinc-50 p-5 rounded-lg">
                <div className="w-full text-gray-500 space-y-2 ">
                  <div className="font-semibold">Notes</div>
                  <textarea
                    type="text"
                    value={formData.notes}
                    placeholder="Notes"
                    className="border p-2 rounded-md w-full max-h-24 min-h-24 resize-none"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        notes: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full text-gray-500 space-y-2 ">
                  <div className="font-semibold">Terms</div>
                  <textarea
                    type="text"
                    value={formData.terms}
                    className="border p-2 rounded-md w-full max-h-24 min-h-24 resize-none "
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        terms: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div
                className="p-8 bg-blue-50 rounded-lg"
                style={{ width: "700px" }}
              >
                {totalAmounts.totalTaxableAmount > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Taxable Amount</span>
                    <span>
                      ₹ {(totalAmounts?.totalTaxableAmount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {totalAmounts.totalSgstAmount_2_5 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(2.5%)</span>
                    <span>
                      ₹ {(totalAmounts?.totalSgstAmount_2_5 || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {totalAmounts.totalCgstAmount_2_5 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(2.5%)</span>
                    <span>
                      ₹ {(totalAmounts?.totalCgstAmount_2_5 || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {totalAmounts.totalSgstAmount_6 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(6%)</span>
                    <span>
                      ₹ {(totalAmounts?.totalSgstAmount_6 || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {totalAmounts.totalCgstAmount_6 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(6%)</span>
                    <span>
                      ₹ {(totalAmounts?.totalCgstAmount_6 || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {totalAmounts.totalSgstAmount_9 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(9%)</span>
                    <span>
                      ₹ {(totalAmounts?.totalSgstAmount_9 || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {totalAmounts.totalCgstAmount_9 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(9%)</span>
                    <span>
                      ₹ {(totalAmounts?.totalCgstAmount_9 || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Extra Discount</span>
                  <div>
                    <input
                      type="number"
                      className="border px-2 py-1 rounded-s-md w-20 focus:outline-none text-sm"
                      defaultValue={formData?.extraDiscount || 0}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscount: +e.target.value || 0,
                        }));
                      }}
                    />
                    <select
                      className="border px-2 rounded-e-md text-sm py-1"
                      value={formData?.extraDiscountType}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscountType:
                            e.target.value == "true" ? true : false,
                        }));
                      }}
                    >
                      <option value="true">%</option>
                      <option value="false">₹</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-xl mb-2">
                  <span>Total Amount</span>
                  <span>₹ {(totalAmounts?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end sticky bottom-0 bg-white p-2 pe-10 border-t mt-5">
        <button
          className="rounded-lg  bg-[#442799] text-white text-center   px-5 py-3 pt-2 font-semibold rounded-md"
          onClick={onSetService}
        >
          <span className="text-lg">+</span> {id ? "Edit" : "Create"} service
        </button>
      </div>
      <SideBarAddServices
        isOpen={isSideBarOpen}
        onClose={() => setIsSideBarOpen(false)}
        servicesList={servicesList}
        onSubmitService={onSelectService}
      />
      <CreateCustomer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
export default SetService;
