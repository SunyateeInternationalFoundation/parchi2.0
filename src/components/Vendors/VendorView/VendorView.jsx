import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useSelector } from "react-redux";
import VendorBills from "./VendorBills";
import VendorProfile from "./VendorProfile";
import VendorProject from "./VendorProject";
import VendorServices from "./VendorServices";

function VendorView() {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [activeTab, setActiveTab] = useState("Profile");
  const [vendorsPOData, setVendorsPOData] = useState([]);
  const [vendorsProjectsData, setvendorsProjectsData] = useState([]);
  const [vendorData, setVendorData] = useState([]);

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }
  const vendorsRef = doc(db, "vendors", id);

  const fetchVendorData = async () => {
    if (id) {
      try {
        const vendorDoc = await getDoc(vendorsRef);
        if (vendorDoc.exists()) {
          const data = { id: vendorDoc.id, ...vendorDoc.data() };
          setVendorData(data);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    }
  };

  useEffect(() => {
    async function fetchPOList() {
      try {
        const invoiceRef = collection(db, `/companies/${companyId}/purchases`);
        const q = query(
          invoiceRef,
          where("vendorDetails.vendorRef", "==", vendorsRef)
        );
        const querySnapshot = await getDocs(q);

        const vendorsInvoices = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: DateFormate(data.date),
          };
        });

        setVendorsPOData(vendorsInvoices);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceList ~ error:", error);
      }
    }

    async function fetchProjectList() {
      try {
        const ProjectRef = collection(db, `/projects`);

        const q = query(
          ProjectRef,
          where("vendorRef", "array-contains", vendorsRef)
        );
        const querySnapshot = await getDocs(q);

        const vendorsProjects = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: DateFormate(data.createdAt),
          };
        });

        setvendorsProjectsData(vendorsProjects);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceList ~ error:", error);
      }
    }

    fetchVendorData();
    fetchPOList();
    fetchProjectList();
  }, []);

  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 my-2 ">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">{vendorData.name}</h1>
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
          {/* <button
            className={
              "px-4 py-1" +
              (activeTab === "Services"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Services")}
          >
            Services
          </button> */}
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Bills"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Bills")}
          >
            Bills
          </button>
        </nav>
      </div>
      <hr />
      <div className="w-full">
        {activeTab === "Profile" && (
          <div>
            <VendorProfile vendorData={vendorData} refresh={fetchVendorData} />
          </div>
        )}
        {activeTab === "Projects" && (
          <div>
            <VendorProject projectsData={vendorsProjectsData} />
          </div>
        )}
        {activeTab === "Services" && (
          <div>
            <VendorServices />
          </div>
        )}
        {activeTab === "Bills" && (
          <div>
            <VendorBills PoData={vendorsPOData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorView;
