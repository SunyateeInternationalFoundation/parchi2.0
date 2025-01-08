import { useEffect } from "react";
import { GrDocumentUser } from "react-icons/gr";
import { HiOutlineClipboardList } from "react-icons/hi";
import { IoMdTime } from "react-icons/io";
import {
  RiShieldUserLine,
  RiUserAddLine,
  RiUserFollowLine,
} from "react-icons/ri";
import { TbGitBranch } from "react-icons/tb";
import { useNavigate, useSearchParams } from "react-router-dom";
import Assets from "./Assets/Assets";
import Attendance from "./Attendance/Attendance";
import Branches from "./Branches/Branches";
import Designation from "./Designation/Designation";
import Roles from "./Roles/Roles";
import Staff from "./Staff/Staff";
import WeekOff from "./WeekOff/WeekOff";

function StaffPayout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tab = searchParams.get("tab");
  const ManageStaff = [
    {
      icon: <RiUserAddLine />,
      name: "Staff",
      totalLabelName: "Total Staff",
      component: <Staff />,
      // onClick: () => {
      //   navigate("staff");
      // },
    },
    {
      icon: <RiUserFollowLine />,
      name: "Attendance",
      totalLabelName: "Total Projects",
      component: <Attendance />,
      // onClick: () => {
      //   navigate("attendance");
      // },
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
      component: <Designation />,
      // onClick: () => {
      //   navigate("designations");
      // },
    },
    {
      icon: <TbGitBranch />,
      name: "Branch",
      totalLabelName: "Total Staff",
      component: <Branches />,
      // onClick: () => {
      //   navigate("branches");
      // },
    },
    {
      icon: <IoMdTime />,
      name: "Week off",
      totalLabelName: "Total Projects",
      component: <WeekOff />,
      // onClick: () => {
      //   navigate("weekOff");
      // },
    },
    {
      icon: <RiShieldUserLine />,
      name: "Roles",
      totalLabelName: "Total Staff",
      component: <Roles />,
      // onClick: () => {
      //   navigate("roles");
      // },
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
      component: <Assets />,
      // onClick: () => {
      //   navigate("assets");
      // },
    },
  ];
  useEffect(() => {
    if (!tab) {
      navigate("?tab=Staff");
    }
  }, []);
  return (
    <div className="w-full" style={{ width: "100%", height: "92vh" }}>
      <div className="bg-gray-100" style={{ width: "100%", height: "92vh" }}>
        <div className="flex px-8 gap-2 bg-white border-b">
          {ManageStaff.map((item) => (
            <div className="" key={item.name}>
              <div
                className={
                  "flex items-center cursor-pointer p-4 font-semibold text-gray-500 " +
                  (tab === item.name && " border-b-4 border-blue-500 ")
                }
                onClick={() => navigate("?tab=" + item.name)}
                // onClick={item.onClick}
              >
                <div className="pe-2">{item.icon}</div>
                <p className="text-lg ">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          {ManageStaff.map((item) => (
            <div className="w-full" key={item.name}>
              {tab === item.name && item.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StaffPayout;
