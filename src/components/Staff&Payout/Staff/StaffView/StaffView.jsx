import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import Attendance from "./Attendance";
import Payments from "./Payments";
import Profile from "./Profile";
import Projects from "./Projects";
import StaffDocuments from "./StaffDocuments";

function StaffView() {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
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

  const staffRef = doc(db, "staff", id);

  const fetchStaffData = async () => {
    if (id) {
      try {
        const staffDoc = await getDoc(staffRef);
        const staffAttendanceGetDocs = await getDocs(
          collection(db, "companies", companyId, "staffAttendance")
        );
        if (staffDoc.exists()) {
          const data = { id: staffDoc.id, ...staffDoc.data() };
          setStaffData(data);
        }
        const staffAttendance = staffAttendanceGetDocs.docs.map((doc) => {
          const { date, staffs } = doc.data();
          const attendanceStaffData = staffs.find((item) => item.id == id);
          return {
            attendanceId: doc.id,
            date,
            ...attendanceStaffData,
          };
        });
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
          where("staffRef", "array-contains", staffRef)
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
  console.log("staff", staffData);
  return (
    <div className="bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center  space-x-3 px-3 bg-white">
        <Link className="flex items-center " to={"./../../?tab=Staff"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold">{staffData.name}</h1>
        <div>
          <nav className="flex space-x-6  font-semibold text-lg text-gray-500">
            <button
              className={
                "px-4 py-3" +
                (activeTab === "Profile" && " border-b-4 border-blue-700")
              }
              onClick={() => setActiveTab("Profile")}
            >
              Profile
            </button>
            <button
              className={
                "px-4 py-3" +
                (activeTab === "Projects" && " border-b-4 border-blue-700")
              }
              onClick={() => setActiveTab("Projects")}
            >
              Projects
            </button>
            {/* <button
              className={
                "px-4 py-3" +
                (activeTab === "Payments"
                && " border-b-4 border-blue-700")
              }
              onClick={() => setActiveTab("Payments")}
            >
              Payments
            </button> */}
            <button
              className={
                "px-4 py-3" +
                (activeTab === "Attendance" && " border-b-4 border-blue-700")
              }
              onClick={() => setActiveTab("Attendance")}
            >
              Attendance
            </button>
            <button
              className={
                "px-4 py-3" +
                (activeTab === "Documents" && " border-b-4 border-blue-700")
              }
              onClick={() => setActiveTab("Documents")}
            >
              Documents
            </button>
          </nav>
        </div>
      </header>

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
StaffView.propTypes = {
  staffCompanyId: PropTypes.string,
};

export default StaffView;
