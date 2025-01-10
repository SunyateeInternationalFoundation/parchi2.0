import {
  addDoc,
  collection,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase";

function PaymentSidebar({ isModalOpen, onClose, userDataSet, refresh }) {
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

      const projectRef = doc(db, "projects", id);

      let bookRef;

      const docSnap = await getDoc(projectRef);

      if (docSnap.exists()) {
        bookRef = docSnap.data()?.book?.bookRef || null;
      }

      const payload = {
        ...formData,
        companyRef,
        bookRef,
        projectRef,
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
        className={`bg-white w-[370px] p-4 transform transition-transform overflow-y-auto max-h-screen ${
          isModalOpen.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold mb-4">
            {isModalOpen.type.toUpperCase()}
          </h2>
          <button
            className="text-2xl mb-4"
            onClick={() => {
              onClose();
              ResetForm();
            }}
          >
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
              <label
                htmlFor="file"
                className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
              >
                <div className="flex  items-center justify-center gap-1">
                  <svg viewBox="0 0 640 512" className="h-8 fill-gray-600">
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                  <span className="py-1 px-4">Upload Image</span>
                </div>
                <input id="file" type="file" className="hidden" />
              </label>
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
PaymentSidebar.propTypes = {
  isModalOpen: PropTypes.object,
  onClose: PropTypes.func,
  userDataSet: PropTypes.object,
  refresh: PropTypes.func,
};

export default PaymentSidebar;
