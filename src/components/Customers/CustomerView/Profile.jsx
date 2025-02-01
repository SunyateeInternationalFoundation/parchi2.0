import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaEnvelope,
  FaPen,
  FaPhoneAlt,
} from "react-icons/fa";
import dummy from "../../../assets/dummy.jpeg";
import CreateCustomer from "../CreateCustomer";

const Profile = ({ customerData, expenseData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="main-container" style={{ height: "81vh" }}>
      {!customerData.id ? (
        <div className="text-gray-500 text-center">Loading customer...</div>
      ) : (
        <div className="container p-6">
          <div className="flex items-center justify-end space-x-4">
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
              <div className="w-1/2">
                <div className="flex items-center space-x-6">
                  <div className="relative w-40 h-36 border rounded-lg overflow-hidden">
                    {customerData.profileImage ? (
                      <img
                        src={customerData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="bg-white text-purple-600 w-full h-full flex items-center justify-center text-4xl font-bold">
                        <img
                          src={dummy}
                          alt="Default"
                          className="w-full h-full"
                        />
                      </span>
                    )}
                  </div>

                  {/* Name, Designation, Phone, Email */}
                  <div className="w-full">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-semibold mb-1 break-words max-w-[200px]">
                        {customerData.name
                          ? customerData.name
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
                      <span>{customerData.phone || "N/A"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <FaEnvelope className="text-gray-700" />
                      <span>{customerData.email || "N/A"}</span>
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
                  <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                    {customerData.id || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Pan</label>
                  <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                    {customerData.panNumber || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gst</label>
                  <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                    {customerData.gstNumber || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gray-700 font-medium mb-2">Address</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Street</label>
                  <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                    {customerData.address || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">City</label>
                  <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                    {customerData.city || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Pincode</label>
                  <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                    {customerData.zipCode || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing */}
      <CreateCustomer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerData={customerData}
      />
    </div>
  );
};

export default Profile;
