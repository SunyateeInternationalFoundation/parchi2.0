import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaUserEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { db, storage } from "../../../firebase";
import { updateCustomerDetails } from "../../../store/CustomerSlice";
import CreateCustomer from "../CreateCustomer";

const Profile = ({ customerData, refresh, expenseData }) => {
  const [isEdit, setIsEdit] = useState(false);

  const [UpdatedData, setUpdatedData] = useState(customerData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.users);

  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.customers;
  useEffect(() => {
    setUpdatedData(customerData);
  }, [customerData]);

  async function onUpdateProfile() {
    try {
      const customersRef = doc(db, "customers", customerData.id);
      const { id, createdAt, companyRef, ...rest } = UpdatedData;
      await updateDoc(customersRef, rest);
      dispatch(
        updateCustomerDetails({
          id,
          createdAt: JSON.stringify(createdAt),
          companyRef: JSON.stringify(companyRef),
          ...rest,
        })
      );
      // refresh();
      alert("Profile updated successfully");
      setIsEdit(false);
    } catch (error) {
      console.log("🚀 ~ onUpdateProfile ~ error:", error);
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const storageRef = ref(storage, `profileImages/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progressPercent =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progressPercent);
          },
          (error) => {
            console.error("Upload failed:", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(storageRef);
            const customersRef = doc(db, "customers", customerData.id);
            await updateDoc(customersRef, { profileImage: downloadURL });
            refresh();
            alert("Profile image updated successfully");
            setProgress(0);
          }
        );
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  function onCancelProfile() {
    setUpdatedData(customerData);
    setIsEdit(false);
  }

  return (
    <div className="main-container">
      {!UpdatedData.id ? (
        <div className="text-gray-500 text-center">Loading customer...</div>
      ) : (
        <div className="container overflow-hidden">
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          <div className="px-5 pb-5">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-1/5">
                {UpdatedData.profileImage ? (
                  <img
                    src={UpdatedData.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <span className="bg-purple-500 text-white w-20 h-20 flex items-center justify-center rounded-full text-2xl shadow-md">
                    {UpdatedData.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="w-full">
                <div className="text-2xl font-semibold">
                  {isEdit ? (
                    <input
                      type="text"
                      value={UpdatedData.name}
                      className="border  border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring focus:ring-purple-200"
                      onChange={(e) =>
                        setUpdatedData((val) => ({
                          ...val,
                          name: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    UpdatedData.name || "N/A"
                  )}
                </div>
                {!isEdit &&
                  (userDetails.selectedDashboard === "staff" ? (
                    role?.edit && (
                      <button
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mt-2"
                        onClick={() => setIsEdit(true)}
                      >
                        <FaUserEdit />
                        <span>Edit Profile</span>
                      </button>
                    )
                  ) : (
                    <button
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mt-2"
                      // onClick={() => setIsEdit(true)}
                      onClick={() => setIsModalOpen(true)}
                    >
                      <FaUserEdit />
                      <span>Edit Profile</span>
                    </button>
                  ))}
                {isEdit && (
                  <input
                    type="file"
                    className="flex mt-3 h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
                    onChange={handleFileChange}
                  />
                )}
              </div>

              <div className="w-full flex space-x-3">
                <div className="bg-green-50 rounded-lg p-5 w-full flex items-center space-x-3">
                  <div className="text-green-500 p-3 bg-sky-100 rounded-lg text-xl">
                    <FaArrowDown />
                  </div>
                  <div>
                    <div className="text-lg">Income</div>
                    <div className="text-3xl text-green-600 font-bold">
                      {expenseData.income}
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-5 w-full flex items-center space-x-3 text-xl">
                  <div className="text-red-500 p-3 bg-sky-100 rounded-lg">
                    <FaArrowUp />
                  </div>
                  <div>
                    <div className="text-lg">Expenses</div>
                    <div className="text-3xl text-red-600 font-bold">
                      {" "}
                      {expenseData.expense}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-700 font-medium mb-2">Contact Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <input
                      type="text"
                      value={UpdatedData.phone || (isEdit ? "" : "N/A")}
                      className={`block w-full border-gray-300 p-2 rounded-md focus:ring focus:ring-purple-200 ${
                        isEdit ? "border" : "bg-gray-100"
                      }`}
                      onChange={(e) =>
                        setUpdatedData((val) => ({
                          ...val,
                          phone: e.target.value,
                        }))
                      }
                      readOnly={!isEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <input
                      type="email"
                      value={UpdatedData.email || (isEdit ? "" : "N/A")}
                      className={`block w-full border-gray-300 p-2 rounded-md focus:ring focus:ring-purple-200 ${
                        isEdit ? "border" : "bg-gray-100"
                      }`}
                      onChange={(e) =>
                        setUpdatedData((val) => ({
                          ...val,
                          email: e.target.value,
                        }))
                      }
                      readOnly={!isEdit}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-gray-700 font-medium mb-2">Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Street</label>
                    <input
                      type="text"
                      value={UpdatedData.address || (isEdit ? "" : "N/A")}
                      className={`block w-full border-gray-300 p-2 rounded-md focus:ring focus:ring-purple-200 ${
                        isEdit ? "border" : "bg-gray-100"
                      }`}
                      onChange={(e) =>
                        setUpdatedData((val) => ({
                          ...val,
                          address: e.target.value,
                        }))
                      }
                      readOnly={!isEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <input
                      type="text"
                      value={UpdatedData.city || (isEdit ? "" : "N/A")}
                      className={`block w-full border-gray-300 p-2 rounded-md focus:ring focus:ring-purple-200 ${
                        isEdit ? "border" : "bg-gray-100"
                      }`}
                      onChange={(e) =>
                        setUpdatedData((val) => ({
                          ...val,
                          city: e.target.value,
                        }))
                      }
                      readOnly={!isEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Pincode</label>
                    <input
                      type="text"
                      value={UpdatedData.zipCode || (isEdit ? "" : "N/A")}
                      className={`block w-full border-gray-300 p-2 rounded-md focus:ring focus:ring-purple-200 ${
                        isEdit ? "border" : "bg-gray-100"
                      }`}
                      onChange={(e) =>
                        setUpdatedData((val) => ({
                          ...val,
                          zipCode: e.target.value,
                        }))
                      }
                      readOnly={!isEdit}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isEdit && (
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  onClick={onCancelProfile}
                >
                  Cancel
                </button>
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  onClick={onUpdateProfile}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <CreateCustomer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        customerData={customerData}
      />
    </div>
  );
};

export default Profile;
