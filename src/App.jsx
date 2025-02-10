import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import CustomerHome from "./components/HomePage/CustomerHome";
import Home from "./components/HomePage/Home";
import StaffHome from "./components/HomePage/StaffHome";
import VendorHome from "./components/HomePage/VendorHome";
import LandingPage from "./components/LandingPage/LandingPage";
import TemplateView from "./components/Templates/TemplateView";

function App() {
  const usersDetails = useSelector((state) => state.users);
  const isAuthenticated = usersDetails.isLogin;
  const isCompanyProfileDone = usersDetails.isCompanyProfileDone;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      isAuthenticated &&
      isCompanyProfileDone &&
      usersDetails.selectedDashboard !== "" &&
      location.pathname == "/"
    ) {
      navigate(usersDetails.selectedDashboard);
    } else if (!isAuthenticated || !isCompanyProfileDone) {
      navigate("/");
    }
  }, [usersDetails.selectedDashboard]);
  return (
    <div>
      <Routes>
        {(!isAuthenticated || !isCompanyProfileDone) && (
          <Route path="/" element={<LandingPage />}></Route>
        )}
        {isAuthenticated && usersDetails.selectedDashboard === "" && (
          <>
            <Route path="/*" element={<Home />}></Route>

          </>
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
        {isAuthenticated && <Route path="/template/:templateId" element={<TemplateView />} />}
      </Routes>
    </div>
  );
}

export default App;
