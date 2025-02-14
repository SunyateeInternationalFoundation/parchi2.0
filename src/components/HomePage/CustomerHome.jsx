import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Route, Routes } from "react-router-dom";
import Estimate from "../../assets/dashboard/Estimate.png";
import InvoicePng from "../../assets/dashboard/Invoice.png";
import ProjectsPng from "../../assets/dashboard/Projects.png";
import SubscriptionsPng from "../../assets/dashboard/Subscriptions.png";
import { db } from "../../firebase";
import Invoice from "../CustomerDashboard/Invoice";
import Projects from "../CustomerDashboard/Projects";
import ProjectViewHome from "../CustomerDashboard/ProjectViewHome";
import Quotations from "../CustomerDashboard/Quotations";
import Subscriptions from "../CustomerDashboard/Subscriptions";
import SettingsView from "../Settings/SettingView";
import Navbar from "../UI/Navbar";
import CustomerDashboard from "./CustomerDashboard";

function CustomerHome() {
  const [dataSetList, setDataSetList] = useState({
    quotations: [],
    invoices: [],
    services: [],
  });
  const [amount, setAmount] = useState({
    paid: 0,
    unPaid: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(false);
  const userDetails = useSelector((state) => state.users);
  const asCustomerDetails = userDetails.userAsOtherCompanies.customer;


  const [icons, setIcons] = useState([
    {
      name: "Estimate",
      img: Estimate,
      link: "quotation",
      total: 0,
      collectionName: "quotations",
    },
    {
      name: "Invoice",
      img: InvoicePng,
      link: "invoice",
      total: 0,
      collectionName: "invoices",
    },
    {
      name: "Subscriptions",
      img: SubscriptionsPng,
      link: "subscriptions",
      total: 0,
      collectionName: "services",
    },
    {
      name: "Projects",
      img: ProjectsPng,
      link: "projects",
      total: 0,
      collectionName: "projects",
    },
  ]);
  async function fetchCountData() {
    try {
      const asCustomersList = asCustomerDetails.map((ele) =>
        doc(db, "customers", ele.customerId)
      );
      if (asCustomersList.length === 0) {
        setLoading(false);
        return;
      }
      for (const icon of icons) {
        let count = 0;
        for (const item of asCustomerDetails) {
          if (icon.name == "Projects") {
            const projectRef = collection(db, "projects");
            const q = query(
              projectRef,
              where("customerRef", "array-contains-any", asCustomersList)
            );
            const getData = await getDocs(q);
            count += getData.size;
            continue;
          }
          const invoiceRef = collection(
            db,
            "companies",
            item.companyId,
            icon.collectionName
          );
          const q = query(
            invoiceRef,
            where(
              "customerDetails.customerRef",
              "==",
              doc(db, "customers", item.customerId)
            )
          );
          const getData = await getDocs(q);

          if (icon.name == "Invoice" || icon.name == "Subscriptions") {
            getData.docs.forEach((doc) => {
              const { paymentStatus, total } = doc.data();
              if (paymentStatus == "Paid" || icon.name == "Subscriptions") {
                amount.paid += total;
              } else if (paymentStatus == "UnPaid") {
                amount.unPaid += total;
              } else if (paymentStatus == "Pending") {
                amount.pending += total;
              }
            });
          }

          if (dataSetList[icon.collectionName]) {
            const getAllData = getData.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
              };
            });
            dataSetList[icon.collectionName].push(...getAllData);
          }
          count += getData.size;
        }
        icon.total = count;
      }
      setDataSetList({ ...dataSetList });
      setIcons([...icons]);
      setAmount({ ...amount });
    } catch (error) {
      console.log("🚀 ~ fetchDashboardData ~ error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchCountData();
  }, []);
  return (
    <div>
      <div style={{ height: "8vh" }}>
        <Navbar />
      </div>
      <div
        style={{ width: "100%", height: "94vh" }}
        className="bg-gray-100 relative"
      >
        <Routes>
          <Route
            path="/"
            element={<CustomerDashboard icons={icons} amount={amount} />}
          ></Route>
          <Route
            path="/invoice"
            element={<Invoice invoices={dataSetList.invoices} />}
          ></Route>
          <Route
            path="/quotation"
            element={<Quotations quotations={dataSetList.quotations} />}
          ></Route>
          <Route
            path="/subscriptions"
            element={<Subscriptions subscriptions={dataSetList.services} />}
          ></Route>
          <Route path="/projects" element={<Projects />}></Route>
          <Route path="/projects/:id" element={<ProjectViewHome />} />
          {/* <Route path="/projects/:id/files" element={<Files />}></Route>
            <Route
              path="/projects/:id/approvals"
              element={<Approval />}
            ></Route> */}
          <Route path="/settings" element={<SettingsView />}></Route>
        </Routes>
        <Outlet />
        {loading && (
          <div
            className="w-full absolute  top-0 "
            style={{ width: "100%", height: "94vh", backgroundColor: "#0009" }}
          >
            <div className="flex items-center justify-center text-white h-full text-2xl ">
              Loading...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerHome;
