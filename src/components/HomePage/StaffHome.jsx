import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Route, Routes } from "react-router-dom";
import { db } from "../../firebase";
import { setAsAStaffCompanies } from "../../store/UserSlice";
import CreditNoteList from "../CreditNote/CreditNoteList";
import CreditNoteView from "../CreditNote/CreditNoteView/CreditNoteView";
import SetCreditNote from "../CreditNote/SetCreditNote/SetCreditNote";
import CustomerList from "../Customers/CustomerList";
import CustomerView from "../Customers/CustomerView/CustomerView";
import DeliveryChallanList from "../DeliveryChallan/DeliveryChallanList";
import DeliveryChallanView from "../DeliveryChallan/DeliveryChallanView/DeliveryChallanView";
import SetDeliveryChallan from "../DeliveryChallan/SetDeliveryChallan/SetDeliveryChallan";
import InvoiceList from "../Invoices/InvoiceList";
import InvoiceView from "../Invoices/InvoiceView/InvoiceView";
import SetInvoice from "../Invoices/SetInvoice/SetInvoice";
import PO from "../PO/PO";
import PoView from "../PO/PoView/PoView";
import SetPO from "../PO/SetPO/SetPO";
import POS from "../POS/POS";
import POSView from "../POS/POSView/POSView";
import SetPos from "../POS/SetPos/SetPos";
import ProFormaInvoice from "../ProFormaInvoice/ProFormaInvoice";
import ProFormaView from "../ProFormaInvoice/ProFormaInvoiceView/ProFormaView";
import SetProFormaInvoice from "../ProFormaInvoice/SetProFormaInvoice/SetProFormaInvoice";
import CreateProject from "../Projects/CreateProject/CreateProject";
import Projects from "../Projects/Projects";
import Approval from "../Projects/ProjectView/Approvals/Approval";
import Chats from "../Projects/ProjectView/Chats/Chats";
import Files from "../Projects/ProjectView/Files/Files";
import Items from "../Projects/ProjectView/Items/Items";
import Milestone from "../Projects/ProjectView/Milestone/Milestone";
import Payment from "../Projects/ProjectView/Payment/Payment";
import ProjectView from "../Projects/ProjectView/ProjectView";
import Tasks from "../Projects/ProjectView/Tasks/Tasks";
import Users from "../Projects/ProjectView/Users/Users";
import Purchase from "../Purchase/Purchase";
import PurchaseViewHome from "../Purchase/PurchaseView/PurchaseViewHome";
import SetPurchase from "../Purchase/SetPurchase/SetPurchase";
import Quotation from "../Quotation/Quotation";
import QuotationViewHome from "../Quotation/QuotationView/QuotationViewHome";
import SetQuotation from "../Quotation/SetQuotation/SetQuotation";
import CreateService from "../Services/CreateService/CreateService";
import EditService from "../Services/CreateService/EditService";
import Services from "../Services/Services";
import StaffView from "../Staff&Payout/Staff/StaffView/StaffView";
import Navbar from "../UI/Navbar";
import SideBar from "../UI/Sidebar";
import VendorList from "../Vendors/VendorList";
import VendorView from "../Vendors/VendorView/VendorView";

