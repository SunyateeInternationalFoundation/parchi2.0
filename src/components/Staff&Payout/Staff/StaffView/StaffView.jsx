import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import Attendance from "./Attendance";
import Payments from "./Payments";
import Profile from "./Profile";
import Projects from "./Projects";
import StaffDocuments from "./StaffDocuments";

function StaffView({ staffCompanyId }) {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  let companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  if (staffCompanyId) {
    companyId = staffCompanyId;
  }

  const [activeTab, setActiveTab] = useState("Profile");
  const [projectsData, setProjectsData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }

  const StaffRef = doc(db, "staff", id);

  const fetchStaffData = async () => {
    if (id) {
      try {
        const staffDoc = await getDoc(StaffRef);
        const staffAttendanceGetDocs = await getDocs(
          collection(db, "companies", companyId, "staffAttendance")
        );
        if (staffDoc.exists()) {
          const data = { id: staffDoc.id, ...staffDoc.data() };
          setStaffData(data);
        }
        const staffAttendance = staffAttendanceGetDocs.docs.map((doc) => {
          const { date, staffs } = doc.data();
          console.log("🚀 ~ staffAttendance ~ staffs:", doc.id, doc.data());
          const attendanceStaffData = staffs.find((item) => item.id == id);
          return {
            attendanceId: doc.id,
            date,
            ...attendanceStaffData,
          };
        });
        console.log("🚀 ~ staffAttendance ~ staffAttendance:", staffAttendance);
        setAttendanceData(staffAttendance);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    }
  };

  useEffect(() => {
    async function fetchProjectList() {
      try {
        const ProjectRef = collection(db, `/projects`);

        const q = query(
          ProjectRef,
          where("staffRef", "array-contains", StaffRef)
        );
        const querySnapshot = await getDocs(q);

        const staffsProjects = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: DateFormate(data.createdAt),
          };
        });

        setProjectsData(staffsProjects);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceList ~ error:", error);
      }
    }

    fetchStaffData();
    fetchProjectList();
  }, []);
  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center  space-x-3 my-2 ">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">{staffData.name}</h1>
      </header>
      <hr />
      <div>
        <nav className="flex space-x-4 mt-3 mb-3">
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Profile"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Profile")}
          >
            Profile
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Projects"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Projects")}
          >
            Projects
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Payments"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Payments")}
          >
            Payments
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Attendance"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Attendance")}
          >
            Attendance
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Documents"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Documents")}
          >
            Documents
          </button>
        </nav>
      </div>
      <hr />
      <div className="w-full">
        {activeTab === "Profile" && (
          <div>
            <Profile staffData={staffData} refresh={fetchStaffData} />
          </div>
        )}
        {activeTab === "Projects" && (
          <div>
            <Projects projectsData={projectsData} />
          </div>
        )}
        {activeTab === "Payments" && (
          <div>
            <Payments />
          </div>
        )}
        {activeTab === "Attendance" && (
          <div>
            <Attendance attendanceData={attendanceData} />
          </div>
        )}
        {activeTab === "Documents" && (
          <div>
            <StaffDocuments staffData={staffData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffView;
