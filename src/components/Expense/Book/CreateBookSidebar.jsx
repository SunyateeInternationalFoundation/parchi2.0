import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";

function CreateBookSidebar({ onClose, isOpen, refresh }) {
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [confirmAccount, setConfirmAccount] = useState("");
  const [formData, setFormData] = useState({
    accountNo: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    name: "",
    openingBalance: 0,
    upi: "",
    createdAt: "",
  });

  function resetForm() {
    setFormData({
      accountNo: "",
      ifscCode: "",
      bankName: "",
      branch: "",
      name: "",
      openingBalance: 0,
      upi: "",
      createdAt: "",
    });
  }
  async function onCreateAccount() {
    try {
      const payload = {
        ...formData,
        createdAt: Timestamp.fromDate(new Date()),
      };
      await addDoc(collection(db, "companies", companyId, "books"), payload);
      alert("successfully created Account");
      resetForm();
      refresh();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onCreateAccount ~ error:", error);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className="text-sm text-gray-600 "> Create Account/Book </h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={onClose}
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onCreateAccount}>
          <div className="space-y-3 p-5">
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Book Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Book Name"
                required
                onChange={(e) =>
                  setFormData((val) => ({ ...val, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Opening Balance <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Opening Balance"
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    openingBalance: +e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Bank Name"
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    bankName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Bank Account</label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Bank Account"
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    accountNo: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Confirm Bank Account{" "}
                {confirmAccount !== formData.accountNo && (
                  <span className="text-red-500 text-xs">
                    (AccountNo. Not Match)
                  </span>
                )}
              </label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Confirm Bank Account"
                onChange={(e) => setConfirmAccount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Bank IFSC Code</label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Bank IFSC Code"
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    ifscCode: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Branch Name</label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Branch Name"
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    branch: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                UPI Details (Optional)
              </label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="UPI"
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    upi: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="w-full border-t bg-white sticky bottom-0 px-5 py-3">
            <button
              type="submit"
              className="w-full bg-purple-500 text-white px-5 py-3 text-sm text-gray-600 rounded-md"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBookSidebar;
