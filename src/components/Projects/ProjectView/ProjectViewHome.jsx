import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { BsCalendar4, BsFileEarmarkCheck, BsFolderPlus } from "react-icons/bs";
import { FaTasks } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoWalletOutline } from "react-icons/io5";
import { RiUserAddLine } from "react-icons/ri";
import { TbLayoutDashboard } from "react-icons/tb";
import { useSelector } from "react-redux";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { db } from "../../../firebase";
import Approval from "./Approvals/Approval";
import Files from "./Files/Files";
import Items from "./Items/Items";
import Milestone from "./Milestone/Milestone";
import Payment from "./Payment/Payment";
import ProjectView from "./ProjectView";
import Tasks from "./Tasks/Tasks";
import Users from "./Users/Users";

function ProjectViewHome() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const tab = searchParams.get("tab");
  const [project, setProject] = useState({});
  const userDetails = useSelector((state) => state.users);
  const navigate = useNavigate();
  async function fetchData() {
    const getData = await getDoc(doc(db, "projects", id));
    const data = getData.data();
    const payload = {
      id,
      ...data,
      companyRef: data.companyRef.id,
      createdAt: DateFormate(data.createdAt),
      startDate: DateFormate(data.startDate, "yyyy-mm-dd"),
      dueDate: DateFormate(data.dueDate, "yyyy-mm-dd"),
      vendorRef: data?.vendorRef?.map((ref) => ref.id),
      customerRef: data?.customerRef?.map((ref) => ref.id),
      staffRef: data?.staffRef?.map((ref) => ref.id),
      book: data?.book,
    };
    setProject(payload);
  }

  useEffect(() => {
    if (!tab) {
      navigate("?tab=Dashboard");
    }
    fetchData();
  }, [id]);

  function DateFormate(timestamp, format = "dd/mm/yyyy") {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return format === "yyyy-mm-dd"
      ? `${getFullYear}-${getMonth}-${getDate}`
      : `${getDate}/${getMonth}/${getFullYear}`;
  }
  const tabsList = [
    {
      name: "Dashboard",
      icon: <TbLayoutDashboard />,
      component: (
        <ProjectView refreshProject={fetchData} projectDetails={project} />
      ),
    },
    {
      name: "Users",
      icon: <RiUserAddLine />,
      component: <Users />,
    },
    {
      name: "Milestones",
      icon: <BsCalendar4 />,
      component: <Milestone />,
    },
    {
      name: "Tasks",
      icon: <FaTasks />,
      component: <Tasks />,
    },
    {
      name: "Files",
      icon: <BsFolderPlus />,
      component: <Files />,
    },
    {
      name: "Approvals",
      icon: <BsFileEarmarkCheck />,
      component: <Approval />,
    },
    // {
    //   name: "Chat",
    //   icon: <TiMessages />,
    //   component: <Chats />,
    // },
    {
      name: "Payments",
      icon: <IoWalletOutline />,
      component: <Payment projectDetails={project} />,
    },

    {
      name: "Items",
      icon: <HiOutlineShoppingCart />,
      component: <Items />,
    },
  ];

  const [manageItems, setManageItems] = useState([]);

  useEffect(() => {
    if (userDetails.selectedDashboard === "staff") {
      const removedItems = ["Payments", "Items", "Chat"];

      const updatedData = tabsList.filter(
        (ele) => !removedItems.includes(ele.name)
      );
      setManageItems(updatedData);
    } else {
      setManageItems(tabsList);
    }
  }, [project?.id]);

  return (
    <div className=" pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center bg-white  px-3 space-x-3 border-b">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 hover:text-blue-500" />
        </Link>
        <h1 className="text-xl font-bold text-nowrap w-24 text-ellipsis overflow-hidden">
          {project.name}
        </h1>

        <nav className="flex space-x-2 w-full">
          {manageItems.map((item) => (
            <button
              key={item.name}
              className={
                "p-4 flex items-center space-x-1 font-semibold text-gray-500 " +
                (tab === item.name ? " border-b-4 border-blue-500 " : "")
              }
              onClick={() => {
                navigate("?tab=" + item.name);
              }}
            >
              {item.icon} <div>{item.name}</div>
            </button>
          ))}
        </nav>
      </header>

      <div className="w-full ">
        {manageItems.map(
          (item) =>
            tab === item.name && <div key={item.name}>{item.component}</div>
        )}
      </div>
    </div>
  );
}

export default ProjectViewHome;
