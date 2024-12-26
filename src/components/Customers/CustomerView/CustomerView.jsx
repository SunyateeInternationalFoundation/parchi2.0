import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link, useParams } from "react-router-dom";
import Bills from "./Bills";
import Projects from "./Projects";
import Services from "./Services";
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
import Profile from "./Profile";

function CustomerView() {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [activeTab, setActiveTab] = useState("Profile");
  const [customersInvoicesData, setCustomersInvoicesData] = useState([]);
  const [customersServicesData, setCustomersServicesData] = useState([]);
  const [customersProjectsData, setCustomersProjectsData] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }
  const customersRef = doc(db, "customers", id);

  const fetchCustomerData = async () => {
    if (id) {
      try {
        const customerDoc = await getDoc(customersRef);
        if (customerDoc.exists()) {
          const data = { id: customerDoc.id, ...customerDoc.data() };
          setCustomerData(data);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    }
  };

  useEffect(() => {
    async function fetchInvoiceList() {
      try {
        const invoiceRef = collection(db, `/companies/${companyId}/invoices`);
        const q = query(
          invoiceRef,
          where("customerDetails.custRef", "==", customersRef)
        );
        const querySnapshot = await getDocs(q);

        const customersInvoices = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: DateFormate(data.date),
          };
        });

        setCustomersInvoicesData(customersInvoices);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceList ~ error:", error);
      }
    }
    async function fetchServicesList() {
      try {
        const invoiceRef = collection(db, `/companies/${companyId}/services`);
        const q = query(
          invoiceRef,
          where("customerDetails.custRef", "==", customersRef)
        );
        const querySnapshot = await getDocs(q);

        const customersInvoices = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: DateFormate(data.date),
          };
        });

        setCustomersServicesData(customersInvoices);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceList ~ error:", error);
      }
    }

    async function fetchProjectList() {
      try {
        const ProjectRef = collection(db, `/projects`);

        const q = query(
          ProjectRef,
          where("customerRef", "array-contains", customersRef)
        );
        const querySnapshot = await getDocs(q);

        const customersProjects = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: DateFormate(data.createdAt),
          };
        });

        setCustomersProjectsData(customersProjects);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceList ~ error:", error);
      }
    }

    fetchServicesList();
    fetchCustomerData();
    fetchInvoiceList();
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
        <h1 className="text-2xl font-bold">{customerData.name}</h1>
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
              (activeTab === "Services"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Services")}
          >
            Services
          </button>
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
            <Profile customerData={customerData} refresh={fetchCustomerData} />
          </div>
        )}
        {activeTab === "Projects" && (
          <div>
            <Projects customersProjectsData={customersProjectsData} />
          </div>
        )}
        {activeTab === "Services" && (
          <div>
            <Services servicesList={customersServicesData} />
          </div>
        )}
        {activeTab === "Bills" && (
          <div>
            <Bills customersInvoicesData={customersInvoicesData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerView;
