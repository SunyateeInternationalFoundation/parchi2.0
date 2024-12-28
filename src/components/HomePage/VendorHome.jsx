import { Outlet, Route, Routes } from "react-router-dom";
import Approval from "../CustomerDashboard/Approval";
import Navbar from "../UI/Navbar";
import SideBar from "../UI/Sidebar";
import Files from "../VendorDashBoard/Files";
import Projects from "../VendorDashBoard/Projects";
import ProjectView from "../VendorDashBoard/ProjectView";
import VendorPO from "../VendorDashBoard/VendorPO";

function VendorHome() {
  return (
    <div>
      <div style={{ height: "8vh" }}>
        <Navbar />
      </div>
      <div className="flex" style={{ height: "92vh" }}>
        <div>
          <SideBar />
        </div>
        <div style={{ width: "100%", height: "92vh" }} className="bg-gray-100">
          <Routes>
            <Route path="/purchase" element={<VendorPO />}></Route>
            <Route path="/po" element={<VendorPO />}></Route>
            <Route path="/projects" element={<Projects />}></Route>
            <Route path="/projects/:id" element={<ProjectView />} />

            <Route path="/projects/:id/files" element={<Files />}></Route>
            <Route
              path="/projects/:id/approvals"
              element={<Approval />}
            ></Route>
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default VendorHome;
