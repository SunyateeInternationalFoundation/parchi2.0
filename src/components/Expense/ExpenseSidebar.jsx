import { addDoc, collection, doc, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";

function ExpenseSidebar({ isModalOpen, onClose, userDataSet, refresh }) {
  const { id } = useParams();
  const [filterUser, setFilterUser] = useState("Customer");
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [formData, setFormData] = useState({
    amount: 0,
    bookRef: "",
    category: "",
    companyRef: "",
    date: Timestamp.fromDate(new Date()),
    paymentMode: "",
    projectRef: "",
    remarks: "",
    toWhom: {
      userType: "Customer",
      address: "",
      city: "",
      zipcode: "",
      gstNumber: 0,
      name: "",
      phoneNumber: "",
      userRef: "",
    },
    transactionType: isModalOpen.type,
  });

  const categories = [
    "Food",
    "Advertising",
    "Travel",
    "Education",
    "Health",
    "Insurance",
    "Telephone",
    "Bank fees",
    "Maintenance",
    "Legal & Professional",
    "Utilities",
    "Stationary",
    "Rent",
    "Printing",
    "Raw Material",
    "Licenses",
    "Petty Cash",
    "Furniture",
    "Fixed Assets",
    "Others",
  ];

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getFullYear}-${getMonth}-${getDate}`;
  }

  function onHandleSelectUser(e) {
    const { value } = e.target;
    let data = {};
    let userRef = {};
    if (formData.toWhom.userType === "Vendor") {
      data = userDataSet.vendors.find((ele) => ele.id === value);
      userRef = doc(db, "vendors", value);
    } else if (formData.toWhom.userType === "Customer") {
      data = userDataSet.customers.find((ele) => ele.id === value);
      userRef = doc(db, "customers", value);
    } else if (formData.toWhom.userType === "Staff") {
      data = userDataSet.staff.find((ele) => ele.id === value);
      userRef = doc(db, "staff", value);
    }
    const userData = {
      address: data?.address.address || "",
      city: data?.address.city || "",
      zipcode: data?.address.zipcode || "",
      gstNumber: data?.businessDetails?.gst_number || 0,
      name: data.name,
      phoneNumber: data?.phone || 0,
      userRef,
    };
    setFormData((val) => ({
      ...val,
      toWhom: { ...formData.toWhom, ...userData },
    }));
  }

  function ResetForm() {
    setFormData({
      amount: 0,
      bookRef: "",
      category: "",
      companyRef: "",
      date: Timestamp.fromDate(new Date()),
      paymentMode: "",
      projectRef: "",
      remarks: "",
      toWhom: {
        userType: "Customer",
        address: "",
        city: "",
        zipcode: "",
        gstNumber: 0,
        name: "",
        phoneNumber: "",
        userRef: "",
      },
      transactionType: isModalOpen.type,
    });
  }

  async function onSubmit() {
    try {
      const companyRef = doc(db, "companies", companyId);
      const bookRef = doc(db, "companies", companyId, "books", id);
      const payload = {
        ...formData,
        companyRef,
        bookRef,
        transactionType: isModalOpen.type,
      };
      await addDoc(collection(db, "companies", companyId, "expenses"), payload);
      alert("successfully Created " + isModalOpen.type);
      ResetForm();
      refresh();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isModalOpen.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-[370px] p-4 transform transition-transform overflow-y-auto max-h-screen ${
          isModalOpen.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold mb-4">
            {isModalOpen.type.toUpperCase()}
          </h2>
          <button className="text-2xl mb-4" onClick={onClose}>
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <div>Date *</div>
            <div>
              <input
                type="date"
                placeholder="Date"
                className="w-full p-2 border-2 rounded-lg focus:outline-none"
                value={DateFormate(formData.date)}
                required
                onChange={(e) => {
                  setFormData((val) => ({
                    ...val,
                    date: Timestamp.fromDate(new Date(e.target.value)),
                  }));
                }}
              />
            </div>
          </div>
          <div>
            <div>Amount *</div>
            <div>
              <input
                type="Number"
                placeholder="Amount"
                className="w-full p-2 border-2 rounded-lg focus:outline-none"
                required
                onChange={(e) => {
                  setFormData((val) => ({
                    ...val,
                    amount: +e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>Whom? </div>
            <div>
              <button
                className={
                  "px-4 py-1" +
                  (filterUser === "Customer" ? " bg-blue-300 rounded-full" : "")
                }
                onClick={() => {
                  setFilterUser("Customer");
                  setFormData((val) => ({
                    ...val,
                    toWhom: { ...formData.toWhom, userType: "Customer" },
                  }));
                }}
              >
                Customer
              </button>
              <button
                className={
                  "px-4 py-1" +
                  (filterUser === "Vendor" ? " bg-blue-300 rounded-full" : "")
                }
                onClick={() => {
                  setFilterUser("Vendor");
                  setFormData((val) => ({
                    ...val,
                    toWhom: { ...formData.toWhom, userType: "Vendor" },
                  }));
                }}
              >
                Vendor
              </button>
              <button
                className={
                  "px-4 py-1" +
                  (filterUser === "Staff" ? " bg-blue-300 rounded-full" : "")
                }
                onClick={() => {
                  setFilterUser("Staff");
                  setFormData((val) => ({
                    ...val,
                    toWhom: { ...formData.toWhom, userType: "Staff" },
                  }));
                }}
              >
                Staff
              </button>
            </div>
          </div>
          <div>
            <div>{formData.toWhom.userType}</div>
            <div>
              <select
                className="w-full p-2 border-2 rounded-lg focus:outline-none"
                value={formData.toWhom.userRef.id || ""}
                required
                onChange={onHandleSelectUser}
              >
                <option disabled value="">
                  select {formData.toWhom.userType}
                </option>
                {formData.toWhom.userType === "Customer" &&
                  userDataSet.customers.map((ele) => (
                    <option value={ele.id} key={ele.id}>
                      {ele.name + " - " + ele.phone}
                    </option>
                  ))}
                {formData.toWhom.userType === "Vendor" &&
                  userDataSet.vendors.map((ele) => (
                    <option value={ele.id} key={ele.id}>
                      {ele.name + " - " + ele.phone}
                    </option>
                  ))}
                {formData.toWhom.userType === "Staff" &&
                  userDataSet.staff.map((ele) => (
                    <option value={ele.id} key={ele.id}>
                      {ele.name + " - " + ele.phone}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <div>Category</div>
            <div>
              <select
                className="w-full p-2 border-2 rounded-lg focus:outline-none"
                defaultValue=""
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    category: e.target.value,
                  }))
                }
              >
                <option disabled value={""}>
                  select Category
                </option>
                {categories.map((ele, index) => (
                  <option key={index}>{ele}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div>Remarks</div>
            <div>
              <input
                type="text"
                placeholder="Remarks"
                className="w-full p-2 border-2 rounded-lg focus:outline-none"
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    remarks: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <div>Receipt</div>
            <div>
              <input
                type="file"
                className="flex  h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
              />
            </div>
          </div>
          <div>
            <div>Mode</div>
            <select
              className="border p-2 rounded w-full"
              value={formData.paymentMode || ""}
              onChange={(e) =>
                setFormData((val) => ({
                  ...val,
                  paymentMode: e.target.value,
                }))
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
        </div>
        <button
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded w-full"
          onClick={onSubmit}
        >
          Create {isModalOpen.type}
        </button>
      </div>
    </div>
  );
}

export default ExpenseSidebar;
