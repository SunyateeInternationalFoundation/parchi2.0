import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaEnvelope,
  FaPen,
  FaPhoneAlt,
} from "react-icons/fa";
import dummy from "../../../assets/dummy.jpeg";
import CreateVendor from "../CreateVendor";

const VendorProfile = ({ vendorData, refresh, expenseData }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="main-container">
      {vendorData.id ? (
        <div className="container2 p-6">
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          <div className="flex items-center justify-end space-x-4 ">
            <button
              className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg  hover:bg-gray-100 transition border border-gray-300"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPen className="text-purple-600 text-sm" />
              <span className="text-sm text-gray-700 font-medium">Edit</span>
            </button>
          </div>

          <div className="bg-white text-gray-900 p-4 mb-6 border-b">
            <div className="flex justify-between">
              {/* Profile Section - Half Width */}
              <div className="w-1/2">
                <div className="flex items-center space-x-10">
                  {/* Profile Image with Edit Icon */}
                  <div className="relative w-40 h-36 border rounded-lg overflow-hidden">
                    {vendorData.profileImage ? (
                      <img
                        src={vendorData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="bg-white text-purple-600 w-full h-full flex items-center justify-center text-4xl font-bold">
                        <img
                          src={dummy} // ensure `dummy` is defined
                          alt="Default"
                          className="w-full h-full"
                        />
                      </span>
                    )}
                  </div>

                  {/* Name, Designation, Phone, Email */}
                  <div className="w-full">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-semibold mb-2.5 break-words max-w-[200px]">
                        {vendorData.name
                          ? vendorData.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : "N/A"}
                      </h2>
                    </div>
                    <p className="mt-2 flex items-center space-x-2">
                      <FaPhoneAlt className="text-gray-700" />
                      <span>{vendorData.phone || "N/A"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <FaEnvelope className="text-gray-700" />
                      <span>{vendorData.email || "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Income and Expense - Half Width with Fixed Width */}
              <div className="w-1/2 flex space-x-6 mb-6">
                {/* Income Box */}
                <div className="bg-green-50 rounded-lg p-5 flex items-center space-x-3 w-1/2">
                  <div className="text-green-500 p-3 bg-sky-100 rounded-lg text-xl">
                    <FaArrowDown />
                  </div>
                  <div>
                    <div className="text-lg">Income</div>
                    <div className="text-3xl text-green-600 font-bold">
                      {expenseData.income.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Expense Box */}
                <div className="bg-red-50 rounded-lg p-5 flex items-center space-x-3 w-1/2">
                  <div className="text-red-500 p-3 bg-sky-100 rounded-lg text-xl">
                    <FaArrowUp />
                  </div>
                  <div>
                    <div className="text-lg">Expenses</div>
                    <div className="text-3xl text-red-600 font-bold">
                      {expenseData.expense.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Personal Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Id</label>
                  <input
                    type="text"
                    value={vendorData.id || "N/A"}
                    className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200"
                    disabled={!isEdit}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Pan</label>
                  <input
                    type="text"
                    value={vendorData.panNumber || "N/A"}
                    className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200"
                    disabled={!isEdit}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gst</label>
                  <input
                    type="email"
                    value={vendorData.gstNumber || "N/A"}
                    className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200"
                    disabled={!isEdit}
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
                    value={vendorData.address || "N/A"}
                    className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200"
                    disabled={!isEdit}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">City</label>
                  <input
                    type="text"
                    value={vendorData.city || "N/A"}
                    className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200"
                    disabled={!isEdit}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Pincode</label>
                  <input
                    type="text"
                    value={vendorData.zipCode || "N/A"}
                    className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200"
                    disabled={!isEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading vendor...</div>
        </div>
      )}

      <CreateVendor
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onVendorAdded={refresh}
        vendorData={vendorData}
      />
    </div>
  );
};

export default VendorProfile;
