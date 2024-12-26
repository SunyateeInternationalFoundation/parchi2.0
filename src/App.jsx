import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import CustomerHome from "./components/HomePage/CustomerHome";
import Home from "./components/HomePage/Home";
import StaffHome from "./components/HomePage/StaffHome";
import VendorHome from "./components/HomePage/VendorHome";
import LandingPage from "./components/LandingPage/LandingPage";

function App() {
  const usersDetails = useSelector((state) => state.users);
  const isAuthenticated = usersDetails.isLogin;
  const isCompanyProfileDone = usersDetails.isCompanyProfileDone;
  console.log("🚀 ~ App ~ isAuthenticated:", isAuthenticated)
  console.log("🚀 ~ App ~ isCompanyProfileDone:", isCompanyProfileDone)
  return (
    <div>
      <Routes>
        {(!isAuthenticated || !isCompanyProfileDone) && <Route path="/" element={<LandingPage />}></Route>}
        {isAuthenticated && usersDetails.selectedDashboard === "" && (
          <Route path="/*" element={<Home />}></Route>
        )}
        {isAuthenticated && usersDetails.selectedDashboard === "customer" && (
          <Route path="/customer/*" element={<CustomerHome />}></Route>
        )}
        {isAuthenticated && usersDetails.selectedDashboard === "vendor" && (
          <Route path="/vendor/*" element={<VendorHome />}></Route>
        )}
        {isAuthenticated && usersDetails.selectedDashboard === "staff" && (
          <Route path="/staff/*" element={<StaffHome />}></Route>
        )}
      </Routes>
    </div>
  );
}

export default App;
