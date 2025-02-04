import { useState } from "react";
import { FaEnvelope, FaPen, FaPhoneAlt } from "react-icons/fa";
import dummy from "../../../../assets/dummy.jpeg";
import CreateStaff from "../CreateStaff";

const Profile = ({ staffData, refresh }) => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      {!staffData.id ? (
        <div className="text-gray-500 text-center">Loading staff...</div>
      ) : (
        <div className="container2 p-6">
          <div className="flex items-center justify-end space-x-4">
            <span
              className={`text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm border flex items-center justify-center ${
                staffData.status === "Active"
                  ? "bg-green-100 text-green-600 border-green-300"
                  : "bg-red-100 text-red-600 border-red-300"
              }`}
            >
              {staffData.status === "Active" ? "Active" : "Inactive"}
            </span>
            <button
              className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg  hover:bg-gray-100 transition border border-gray-300"
              onClick={() => setIsSideBarOpen(true)}
            >
              <FaPen className="text-purple-600 text-sm" />
              <span className="text-sm text-gray-700 font-medium">Edit</span>
            </button>
          </div>

          {/* Profile Section */}
          <div className="bg-white text-gray-900 p-4 border-b mb-6 ">
            <div className="flex items-center space-x-10">
              {/* Profile Image with Edit Icon */}
              <div className="relative w-40 h-36 border rounded-lg overflow-hidden">
                {staffData.profileImage ? (
                  <img
                    src={staffData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="bg-white text-purple-600 w-full h-full flex items-center justify-center text-4xl font-bold">
                    <img src={dummy} alt="Default" className="w-full h-full " />
                  </span>
                )}
              </div>

              {/* Name, Designation, Phone, Email */}
              <div className="w-full">
                <div className="flex items-center space-x-3 ">
                  <h2 className="text-2xl font-semibold mb-2.5 break-words max-w-[200px]">
                    {staffData.name
                      ? staffData.name
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      : "N/A"}
                  </h2>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium shadow-sm flex items-center justify-center">
                    {staffData.designation || "N/A"}
                  </span>
                </div>
                <p className="mt-2 flex items-center space-x-2">
                  <FaPhoneAlt className="text-gray-700" />
                  <span>{staffData.phone || "N/A"}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <FaEnvelope className="text-gray-700" />
                  <span>{staffData.emailId || "N/A"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Single Container for Columns */}
          <div className="bg-white px-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Personal Info */}
              <div>
                <h3 className="text-gray-700 font-medium mb-2">
                  Personal Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">ID</label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                      {" "}
                      {staffData.idNo || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Joining Date
                    </label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                      {" "}
                      {staffData.dateOfJoining
                        ? new Date(
                            staffData.dateOfJoining.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">PAN</label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                      {staffData.panNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Payment Details
                    </label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">{`${
                      staffData.isDailyWages ? "Daily Pay" : "Monthly Pay"
                    }`}</div>
                    <div>
                      <label className="text-sm text-gray-500">Branch</label>
                      <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                        {staffData.branch || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column: Address */}
              <div>
                <h3 className="text-gray-700 font-medium mb-2">Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Address</label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                      {staffData.address || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                      {staffData.city || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Pincode</label>
                    <div className="block w-full border border-gray-300 p-2 rounded-md bg-white focus:ring focus:ring-purple-200">
                      {staffData.zipCode || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Editing */}
      {isSideBarOpen && (
        <CreateStaff
          isOpen={isSideBarOpen}
          onClose={() => setIsSideBarOpen(false)}
          staffAdded={refresh}
          staffData={staffData}
        />
      )}
    </div>
  );
};

export default Profile;
