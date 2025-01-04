import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import VendorBills from "./VendorBills";
import VendorProfile from "./VendorProfile";
import VendorProject from "./VendorProject";
import VendorServices from "./VendorServices";

function VendorView() {
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
  const [vendorsPOData, setVendorsPOData] = useState([]);
  const [vendorsProjectsData, setvendorsProjectsData] = useState([]);
  const [vendorData, setVendorData] = useState({});

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
      const tabs = {
        purchases: "purchaseNo",
        po: "poNo",
        debitNote: "debitNoteNo",
      };
      try {
        let purchasesData = {};
        for (let tab of Object.keys(tabs)) {
          const invoiceRef = collection(db, `/companies/${companyId}/${tab}`);
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
              no: data[tabs[tab]],
            };
          });
          purchasesData[tab] = vendorsInvoices;
        }
        setVendorsPOData(purchasesData);
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
    <div className=" bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center bg-white  px-3 space-x-3 ">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
        </Link>
        <h1 className="text-2xl font-bold">{vendorData.name}</h1>
        <nav className="flex space-x-4">
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
              "px-4  py-3" +
              (activeTab === "Projects" && " border-b-4 border-blue-700")
            }
            onClick={() => setActiveTab("Projects")}
          >
            Projects
          </button>
          <button
            className={
              "px-4  py-3" +
              (activeTab === "Bills" && " border-b-4 border-blue-700")
            }
            onClick={() => setActiveTab("Bills")}
          >
            Purchase
          </button>
        </nav>
      </header>
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
            <VendorBills purchasesData={vendorsPOData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorView;
