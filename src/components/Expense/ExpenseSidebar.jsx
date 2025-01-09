import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";

function ExpenseSidebar({ isModalOpen, onClose, userDataSet, refresh }) {
  const { id } = useParams();
  const { updateData } = isModalOpen;
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
    setFilterUser("Customer");
  }

  useEffect(() => {
    if (updateData?.id) {
      setFormData(updateData);
      setFilterUser(updateData.toWhom.userType);
    }
  }, [updateData]);
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
      if (updateData?.id) {
        await updateDoc(
          doc(db, "companies", companyId, "expenses", updateData.id),
          payload
        );
      } else {
        await addDoc(
          collection(db, "companies", companyId, "expenses"),
          payload
        );
      }
      alert(
        `successfully  ${updateData?.id ? "Edit " : "Create "} ${
          isModalOpen.type
        }`
      );
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
      onClick={() => {
        onClose();
        ResetForm();
      }}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform overflow-y-auto ${
          isModalOpen.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className="text-sm text-gray-600 ">
            {isModalOpen.type.toUpperCase()}
          </h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={() => {
              onClose();
              ResetForm();
            }}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-2 px-5">
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Date <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="date"
                  placeholder="Date"
                  className="input-tag w-full"
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
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Amount <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="Number"
                  placeholder="Amount"
                  className="input-tag w-full"
                  required
                  value={formData.amount || ""}
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
                    (filterUser === "Customer"
                      ? " bg-blue-300 rounded-full"
                      : "")
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
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                {formData.toWhom.userType}
              </label>
              <div>
                <select
                  className="input-tag w-full"
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
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Category</label>
              <div>
                <select
                  className="input-tag w-full"
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
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Remarks</label>
              <div>
                <input
                  type="text"
                  placeholder="Remarks"
                  className="input-tag w-full"
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      remarks: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Receipt</label>
              <div>
                <input
                  type="file"
                  className="flex  h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Mode</label>
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
          <div className="w-full border-t bg-white sticky bottom-0 px-5 py-3">
            <button
              type="submit"
              className="w-full bg-purple-500 text-white px-5 py-3 text-sm text-gray-600 rounded-md"
            >
              Create {isModalOpen.type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
ExpenseSidebar.propTypes = {
  isModalOpen: PropTypes.object,
  onClose: PropTypes.func,
  userDataSet: PropTypes.object,
  refresh: PropTypes.func,
  updateData: PropTypes.object,
};

export default ExpenseSidebar;
