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
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { db } from "../../../firebase";
import Bills from "./Bills";
import Profile from "./Profile";
import Projects from "./Projects";
import Services from "./Services";

function CustomerView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get("tab");
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

  const [customersInvoicesData, setCustomersInvoicesData] = useState([]);
  const [customersServicesData, setCustomersServicesData] = useState([]);
  const [customersProjectsData, setCustomersProjectsData] = useState([]);
  const [customerData, setCustomerData] = useState({});
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
        "pos",
        "services",
        "quotations",
        "proFormaInvoice",
        "creditNote",
        "deliveryChallan",
      ];
      const saleNo = {
        invoices: "invoiceNo",
        quotations: "quotationNo",
        proFormaInvoice: "proFormaInvoiceNo",
        creditNote: "creditNoteNo",
        deliveryChallan: "deliveryChallanNo",
        pos: "posNo",
        services: "serviceNo",
      };
      let salesData = {};
      const amountCountIn = ["invoices", "pos", "services"];
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
          if (amountCountIn.includes(sale)) {
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
    if (!tab) {
      navigate("?tab=Profile");
    }
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
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold pe-4">{customerData.name}</h1>
        <nav className="flex space-x-4 ">
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (tab === "Profile" && " border-b-4 border-blue-500")
            }
            onClick={() => navigate("?tab=Profile")}
          >
            Profile
          </button>
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (tab === "Projects" && " border-b-4 border-blue-500")
            }
            onClick={() => navigate("?tab=Projects")}
          >
            Projects
          </button>
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (tab === "Services" && " border-b-4 border-blue-500")
            }
            onClick={() => navigate("?tab=Services")}
          >
            Subscription
          </button>
          <button
            className={
              "px-4 py-4 font-semibold text-gray-500 " +
              (tab === "Bills" && " border-b-4 border-blue-500")
            }
            onClick={() => navigate("?tab=Bills")}
          >
            Sales
          </button>
        </nav>
      </header>
      <hr />

      <hr />
      <div className="w-full">
        {tab === "Profile" && (
          <div>
            <Profile
              customerData={customerData}
              refresh={fetchCustomerData}
              expenseData={expenseData}
            />
          </div>
        )}
        {tab === "Projects" && (
          <div>
            <Projects projectsData={customersProjectsData} />
          </div>
        )}
        {tab === "Services" && (
          <div>
            <Services servicesList={customersServicesData} />
          </div>
        )}
        {tab === "Bills" && (
          <div>
            <Bills salesData={customersInvoicesData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerView;
