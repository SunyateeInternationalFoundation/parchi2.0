import {
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
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import SideBarAddServices from "./SideBarAddServices";

function EditService() {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  // const companyDetails =
  //   userDetails.companies[userDetails.selectedCompanyIndex];
  let companyDetails;
  if (userDetails.selectedDashboard === "staff") {
    companyDetails =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails;
  } else {
    companyDetails = userDetails.companies[userDetails.selectedCompanyIndex];
  }
  const [prefix, setPrefix] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date());
  const [serviceDueDate, setServiceDueDate] = useState(new Date());
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [membershipPeriod, setMembershipPeriod] = useState("");
  const [membershipEndDate, setMembershipEndDate] = useState("");
  const [membershipStartDate, setMembershipStartDate] = useState(new Date());

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      if (formData?.servicesList?.length === 0 || servicesList.length === 0) {
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
    const fetchServicesNumbers = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "companies", companyDetails.companyId, "services")
        );

        const noList = querySnapshot.docs.map((doc) => doc.data().serviceNo);
        setPreServicesList(noList.filter((ele) => ele !== formData.serviceNo));
        setFormData((val) => ({
          ...val,
          serviceNo: String(noList.length + 1).padStart(4, 0),
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    addSelectedService();
    fetchServicesNumbers();
  }, [formData.servicesList]);

  useEffect(() => {
    const fetchPrefix = async () => {
      try {
        const companyDocRef = doc(db, "companies", companyDetails.companyId);
        const companySnapshot = await getDoc(companyDocRef);

        if (companySnapshot.exists()) {
          const companyData = companySnapshot.data();
          setPrefix(companyData.prefix.service || "Service");
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    async function fetchServiceData() {
      try {
        const docRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "services",
          id
        );
        const getData = (await getDoc(docRef)).data();
        setServiceDate(getData.date);
        setServiceDueDate(getData.dueDate);
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
            id: doc.id,
            ...data,
            totalAmount: netAmount,
            sgst,
            cgst,
            sgstAmount,
            cgstAmount,
            taxAmount,
            tax: data.tax,
            isSelected: false,
          };
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
    fetchPrefix();
    fetchServiceData();
    customerDetails();
    fetchServices();
  }, [companyDetails, id]);

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

  async function onEditService() {
    try {
      if (selectedServicesList.length == 0) {
        return;
      }
      const customerRef = doc(db, "customers", selectedCustomerData.customerId);

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
        date: serviceDate,
        dueDate: serviceDueDate,
        subTotal: +totalAmounts.subTotalAmount,
        total: +totalAmounts.totalAmount,
        customerDetails: {
          gstNumber: selectedCustomerData.gstNumber ?? "",
          customerRef: customerRef,
          address: selectedCustomerData.address ?? "",
          city: selectedCustomerData.city ?? "",
          zipCode: selectedCustomerData.zipCode ?? "",
          phone: selectedCustomerData.phone ?? "",
          name: selectedCustomerData.name,
        },
        servicesList: serviceListPayload,
        membershipStartDate: membershipStartDate,
        membershipEndDate,
        typeOfEndMembership: membershipPeriod,
      };
      await updateDoc(
        doc(db, "companies", companyDetails.companyId, "services", id),
        payload
      );
      if (formData.membershipId) {
        await updateDoc(customerRef, {
          memberships: arrayUnion(formData.membershipId),
        });
      }
      alert("successfully Updated Service");
      navigate(
        userDetails.selectedDashboard === "staff"
          ? "/staff/services"
          : "/services"
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
    // const totalTaxableAmount = data.reduce(
    //   (sum, product) => sum + product.totalAmount,
    //   0
    // );

    const totalTaxableAmount = data.reduce((sum, product) => {
      const cal = sum + (product.totalAmount - product.taxAmount);
      if (!product.sellingPriceTaxType) {
        return sum + product.totalAmount;
      }
      return cal;
    }, 0);

    const totalSgstAmount_2_5 = data.reduce(
      (sum, product) => (product.sgst === 2.5 ? sum + product.sgstAmount : sum),
      0
    );
    const totalCgstAmount_2_5 = data.reduce(
      (sum, product) => (product.cgst === 2.5 ? sum + product.cgstAmount : sum),
      0
    );

    const totalSgstAmount_6 = data.reduce(
      (sum, product) => (product.sgst === 6 ? sum + product.sgstAmount : sum),
      0
    );
    const totalCgstAmount_6 = data.reduce(
      (sum, product) => (product.cgst === 6 ? sum + product.cgstAmount : sum),
      0
    );

    const totalSgstAmount_9 = data.reduce(
      (sum, product) => (product.sgst === 9 ? sum + product.sgstAmount : sum),
      0
    );
    const totalCgstAmount_9 = data.reduce(
      (sum, product) => (product.cgst === 9 ? sum + product.cgstAmount : sum),
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
  return (
    <div
      className="w-full px-5 pb-5 bg-gray-100 overflow-y-auto"
      style={{ height: "92vh" }}
    >
      <header className="flex items-center space-x-3  my-2">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Service</h1>
      </header>
      <div className="bg-white p-6 rounded-lg shadow-lg ">
        <div className="flex gap-8 mb-6">
          <div className="flex-1">
            <h2 className="font-semibold mb-2">Customer Details</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="text-sm text-gray-600">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search your Customers, Company Name, GSTIN..."
                  className="text-base text-gray-900 font-semibold border p-1 rounded w-full mt-1"
                  value={selectedCustomerData?.name ?? ""}
                  onChange={handleInputChange}
                  onFocus={() => setIsDropdownVisible(true)}
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
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold mb-2">Other Details</h2>
            <div className="grid grid-cols-3 gap-4 bg-pink-50 p-4 rounded-lg">
              <div>
                <label className="text-sm text-gray-600">
                  Service Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={DateFormate(serviceDate) || ""}
                  className="border p-1 rounded w-full mt-1"
                  onChange={(e) => {
                    setServiceDate(
                      Timestamp.fromDate(new Date(e.target.value))
                    );
                  }}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={DateFormate(serviceDueDate)}
                  className="border p-1 rounded w-full mt-1"
                  onChange={(e) => {
                    setServiceDueDate(
                      Timestamp.fromDate(new Date(e.target.value))
                    );
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Service No. <span className="text-red-500">*</span>
                  {preServicesList.includes(formData.serviceNo) && (
                    <span className="text-red-800 text-xs">
                      "Already Service No. exist"{" "}
                    </span>
                  )}
                  {Number(formData.serviceNo) === 0 && (
                    <span className="text-red-800 text-xs">
                      "Kindly Enter valid Service No."{" "}
                    </span>
                  )}
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-1 mt-1 border rounded-l-md text-gray-700 flex-grow">
                    {prefix}
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Service No. "
                    className="border p-1 rounded w-full mt-1 flex-grow"
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
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Services</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => setIsSideBarOpen(true)}
          >
            + Add Services
          </button>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-inner ">
          <div className="bg-white">
            <div className="mb-4">
              <table className="min-w-full text-center text-gray-500 font-semibold">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Service Name</th>
                    <th className="px-4 py-2">Unit Price</th>
                    <th className="px-4 py-2">Discount</th>
                    <th className="px-2 py-2">Is Tax Included</th>
                    <th className="px-4 py-2">Total Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedServicesList.length ? (
                    selectedServicesList.map((service) => (
                      <tr key={service.id}>
                        <td className="px-4 py-2">{service.serviceName}</td>
                        <td className="px-4 py-2">₹{service.sellingPrice}</td>
                        <td className="px-4 py-2">
                          {service.discount}
                          {service.discountType ? "%" : "/-"}
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
                        No Service Selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="w-full mt-4 border-t pt-4 bg-gray-50 p-4 ">
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
                  <div>Start Date</div>
                  <input
                    type="date"
                    value={DateFormate(membershipStartDate)}
                    className="border p-2 rounded w-full"
                    onChange={(e) => {
                      setMembershipStartDate(
                        Timestamp.fromDate(new Date(e.target.value))
                      );
                    }}
                  />
                </div>
                <div className="w-full ">
                  <div>Membership Period</div>
                  <select
                    value={membershipPeriod}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMembershipPeriod(value);
                    }}
                    className="border p-2 rounded w-full"
                  >
                    <option value="" disabled>
                      Membership Period
                    </option>
                    <option value="free">Free trial for 15 day</option>
                    <option value="1">1 month</option>
                    <option value="3">3 month</option>
                    <option value="6">6 month</option>
                    <option value="9">9 month</option>
                    <option value="12">12 month</option>
                    <option value="custom">custom</option>
                  </select>
                  {membershipPeriod === "custom" && (
                    <div>
                      <div>Select Custom Date</div>
                      <input
                        type="date"
                        value={DateFormate(membershipEndDate)}
                        onChange={(e) =>
                          setMembershipEndDate(
                            Timestamp.fromDate(new Date(e.target.value))
                          )
                        }
                        className="border p-2 rounded w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="w-full ">
                  <div>Sign</div>
                  <select
                    className="border p-2 rounded w-full"
                    defaultValue={""}
                  >
                    <option value="" disabled>
                      Select Sign
                    </option>
                  </select>
                </div>
                <div className="w-full ">
                  <div>Payment Mode</div>
                  <select
                    className="border p-2 rounded w-full"
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData((val) => ({ ...val, mode: e.target.value }))
                    }
                  >
                    <option value="" disabled>
                      Select Payment Mode
                    </option>
                    <option value="Cash">Cash</option>
                    <option value="Emi">Emi</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                  </select>
                </div>
                <div className="w-full ">
                  <div>Notes</div>
                  <input
                    type="text"
                    placeholder="Notes"
                    className="border p-2 rounded w-full"
                    value={formData?.notes}
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        notes: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="w-full ">
                  <div>Terms</div>
                  <textarea
                    type="text"
                    defaultValue={formData?.terms || ""}
                    className="border p-2 rounded w-full max-h-16 min-h-16"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        terms: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className=" mt-4 border-t pt-4 bg-gray-50 p-4 ">
              <div className="flex justify-between">
                <div className="flex space-x-3 items-center">
                  <div className=""> Extra Discount: </div>
                  <div>
                    <input
                      type="number"
                      value={formData?.extraDiscount || ""}
                      className="border p-2 rounded"
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscount: +e.target.value,
                        }));
                      }}
                    />
                    <select
                      className="border p-2 rounded"
                      value={formData?.extraDiscountType || ""}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscountType:
                            e.target.value == "true" ? true : false,
                        }));
                      }}
                    >
                      <option value="true">%</option>
                      <option value="false">Fixed</option>
                    </select>
                  </div>
                </div>
                <div className=" p-6" style={{ width: "600px" }}>
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
                  {formData.extraDiscount > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Extra Discount Amount</span>
                      <span>
                        ₹
                        {formData.extraDiscountType
                          ? (+totalAmounts.subTotalAmount *
                              formData.extraDiscount) /
                            100
                          : formData.extraDiscount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl mb-2">
                    <span>Total Amount</span>
                    <span>₹ {(totalAmounts?.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white py-1 px-4 rounded-lg flex items-center gap-1"
              onClick={onEditService}
            >
              <span className="text-lg">+</span> Edit service
            </button>
          </div>
        </div>
      </div>
      <SideBarAddServices
        isOpen={isSideBarOpen}
        onClose={() => setIsSideBarOpen(false)}
        servicesList={servicesList}
        onSubmitService={onSelectService}
      />
    </div>
  );
}
export default EditService;
