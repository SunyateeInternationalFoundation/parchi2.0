import React, { useState } from "react";
import { FaBolt, FaBell, FaBullhorn, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  setUserLogin,
  setUserLogout,
  updateUserDetails,
} from "../../store/UserSlice";
import SunyaLogo from "../../assets/SunyaLogo.jpg";
import { IoMdSettings } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FaStore } from "react-icons/fa";
import { IoBusiness } from "react-icons/io5";

const Navbar = ({ selectedCompany, companyDetails, isStaff }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.users);
  let companiesList = userDetails.companies;

  let companyName =
    userDetails.companies[userDetails.selectedCompanyIndex].name;

  if (isStaff) {
    companiesList = companyDetails ?? [];
    companyName = selectedCompany ?? "";
  }

  function onSwitchCompany(index) {
    const payload = { ...userDetails, selectedCompanyIndex: index };
    dispatch(setUserLogin(payload));
    setIsCompanyOpen(false);
  }

  // Updated to accept dashboardValue directly instead of event
  function onSwitchDashboard(dashboardValue) {
    const payload = { ...userDetails, selectedDashboard: dashboardValue };
    dispatch(setUserLogin(payload));
    navigate("/" + dashboardValue);
    setIsDashboardOpen(false);
  }

  const navigate = useNavigate();

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      name: userDetails.name,
      email: userDetails.email,
      phone: userDetails.phone,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserDetails(editForm));
    setIsEditing(false);
    setIsProfileOpen(false);
  };

  const dashboardOptions = [
    {
     value: "",
      label: "Business Dashboard",
      icon: <IoBusiness  className="text-gray-500" size={24} />,
      description: "Select dashboard to view"
    },
    {
      value: "customer",
      label: "Customer Dashboard",
      icon: <RiCustomerService2Fill className="text-blue-500" size={24} />,
      description: "Manage customer relationships"
    },
    {
      value: "vendor",
      label: "Vendor Dashboard",
      icon: <FaStore className="text-green-500" size={24} />,
      description: "Handle vendor operations"
    },
    {
      value: "staff",
      label: "Staff Dashboard",
      icon: <HiUsers className="text-purple-500" size={24} />,
      description: "Staff management portal"
    }
  ];

  return (
    <>
      <header className="border-b border-gray-300" style={{ height: "8vh" }}>
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-6">
            <Link href="#" className="flex items-center m-3">
              <div>
                <img src={SunyaLogo} width={100} alt="logo" height={100} />
              </div>
            </Link>

            <div
  className="flex items-center space-x-4 group relative cursor-pointer"
  onClick={() => setIsCompanyOpen(!isCompanyOpen)}
>
  {/* Company Initials Circle */}
  <div className="bg-orange-400 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full border border-gray-500 shadow-lg group-hover:shadow-gray-500/50 transition-shadow duration-300">
    {companyName?.slice(0, 2).toUpperCase() || "YB"}
  </div>

  {/* Company Name */}
  <div>
    <span className="font-bold text-gray-800 text-sm group-hover:text-gray-500 transition-colors duration-300">
      {companyName}
    </span>
  </div>

  {/* Tooltip */}
  <div className="absolute z-10 left-0 top-12 w-max px-3 py-2 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transform group-hover:translate-y-1 transition-all duration-300">
    Change Company
  </div>
</div>


            <div 
              className="relative group cursor-pointer text-black px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {userDetails.selectedDashboard ? 
                    dashboardOptions.find(opt => opt.value === userDetails.selectedDashboard)?.label : 
                    "Select Dashboard"
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {userDetails.selectedDashboard === "staff" && (
            <div> You Logged as a Staff in {selectedCompany}'s Company</div>
          )}
          
          <div className="flex items-center">
            <button
              type="button"
              className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
            >
              <FaBolt className="text-gray-600" size={16} />
              <div className="absolute z-10 left-1/2 transform -translate-x-1/2 top-8 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                Create
              </div>
            </button>

            <button
              type="button"
              className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
            >
              <FaBell className="text-gray-600" size={16} />
              <div className="absolute z-10 left-1/2 transform -translate-x-1/2 top-8 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                Notifications
              </div>
            </button>

            <button
              type="button"
              className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
            >
              <FaBullhorn className="text-gray-600" size={16} />
              <div className="absolute z-10 left-1/2 transform -translate-x-1/2 top-8 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                Announcements
              </div>
            </button>

            {userDetails.selectedDashboard !== "staff" && (
              <button
                type="button"
                className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <FaUserCircle className="text-gray-600" size={16} />
                <div className="absolute z-10 left-1/2 transform -translate-x-1/2 top-8 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                  Profile
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {isDashboardOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-20"
          onClick={() => setIsDashboardOpen(false)}
        >
          <div
            className="w-96 bg-white shadow-2xl rounded-2xl ml-40"
            style={{ marginTop: "8vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Switch Dashboard</h3>
              <div className="space-y-1">
                {dashboardOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-2 p-2 rounded-xl cursor-pointer transition-all duration-300 
                      ${userDetails.selectedDashboard === option.value ? 
                        'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500' : 
                        'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    onClick={() => onSwitchDashboard(option.value)}
                  >
                    <div className="p-2 rounded-lg bg-white shadow-md">
                      {option.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{option.label}</h4>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    {userDetails.selectedDashboard === option.value && (
                      <div className="ml-auto">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {isProfileOpen && (
        <div
          className="fixed pr-2 flex items-start justify-end inset-0 bg-black bg-opacity-10 z-20"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="w-80 bg-white shadow-2xl rounded-lg p-4 text-sm"
            style={{ marginTop: "8vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="flex space-x-3 items-center ">
                  <div className="w-12 ">Name: </div>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    placeholder="Name"
                  />
                </div>
                <div className="flex space-x-3 items-center">
                  <label className="w-12 ">Email: </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    placeholder="Email"
                  />
                </div>
                <div className="flex space-x-3 items-center">
                  <label className="w-12 ">Phone: </label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    placeholder="Phone"
                  />
                </div>

                <div className="flex space-x-2 ">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white w-full rounded py-2"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 w-full rounded py-2"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="pb-2 space-y-2">
                  <div>{userDetails.name}</div>
                  <div>FREE</div>
                </div>
                <hr />
                <div className="py-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span>{userDetails.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span>{userDetails.email}</span>
                  </div>
                </div>
                <button
                  className="bg-sky-200 rounded w-full p-2 my-2"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </button>
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-black my-2"
                  onClick={() => {
                    navigate("/user");
                    setIsProfileOpen(false);
                  }}
                >
                  <IoMdSettings />
                  <span>Settings</span>
                </button>
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-black my-2"
                  onClick={() => {
                    dispatch(setUserLogout());
                  }}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {isCompanyOpen && (
  <div
    className="fixed pr-3 pl-40 inset-0 bg-black bg-opacity-10 z-20"
    onClick={() => setIsCompanyOpen(false)}
    onWheel={() => setIsCompanyOpen(false)}
  >
    <div
      className="w-64 bg-white shadow-2xl rounded-lg"
      style={{ marginTop: "8vh" }}
    >
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-3">
          {companiesList?.length > 0 &&
            companiesList.map((company, index) => (
              <div
                key={company.companyId}
                className="flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-blue-100 rounded-lg"
                onClick={() => {
                  if (!isStaff) {
                    navigate("/");
                    onSwitchCompany(index);
                  }
                }}
              >
                <div className="bg-orange-400 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full border border-gray-500">
                  {company.name?.slice(0, 2).toUpperCase() || "YB"}
                </div>
                <span className="mt-2 text-center text-sm font-medium text-gray-800">
                  {company.name}
                </span>
              </div>
            ))}
          {/* Add Company Section */}
          {!isStaff && (
            <div className="col-span-2 flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-blue-100 rounded-lg border border-dashed border-gray-300">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-2">
                <span className="text-lg text-gray-600">+</span>
              </div>
              <span className="text-sm text-gray-600 font-medium tracking-tight">Add Another Company</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default Navbar;
