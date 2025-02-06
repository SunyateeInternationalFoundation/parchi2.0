import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SunyaLogo from "../../assets/SunyaLogo.jpg";
import circleUser from "../../assets/dashboard/circleUser.png";
import notification from "../../assets/dashboard/notification.png";
import {
  setUserLogout
} from "../../store/UserSlice";
import SelectDashboard from "./SelectDashboard";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.users);
  let companiesList = userDetails?.companies;
  let companyName =
    companiesList &&
    userDetails.companies[userDetails.selectedCompanyIndex]?.name;

  if (userDetails.selectedDashboard == "staff") {
    companiesList =
      userDetails.asAStaffCompanies.map((ele) => ele.companyDetails) ?? [];
    companyName =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        ?.companyDetails.name ?? "";
  }


  const navigate = useNavigate();


  return (
    <>
      <header className="border-b border-gray-300" style={{ height: "8vh" }}>
        <div className="flex items-center justify-between px-10 w-full">
          <div className="flex items-center space-x-6">
            <Link href="#" className="flex items-center m-3">
              <div>
                <img src={SunyaLogo} width={100} alt="logo" height={100} className="mix-blend-multiply" />
              </div>
            </Link>
          </div>
          {userDetails.selectedDashboard === "staff" && (
            <div> You Logged as a Staff in {companyName}'s Company</div>
          )}
          <div className="flex items-center">

            <div
              className="flex items-center space-x-4 group relative cursor-pointer"
              onClick={() => setIsCompanyOpen(!isCompanyOpen)}
            >
              {/* Company Initials Circle */}
              <div className="bg-orange-400 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full border hover:shadow">
                {companyName?.slice(0, 2).toUpperCase() || "YB"}
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-800 text-sm group-hover:text-gray-500 transition-colors duration-300">
                  {companyName}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <button
              type="button"
              className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
            >
              <img src={notification} width={30} alt="user" height={30} />
            </button>
            {userDetails.selectedDashboard !== "staff" && (
              <button
                type="button"
                className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img src={circleUser} width={30} alt="user" height={30} />
              </button>
            )}
          </div>
        </div>
      </header>

      <SelectDashboard
        isOpen={isCompanyOpen}
        onClose={() => setIsCompanyOpen(false)}
        companiesList={companiesList}
      />
      {isProfileOpen && (
        <div
          className="fixed pr-2 flex items-start justify-end inset-0 bg-black bg-opacity-10"
          style={{ zIndex: 999 }}
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="w-80 bg-white shadow-2xl rounded-lg p-4 text-sm"
            style={{ marginTop: "8vh" }}
            onClick={(e) => e.stopPropagation()}
          >

            <div className="pb-2 space-y-2">
              <div>{userDetails.name}</div>
              {/* <div>FREE</div> */}
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
            {/* <button
                  className="bg-sky-200 rounded w-full p-2 my-2"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </button> */}
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-black my-2"
              onClick={() => {
                navigate("/settings/user-profile");
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
                navigate("/");
              }}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