const StaffHome = () => {
  const dispatch = useDispatch();
  const [staffDetails, setStaffDetails] = useState(null);
  const userDetails = useSelector((state) => state.users);

  // const projectsList = ["users", "milestones", "tasks", "files", "approvals"];

  // const actions = ["create", "edit", "view", "delete"];
  useEffect(() => {
    if (userDetails.asAStaffCompanies.length == 0) {
      fetchCompanyDetails();
    }
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const staffQuery = query(
        collection(db, "staff"),
        where("phone", "==", userDetails.phone)
      );
      const staffSnapshot = await getDocs(staffQuery);

      if (!staffSnapshot.empty) {
        const staffDoc = await Promise.all(
          staffSnapshot.docs.map(async (doc) => {
            const { companyRef, ...data } = doc.data();
            const companyDoc = await getDoc(companyRef);
            const { userRef, ...companyData } = companyDoc.data();
            return {
              id: doc.id,
              ...data,
              companyDetails: {
                companyId: companyDoc.id,
                ...companyData,
              },
            };
          })
        );
        setStaffDetails(staffDoc);
        dispatch(
          setAsAStaffCompanies({
            asAStaffCompanies: staffDoc,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };
  return (
    <div>
      <div style={{ height: "8vh" }}>
        <Navbar />
      </div>
      <div className="flex" style={{ height: "92vh" }}>
        <div>
          {" "}
          <SideBar />
        </div>
        <div style={{ width: "100%", height: "92vh" }} className="bg-gray-100">
          <Routes>
            {<Route path="/profile/:id" element={<StaffView />}></Route>}
            <Route path="/invoice" element={<InvoiceList />}></Route>
            <Route path="/invoice/:id" element={<InvoiceView />}></Route>
            <Route
              path="/invoice/create-invoice"
              element={<SetInvoice />}
            ></Route>
            <Route
              path="/invoice/:invoiceId/edit-invoice"
              element={<SetInvoice />}
            ></Route>
            <Route path="/quotation" element={<Quotation />}></Route>
            <Route
              path="/quotation/:id"
              element={<QuotationViewHome />}
            ></Route>
            <Route
              path="/quotation/create-quotation"
              element={<SetQuotation />}
            ></Route>
            <Route
              path="/quotation/:quotationId/edit-quotation"
              element={<SetQuotation />}
            ></Route>
            <Route path="/purchase" element={<Purchase />}></Route>
            <Route path="/purchase/:id" element={<PurchaseViewHome />}></Route>
            <Route
              path="/purchase/create-purchase"
              element={<SetPurchase />}
            ></Route>
            <Route
              path="/purchase/:purchaseId/edit-purchase"
              element={<SetPurchase />}
            ></Route>
            <Route path="/projects" element={<Projects />}></Route>
            <Route
              path="/projects/create-project"
              element={<CreateProject />}
            ></Route>
            <Route path="/projects/:id" element={<ProjectView />} />
            <Route path="/projects/:id/user" element={<Users />} />
            <Route path="/projects/:id/tasks" element={<Tasks />}></Route>
            <Route
              path="/projects/:id/milestones"
              element={<Milestone />}
            ></Route>
            <Route path="/projects/:id/files" element={<Files />}></Route>
            <Route
              path="/projects/:id/approvals"
              element={<Approval />}
            ></Route>
            <Route path="/projects/:id/payments" element={<Payment />}></Route>
            <Route path="/projects/:id/items" element={<Items />}></Route>
            <Route path="/projects/:id/chats" element={<Chats />}></Route>
            <Route path="/customers" element={<CustomerList />}></Route>
            <Route path="/customers/:id" element={<CustomerView />}></Route>
            <Route path="/vendors" element={<VendorList />}></Route>
            <Route path="/vendors/:id" element={<VendorView />}></Route>
            <Route path="/po" element={<PO />}></Route>
            <Route path="/po/:id" element={<PoView />}></Route>
            <Route path="/po/create-po" element={<SetPO />}></Route>
            <Route path="/po/:poId/edit-po" element={<SetPO />}></Route>
            <Route path="/services" element={<Services />}></Route>
            <Route
              path="/services/create-service"
              element={<CreateService />}
            ></Route>
            <Route
              path="/services/:id/edit-service"
              element={<EditService />}
            ></Route>
            <Route
              path="/delivery-challan"
              element={<DeliveryChallanList />}
            ></Route>
            <Route
              path="/delivery-challan/:id"
              element={<DeliveryChallanView />}
            ></Route>
            <Route
              path="/delivery-challan/create-deliverychallan"
              element={<SetDeliveryChallan />}
            ></Route>
            <Route
              path="/delivery-challan/:deliverychallanId/edit-deliverychallan"
              element={<SetDeliveryChallan />}
            ></Route>
            <Route path="/credit-note" element={<CreditNoteList />}></Route>
            <Route path="/credit-note/:id" element={<CreditNoteView />}></Route>
            <Route
              path="/credit-note/create-creditnote"
              element={<SetCreditNote />}
            ></Route>
            <Route
              path="/credit-note/:creditnoteId/edit-creditnote"
              element={<SetCreditNote />}
            ></Route>
            <Route path="/pos" element={<POS />}></Route>
            <Route path="/pos/:id" element={<POSView />}></Route>
            <Route path="/pos/create-pos" element={<SetPos />}></Route>
            <Route path="/pos/:posId/edit-pos" element={<SetPos />}></Route>
            <Route
              path="/pro-forma-invoice"
              element={<ProFormaInvoice />}
            ></Route>
            <Route
              path="/pro-forma-invoice/:id"
              element={<ProFormaView />}
            ></Route>
            <Route
              path="/pro-forma-invoice/create-proForma-invoice"
              element={<SetProFormaInvoice />}
            ></Route>
            <Route
              path="/pro-forma-invoice/:proFormaId/edit-proForma-invoice"
              element={<SetProFormaInvoice />}
            ></Route>
          </Routes>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
