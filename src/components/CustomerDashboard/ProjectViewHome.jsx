import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { BsFileEarmarkCheck, BsFolderPlus } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { TbLayoutDashboard } from "react-icons/tb";
import { TiMessages } from "react-icons/ti";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebase";
import Approval from "./Approval";
import Chats from "./Chats";
import Files from "./Files";
import ProjectView from "./ProjectView";

function ProjectViewHome() {
  const { id } = useParams();
  const [project, setProject] = useState({});
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [files, setFiles] = useState([]);
  const userDetails = useSelector((state) => state.users);

  useEffect(() => {
    fetchFiles();
    fetchData();
  }, []);

  async function fetchFiles() {
    try {
      const filesRef = collection(db, "projects", id, "files");
      const q = query(filesRef, where("phoneNumber", "==", userDetails.phone));
      const querySnapshot = await getDocs(q);
      const filesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }
  const manageProjectItems = [
    {
      name: "Dashboard",
      icon: <TbLayoutDashboard />,
      component: <ProjectView project={project} />,
    },
    {
      name: "Chats",
      icon: <TiMessages />,
      component: <Chats />,
    },
    {
      name: "Files",
      icon: <BsFolderPlus />,
      component: <Files files={files} />,
    },
    {
      name: "Approvals",
      icon: <BsFileEarmarkCheck />,
      component: <Approval />,
    },
  ];

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

  async function fetchData() {
    const getData = await getDoc(doc(db, "projects", id));
    const data = getData.data();
    const payload = {
      ...data,
      companyRef: data.companyRef.id,
      createdAt: DateFormate(data.createdAt),
      startDate: DateFormate(data.startDate, "yyyy-mm-dd"),
      dueDate: DateFormate(data.dueDate, "yyyy-mm-dd"),
      vendorRef: data?.vendorRef?.map((ref) => ref.id),
      customerRef: data?.customerRef?.map((ref) => ref.id),
      staffRef: data?.staffRef?.map((ref) => ref.id),
    };

    setProject(payload);
  }
  return (
    <div className=" pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center bg-white  px-3 space-x-3">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 hover:text-blue-500" />
        </Link>
        <h1 className="text-xl font-bold text-nowrap w-24 text-ellipsis overflow-hidden">
          {project.name}
        </h1>

        <nav className="flex space-x-2 w-full">
          {manageProjectItems.map((item) => (
            <button
              key={item.name}
              className={
                "p-4 flex items-center space-x-1 font-semibold text-gray-500 " +
                (activeTab === item.name ? " border-b-4 border-blue-500 " : "")
              }
              onClick={() => {
                setActiveTab(item.name);
              }}
            >
              {item.icon} <div>{item.name}</div>
            </button>
          ))}
        </nav>
      </header>

      <div className="w-full ">
        {manageProjectItems.map(
          (item) =>
            activeTab === item.name && (
              <div key={item.name}>{item.component}</div>
            )
        )}
      </div>
    </div>
  );
}

export default ProjectViewHome;
