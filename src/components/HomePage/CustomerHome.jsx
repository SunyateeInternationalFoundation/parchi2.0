import React from "react";
import Navbar from "../UI/Navbar";
import SideBar from "../UI/Sidebar";
import { Outlet, Route, Routes } from "react-router-dom";
import Invoice from "../CustomerDashboard/Invoice";
import Quotations from "../CustomerDashboard/Quotations";
import Projects from "../CustomerDashboard/Projects";
import ProjectView from "../CustomerDashboard/ProjectView";
import Files from "../CustomerDashboard/Files";
import Approval from "../CustomerDashboard/Approval";
import Settings from "../Settings/Settings";

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
