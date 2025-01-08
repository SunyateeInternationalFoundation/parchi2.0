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
import Bills from "./Bills";
import Profile from "./Profile";
import Projects from "./Projects";
import Services from "./Services";

function CustomerView() {
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
  const [customersInvoicesData, setCustomersInvoicesData] = useState([]);
  const [customersServicesData, setCustomersServicesData] = useState([]);
  const [customersProjectsData, setCustomersProjectsData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [expenseData, setExpenseData] = useState({
    income: 0,
    expense: 0,
  });

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

  async function fetchInvoiceList() {
    try {
      const sales = [
        "invoices",
        "quotations",
        "proFormaInvoice",
        "creditNote",
        "deliveryChallan",
        "pos",
      ];
      const saleNo = {
        invoices: "invoiceNo",
        quotations: "quotationNo",
        proFormaInvoice: "proFormaInvoiceNo",
        creditNote: "creditNoteNo",
        deliveryChallan: "deliveryChallanNo",
        pos: "posNo",
      };
      let salesData = {};
      let expenseAmount = expenseData;
      for (let sale of sales) {
        const invoiceRef = collection(db, `/companies/${companyId}/${sale}`);
        const q = query(
          invoiceRef,
          where("customerDetails.customerRef", "==", customersRef)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          if (sale == "invoices" || sale == "pos") {
            expenseAmount.income += +data.total;
          }
          return {
            id: doc.id,
            ...data,
            no: data[saleNo[sale]],
          };
        });
        salesData[sale] = data;
      }
      setExpenseData(expenseAmount);

      setCustomersInvoicesData(salesData);
    } catch (error) {
      console.log("🚀 ~ fetchInvoiceList ~ error:", error);
    }
  }

  async function fetchServicesList() {
    try {
      const invoiceRef = collection(db, `/companies/${companyId}/services`);
      const q = query(
        invoiceRef,
        where("customerDetails.customerRef", "==", customersRef)
      );
      const querySnapshot = await getDocs(q);

      const customersInvoices = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
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

  async function fetchExpenses() {
    try {
      const expenseRef = collection(db, "companies", companyId, "expenses");
      const q = query(expenseRef, where("toWhom.userRef", "==", customersRef));
      const getExpenseDocs = await getDocs(q);

      let expenseAmount = expenseData;

      getExpenseDocs.docs.forEach((doc) => {
        const data = doc.data();
        expenseAmount[data.transactionType] += data.amount;
      });

      setExpenseData(expenseAmount);
    } catch (error) {
      console.log("🚀 ~ fetchExpenses ~ error:", error);
    }
  }
  useEffect(() => {
    fetchExpenses();
    fetchServicesList();
    fetchCustomerData();
    fetchInvoiceList();
    fetchProjectList();
  }, []);

  return (
    <div className=" bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center bg-white  px-3 space-x-3 ">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
        </Link>
        <h1 className="text-xl font-bold pe-4">{customerData.name}</h1>
        <nav className="flex space-x-4 ">
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (activeTab === "Profile" && " border-b-4 border-blue-500")
            }
            onClick={() => setActiveTab("Profile")}
          >
            Profile
          </button>
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (activeTab === "Projects" && " border-b-4 border-blue-500")
            }
            onClick={() => setActiveTab("Projects")}
          >
            Projects
          </button>
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (activeTab === "Services" && " border-b-4 border-blue-500")
            }
            onClick={() => setActiveTab("Services")}
          >
            Subscription
          </button>
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (activeTab === "Bills" && " border-b-4 border-blue-500")
            }
            onClick={() => setActiveTab("Bills")}
          >
            Sales
          </button>
        </nav>
      </header>
      <hr />

      <hr />
      <div className="w-full">
        {activeTab === "Profile" && (
          <div>
            <Profile
              customerData={customerData}
              refresh={fetchCustomerData}
              expenseData={expenseData}
            />
          </div>
        )}
        {activeTab === "Projects" && (
          <div>
            <Projects projectsData={customersProjectsData} />
          </div>
        )}
        {activeTab === "Services" && (
          <div>
            <Services servicesList={customersServicesData} />
          </div>
        )}
        {activeTab === "Bills" && (
          <div>
            <Bills salesData={customersInvoicesData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerView;
