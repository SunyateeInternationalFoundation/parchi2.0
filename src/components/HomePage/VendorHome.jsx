import { Outlet, Route, Routes } from "react-router-dom";
import Navbar from "../UI/Navbar";
import Projects from "../VendorDashBoard/Projects";
import ProjectViewHome from "../VendorDashBoard/ProjectViewHome";
import Purchase from "../VendorDashBoard/Purchase";
import VendorPO from "../VendorDashBoard/VendorPO";
import VendorDashboard from "./VendorDashboard";

function VendorHome() {
  return (
    <div>
      <div style={{ height: "8vh" }}>
        <Navbar />
      </div>
      <div style={{ width: "100%", height: "94vh" }} className="bg-gray-100">
        <Routes>
          <Route path="/" element={<VendorDashboard />}></Route>
          <Route path="/purchase" element={<Purchase />}></Route>
          <Route path="/po" element={<VendorPO />}></Route>
          <Route path="/projects" element={<Projects />}></Route>
          <Route path="/projects/:id" element={<ProjectViewHome />} />

          {/* <Route path="/projects/:id/files" element={<Files />}></Route>
            <Route
              path="/projects/:id/approvals"
              element={<Approval />}
            ></Route> */}
        </Routes>
        <Outlet />
      </div>
    </div>
  );
}

export default VendorHome;
