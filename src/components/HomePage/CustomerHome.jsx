
import { Outlet, Route, Routes } from "react-router-dom";
import Approval from "../CustomerDashboard/Approval";
import Files from "../CustomerDashboard/Files";
import Invoice from "../CustomerDashboard/Invoice";
import Projects from "../CustomerDashboard/Projects";
import ProjectView from "../CustomerDashboard/ProjectView";
import Quotations from "../CustomerDashboard/Quotations";
import Settings from "../Settings/Settings";
import Navbar from "../UI/Navbar";
import SideBar from "../UI/Sidebar";

function CustomerHome() {
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
            <Route path="/invoice" element={<Invoice />}></Route>
            <Route path="/quotation" element={<Quotations />}></Route>
            <Route path="/projects" element={<Projects />}></Route>
            <Route path="/projects/:id" element={<ProjectView />} />
            <Route path="/projects/:id/files" element={<Files />}></Route>
            <Route
              path="/projects/:id/approvals"
              element={<Approval />}
            ></Route>
            <Route path="/user" element={<Settings />}></Route>
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default CustomerHome;
