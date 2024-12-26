
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link, useLocation, useNavigate } from "react-router-dom";
const SettingsView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Link
          to="/invoice"
          className="flex items-center text-gray-700 py-1 px-4 rounded-full hover:bg-gray-200 transition duration-200"
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
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
                  location.pathname === "/user/user-profile"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/user/user-profile");
                }}
              >
                User Profile
              </li>
              <li
                className={`mt-3 font-medium ${
                  location.pathname === "/user/company-profile" ||
                  location.pathname === "/user"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/user/company-profile");
                }}
              >
                Company Profile
              </li>
              <li
                className={`mt-3 font-medium ${
                  location.pathname === "/user/prefix"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => {
                  navigate("/user/prefix");
                }}
              >
                Prefix
              </li>{" "}
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
