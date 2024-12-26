import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  arrayUnion,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { useSelector } from "react-redux";
import { AiOutlineArrowLeft } from "react-icons/ai";
import SideBarAddServices from "./SideBarAddServices";

function CreateService() {
  const userDetails = useSelector((state) => state.users);

  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const phoneNo = userDetails.phone;

  const [serviceDate, setServiceDate] = useState(new Date());
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [membershipPeriod, setMembershipPeriod] = useState("");
  const [membershipEndDate, setMembershipEndDate] = useState("");
  const [membershipStartDate, setMembershipStartDate] = useState(new Date());
  const [books, setBooks] = useState([]);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    extraDiscount: {
      amount: 0,
      type: "percentage",
    },
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
  const [SelectedServicesList, setSelectedServicesList] = useState([]);

  const [customersData, setCustomersData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState({
    name: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const companyRef = doc(db, "companies", companyDetails.companyId);
        const serviceRef = collection(db, "services");
        const q = query(serviceRef, where("companyRef", "==", companyRef));
        const getData = await getDocs(q);
        const serviceData = getData.docs.map((doc) => {
          const data = doc.data();
          const netAmount =
            +data.pricing.sellingPrice?.amount -
            (+data.pricing.discount?.fieldValue || 0);
          const taxRate = data.pricing.gstTax || 0;
          let sgst = 0;
          let cgst = 0;
          let sgstAmount = 0;
          let cgstAmount = 0;

          sgst = taxRate / 2;
          cgst = taxRate / 2;
          sgstAmount = netAmount * (sgst / 100);
          cgstAmount = netAmount * (cgst / 100);
          return {
            id: doc.id,
            serviceName: data.serviceName || "N/A",
            unitPrice: data.pricing.sellingPrice?.amount ?? 0,
            discount: data.pricing.discount?.fieldValue ?? 0,
            totalAmount: netAmount,
            includingTax: data.pricing.sellingPrice?.includingTax,
            sgst,
            cgst,
            sgstAmount,
            cgstAmount,
            taxAmount: data.pricing.sellingPrice?.taxAmount,
            taxSlab: data.pricing.sellingPrice?.taxSlab,
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
    const fetchServicesNumbers = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "companies", companyDetails.companyId, "services")
        );

        const noList = querySnapshot.docs.map((doc) => doc.data().serviceNo);
        setPreServicesList(noList);
        setFormData((val) => ({
          ...val,
          serviceNo: String(noList.length + 1).padStart(4, 0),
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    async function fetchBooks() {
      try {
        const bookRef = collection(
          db,
          "companies",
          companyDetails.companyId,
          "books"
        );
        const getBookData = await getDocs(bookRef);
        const fetchBooks = getBookData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(fetchBooks);
      } catch (error) {
        console.log("🚀 ~ fetchBooks ~ error:", error);
      }
    }

    // fetchBooks();
    fetchServicesNumbers();
    customerDetails();
    fetchServices();
  }, [companyDetails]);

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

  async function onCreateService() {
    try {
      if (SelectedServicesList.length == 0) {
        return;
      }
      const customerRef = doc(db, "customers", selectedCustomerData.customerId);

      const companyRef = doc(db, "companies", companyDetails.companyId);

      const serviceListPayload = [];
      for (const service of SelectedServicesList) {
        const serviceRef = doc(db, "services", service.id);
        serviceListPayload.push({
          pricing: {
            gstTax: 5,
            servicePrice: {
              amount: service.unitPrice,
              taxAmount: service.totalAmount,
              taxSlab: service.taxSlab,
              includingTax: true,
            },
            discount: {
              amount: service.discount,
              fieldValue: 10,
              type: "Percentage",
            },
          },
          name: service.serviceName,
          serviceRef: serviceRef,
        });
      }

      const payload = {
        ...formData,
        date: Timestamp.fromDate(new Date(serviceDate)),
        createdBy: {
          companyRef: companyRef,
          name: companyDetails.name,
          address: {},
          phoneNo: phoneNo,
        },
        subTotal: +totalAmounts.subTotalAmount,
        total: +totalAmounts.totalAmount,
        customerDetails: {
          gstNumber: "",
          custRef: customerRef,
          address: selectedCustomerData.address,
          phoneNumber: selectedCustomerData.phone,
          name: selectedCustomerData.name,
        },

        servicesList: serviceListPayload,
        membershipStartDate: Timestamp.fromDate(membershipStartDate),
        membershipEndDate,
        typeOfEndMembership: membershipPeriod,
      };
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "services"),
        payload
      );
      if (formData.membershipId) {
        await updateDoc(customerRef, {
          memberships: arrayUnion(formData.membershipId),
        });
      }
      alert("successfully Created Service");
      navigate("/services");
    } catch (err) {
      console.error(err);
    }
  }

  function onSelectService(data) {
    setSelectedServicesList(data);

    // const totalTaxableAmount = data.reduce(
    //   (sum, product) => sum + product.totalAmount,
    //   0
    // );

    let totalTaxableAmount = 0;

    totalTaxableAmount = data.reduce((sum, product) => {
      const cal = sum + (product.totalAmount - product.taxAmount);
      if (!product.includingTax) {
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

    let discountAmount = formData.extraDiscount.amount || 0;
    if (formData.extraDiscount.type === "percentage") {
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

  function onSelectBook(e) {
    const { value } = e.target;
    const data = books.find((ele) => ele.id === value);
    const bookRef = doc(
      db,
      "companies",
      companyDetails.companyId,
      "books",
      value
    );
    setFormData((val) => ({
      ...val,
      book: { id: value, name: data.name, bookRef },
    }));
  }
  useEffect(() => {
    let discountAmount = formData.extraDiscount.amount || 0;
    if (formData.extraDiscount.type === "percentage") {
      discountAmount = (+totalAmounts.subTotalAmount * discountAmount) / 100;
    }
    const totalAmount = +totalAmounts.subTotalAmount - discountAmount;
    setTotalAmounts((val) => ({ ...val, totalAmount }));
  }, [formData.extraDiscount]);

  useEffect(() => {
    function setMembershipDate() {
      if (!membershipStartDate) {
        return;
      }
      const inputDate = new Date(membershipStartDate);
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

  function setCurrentDate(date) {
    if (!date) {
      return;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

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
        <h1 className="text-2xl font-bold">Create Service</h1>
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
                  value={selectedCustomerData?.name}
                  onChange={handleInputChange}
                  onFocus={() => setIsDropdownVisible(true)}
                  onBlur={() => {
                    if (!selectedCustomerData.customerId) {
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
            <div className="grid grid-cols-2 gap-4 bg-pink-50 p-4 rounded-lg">
              <div>
                <label className="text-sm text-gray-600">
                  Service Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={setCurrentDate(serviceDate)}
                  className="border p-1 rounded w-full mt-1"
                  onChange={(e) => {
                    setServiceDate(e.target.value);
                  }}
                  required
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
                <input
                  type="text"
                  placeholder="Enter Service No. "
                  className="border p-1 rounded w-full mt-1"
                  value={formData.serviceNo}
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
                  {SelectedServicesList.length ? (
                    SelectedServicesList.map((service) => (
                      <tr key={service.id}>
                        <td className="px-4 py-2">{service.serviceName}</td>
                        <td className="px-4 py-2">₹{service.unitPrice}</td>
                        <td className="px-4 py-2">₹{service.discount}</td>
                        <td className="px-2 py-2">
                          {service.includingTax ? "Yes" : "No"}
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
                    value={setCurrentDate(membershipStartDate)}
                    className="border p-2 rounded w-full"
                    onChange={(e) => {
                      setMembershipStartDate(new Date(e.target.value));
                    }}
                  />
                </div>
                <div className="w-full ">
                  <div>Membership Period</div>
                  <select
                    defaultValue={membershipPeriod}
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
                {/* <div className="w-full ">
                  <div>Bank/Book</div>
                  <select
                    defaultValue=""
                    onChange={onSelectBook}
                    className="border p-2 rounded w-full"
                  >
                    <option value="" disabled>
                      Select Bank/Book
                    </option>
                    {books.length > 0 &&
                      books.map((book) => (
                        <option value={book.id} key={book.id}>
                          {`${book.name} - ${book.bankName} - ${book.branch}`}
                        </option>
                      ))}
                  </select>
                </div> */}
                <div className="w-full ">
                  <div>Sign</div>
                  <select
                    onChange={() => {}}
                    className="border p-2 rounded w-full"
                  >
                    <option value="" disabled>
                      Select Sign
                    </option>
                  </select>
                </div>

                {/* <div className="w-full ">
                  <div>Attach Files</div>
                  <input
                    type="file"
                    className="flex h-10 w-full rounded-md border border-input
                bg-white px-3 py-2 text-sm text-gray-400 file:border-0
                file:bg-transparent file:text-gray-600 file:text-sm
                file:font-medium"
                  />
                </div> */}
                <div className="w-full ">
                  <div>Payment Mode</div>
                  <select
                    className="border p-2 rounded w-full"
                    onChange={(e) =>
                      setFormData((val) => ({ ...val, mode: e.target.value }))
                    }
                  >
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
                      className="border p-2 rounded"
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscount: {
                            ...val.extraDiscount,
                            amount: +e.target.value,
                          },
                        }));
                      }}
                    />
                    <select
                      className="border p-2 rounded"
                      defaultValue="percentage"
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscount: {
                            ...val.extraDiscount,
                            type: e.target.value,
                          },
                        }));
                      }}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>
                <div className=" p-6" style={{ width: "600px" }}>
                  {totalAmounts.totalTaxableAmount > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Taxable Amount</span>
                      <span>
                        ₹ {totalAmounts.totalTaxableAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {totalAmounts.totalSgstAmount_2_5 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>SGST(2.5%)</span>
                      <span>
                        ₹ {totalAmounts.totalSgstAmount_2_5.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalAmounts.totalCgstAmount_2_5 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>CGST(2.5%)</span>
                      <span>
                        ₹ {totalAmounts.totalCgstAmount_2_5.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalAmounts.totalSgstAmount_6 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>SGST(6%)</span>
                      <span>₹ {totalAmounts.totalSgstAmount_6.toFixed(2)}</span>
                    </div>
                  )}
                  {totalAmounts.totalCgstAmount_6 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>CGST(6%)</span>
                      <span>₹ {totalAmounts.totalCgstAmount_6.toFixed(2)}</span>
                    </div>
                  )}
                  {totalAmounts.totalSgstAmount_9 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>SGST(9%)</span>
                      <span>₹ {totalAmounts.totalSgstAmount_9.toFixed(2)}</span>
                    </div>
                  )}
                  {totalAmounts.totalCgstAmount_9 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>CGST(9%)</span>
                      <span>₹ {totalAmounts.totalCgstAmount_9.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.extraDiscount.amount > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Extra Discount Amount</span>
                      <span>
                        ₹{" "}
                        {formData.extraDiscount.type === "percentage"
                          ? (+totalAmounts.subTotalAmount *
                              formData.extraDiscount.amount) /
                            100
                          : formData.extraDiscount.amount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl mb-2">
                    <span>Total Amount</span>
                    <span>₹ {totalAmounts.totalAmount.toFixed(2)}</span>
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
              onClick={onCreateService}
            >
              <span className="text-lg">+</span> Create service
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
export default CreateService;
