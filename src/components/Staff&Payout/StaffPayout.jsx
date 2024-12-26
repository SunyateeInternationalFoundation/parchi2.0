import React from "react";
import { GrDocumentUser } from "react-icons/gr";
import { HiOutlineClipboardList } from "react-icons/hi";
import { IoMdTime } from "react-icons/io";
import {
  RiShieldUserLine,
  RiUserAddLine,
  RiUserFollowLine,
} from "react-icons/ri";
import { TbGitBranch } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function StaffPayout() {
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.users);

  const ManageStaff = [
    {
      icon: <RiUserAddLine />,
      name: "Staff",
      totalLabelName: "Total Staff",
      onClick: () => {
        navigate("staff");
      },
    },
    {
      icon: <RiUserFollowLine />,
      name: "Attendance",
      totalLabelName: "Total Projects",
      onClick: () => {
        navigate("attendance");
      },
    },
    // {
    //   icon: <MdAddCard />,
    //   name: "Payouts",
    //   totalLabelName: "Total Staff",
    //   onClick: () => {},
    // },
    {
      icon: <GrDocumentUser />,
      name: "Designations",
      totalLabelName: "Total Projects",
      onClick: () => {
        navigate("designations");
      },
    },
    {
      icon: <TbGitBranch />,
      name: "Branch",
      totalLabelName: "Total Staff",
      onClick: () => {
        navigate("branches");
      },
    },
    {
      icon: <IoMdTime />,
      name: "Week off",
      totalLabelName: "Total Projects",
      onClick: () => {
        navigate("weekOff");
      },
    },
    {
      icon: <RiShieldUserLine />,
      name: "Roles",
      totalLabelName: "Total Staff",
      onClick: () => {
        navigate("roles");
      },
    },
    // {
    //   icon: <FiCoffee />,
    //   name: "Breaks",
    //   totalLabelName: "Total Projects",
    //   onClick: () => {},
    // },
    // {
    //   icon: <MdDateRange />,
    //   name: "Holidays",
    //   totalLabelName: "Total Staff",
    //   onClick: () => {},
    // },
    {
      icon: <HiOutlineClipboardList />,
      name: "Assets",
      totalLabelName: "Total Projects",
      onClick: () => {
        navigate("assets");
      },
    },
  ];

  return (
    <div className="w-full" style={{ width: "100%", height: "92vh" }}>
      <div
        className="px-8 pb-8 pt-5 bg-gray-100"
        style={{ width: "100%", height: "92vh" }}
      >
        <h1 className="text-2xl font-bold mb-5">Manage Staff</h1>
        <div className="grid grid-cols-5 gap-4 gap-y-8">
          {ManageStaff.map((item) => (
            <div
              className="bg-white p-9 rounded-lg hover:shadow border-2"
              key={item.name}
            >
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={item.onClick}
              >
                <div className="text-6xl bg-gray-200 p-3 rounded-lg">
                  {item.icon}
                </div>
                <p className="text-lg  text-center mt-1 ">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StaffPayout;
