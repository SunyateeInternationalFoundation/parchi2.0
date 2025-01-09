import { IoMdArrowRoundBack } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SettingsView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Link to="/invoice" className="flex items-center ">
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
          <span className="text-lg font-medium"></span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>
      <div className="flex ml-4" style={{ height: "85vh" }}>
        <div className="w-full">
          <ul className="p-6 space-y-4 cursor-pointer">
            <li className="font-bold text-gray-700">Profile</li>
            <ul className="pl-4 mt-5">
              <li
                className={`mt-3 font-medium ${
                  location.pathname === "/settings/user-profile"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/settings/user-profile");
                }}
              >
                User Profile
              </li>
              <li
                className={`mt-3 font-medium ${
                  location.pathname === "/settings/company-profile" ||
                  location.pathname === "/user"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/settings/company-profile");
                }}
              >
                Company Profile
              </li>
              <li
                className={`mt-3 font-medium ${
                  location.pathname === "/settings/prefix"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/settings/prefix");
                }}
              >
                Prefix
              </li>
              <li
                className={`mt-3 font-medium ${
                  location.pathname === "/settings/subscription-plan"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/settings/subscription-plan");
                }}
              >
                Subscription Plan
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
