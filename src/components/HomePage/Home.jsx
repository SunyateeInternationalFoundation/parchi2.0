import {
  matchPath,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import CustomerList from "../Customers/CustomerList";
import CustomerView from "../Customers/CustomerView/CustomerView";
import BookList from "../Expense/Book/BookList";
import Expense from "../Expense/Expense";
import InvoiceList from "../Invoices/InvoiceList";
import InvoiceView from "../Invoices/InvoiceView/InvoiceView";
import PO from "../PO/PO";
import POS from "../POS/POS";
import POSView from "../POS/POSView/POSView";
import ProductHome from "../Products/ProductHome";
import ProFormaInvoice from "../ProFormaInvoice/ProFormaInvoice";
import CreateProject from "../Projects/CreateProject/CreateProject";
import Projects from "../Projects/Projects";
import Quotation from "../Quotation/Quotation";
import QuotationViewHome from "../Quotation/QuotationView/QuotationViewHome";
import Services from "../Services/Services";
import ServicesList from "../ServicesList/ServicesList";
import Branches from "../Staff&Payout/Branches/Branches";
import StaffView from "../Staff&Payout/Staff/StaffView/StaffView";
import StaffPayout from "../Staff&Payout/StaffPayout";
import Navbar from "../UI/Navbar";
import VendorList from "../Vendors/VendorList";
import VendorView from "../Vendors/VendorView/VendorView";
// import CreateProFormaInvoice from "../ProFormaInvoice/CreateProFormaInvoice/CreateProFormaInvoice";
import BusinessCard from "../BusinessCard/BusinessCard";
import CreditNoteList from "../CreditNote/CreditNoteList";
import CreditNoteView from "../CreditNote/CreditNoteView/CreditNoteView";
import SetCreditNote from "../CreditNote/SetCreditNote/SetCreditNote";
import DebitNoteList from "../DebitNote/DebitNoteList";
import DebitNoteView from "../DebitNote/DebitNoteView/DebitNoteView";
import SetDebitNote from "../DebitNote/SetDebitNote/SetDebititNote";
import DeliveryChallanList from "../DeliveryChallan/DeliveryChallanList";
import DeliveryChallanView from "../DeliveryChallan/DeliveryChallanView/DeliveryChallanView";
import SetDeliveryChallan from "../DeliveryChallan/SetDeliveryChallan/SetDeliveryChallan";
import Documents from "../Documents/Documents";
import SetInvoice from "../Invoices/SetInvoice/SetInvoice";
import PoView from "../PO/PoView/PoView";
import SetPO from "../PO/SetPO/SetPO";
import SetPos from "../POS/SetPos/SetPos";
import ProductViewHome from "../Products/ProductView/ProductViewHome";
import ProFormaView from "../ProFormaInvoice/ProFormaInvoiceView/ProFormaView";
import SetProFormaInvoice from "../ProFormaInvoice/SetProFormaInvoice/SetProFormaInvoice";
import ProjectViewHome from "../Projects/ProjectView/ProjectViewHome";
import Purchase from "../Purchase/Purchase";
import PurchaseViewHome from "../Purchase/PurchaseView/PurchaseViewHome";
import SetPurchase from "../Purchase/SetPurchase/SetPurchase";
import SetQuotation from "../Quotation/SetQuotation/SetQuotation";
import Reminder from "../Reminder/Reminder";
import SetService from "../Services/CreateService/SetService";
import ServiceView from "../Services/ServicesView/ServiceView";
import CompanyProfile from "../Settings/CompanyProfile";
import Prefix from "../Settings/Prefix";
import { default as SettingView } from "../Settings/SettingView";
import SubscriptionPlan from "../Settings/SubscriptionPlan";
import UserProfile from "../Settings/UserProfile";
import Designation from "../Staff&Payout/Designation/Designation";
import DesignationView from "../Staff&Payout/Designation/DesignationView";
import Sidebar2 from "../UI/Sidebar2";
import VendorPO from "../VendorDashBoard/VendorPO";
import Dashboard from "./Dashboard";

const Home = () => {
  const location = useLocation();

  const matchPathList = [
    "/invoice/create-invoice",
    "/projects/create-project",
    "/customers/:id",
    "/vendors/:id",
    "/staff-payout/staff/:id",
    "/create-po",
    "/services/create-service",
  ];
  const match = [
    "/settings",
    "/settings/user-profile",
    "/settings/company-profile",
    "/settings/prefix",
    "/settings/subscription-plan",
  ];

  const noSideBarPagesList = match.find((path) =>
    matchPath({ path }, location.pathname)
  );

  return (
    <div>
      <div style={{ height: "8vh" }}>
        {/* {location.pathname !== "/home" && <Navbar />} */}
        <Navbar />
      </div>
      <div className="flex" style={{ height: "92vh" }}>
        <Sidebar2 />
        {/* {!noSideBarPagesList ? (
          location.pathname !== "/" && (
            <div>
              <SideBar />
            </div>
          )
        ) : (
        )} */}
        {noSideBarPagesList && (
          <div className="w-1/5">
            <SettingView />
          </div>
        )}

        <div style={{ width: "100%", height: "92vh" }} className="bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />}></Route>
            <Route path="/invoice" element={<InvoiceList />}></Route>
            <Route
              path="/invoice/create-invoice"
              element={<SetInvoice />}
            ></Route>
            <Route path="/invoice/:id" element={<InvoiceView />}></Route>
            <Route
              path="/invoice/:invoiceId/edit-invoice"
              element={<SetInvoice />}
            ></Route>
            <Route path="/quotation" element={<Quotation />}></Route>
            <Route
              path="/quotation/create-quotation"
              element={<SetQuotation />}
            ></Route>
            <Route
              path="/quotation/:id"
              element={<QuotationViewHome />}
            ></Route>
            <Route
              path="/quotation/:quotationId/edit-quotation"
              element={<SetQuotation />}
            ></Route>
            <Route path="/purchase" element={<Purchase />}></Route>
            <Route
              path="/purchase/create-purchase"
              element={<SetPurchase />}
            ></Route>
            <Route path="/purchase/:id" element={<PurchaseViewHome />}></Route>
            <Route
              path="/purchase/:purchaseId/edit-purchase"
              element={<SetPurchase />}
            ></Route>
            <Route
              path="/pro-forma-invoice"
              element={<ProFormaInvoice />}
            ></Route>
            <Route
              path="/pro-forma-invoice/create-proForma"
              element={<SetProFormaInvoice />}
            ></Route>
            <Route
              path="/pro-forma-invoice/:id"
              element={<ProFormaView />}
            ></Route>
            <Route
              path="/pro-forma-invoice/:proFormaId/edit-proForma-invoice"
              element={<SetProFormaInvoice />}
            ></Route>
            <Route path="/pos" element={<POS />}></Route>
            <Route path="/pos/create-pos" element={<SetPos />}></Route>
            <Route path="/pos/:id" element={<POSView />}></Route>
            <Route path="/pos/:posId/edit-pos" element={<SetPos />}></Route>
            <Route path="/customers" element={<CustomerList />}></Route>
            <Route path="/customers/:id" element={<CustomerView />}></Route>
            <Route path="/vendors" element={<VendorList />}></Route>
            <Route path="/vendors/:id" element={<VendorView />}></Route>
            <Route path="/products" element={<ProductHome />}></Route>
            <Route path="/services-list" element={<ServicesList />}></Route>
            <Route path="/services/:id" element={<ServiceView />}></Route>
            <Route path="/projects" element={<Projects />}></Route>
            <Route path="/products/:id" element={<ProductViewHome />}></Route>
            <Route
              path="/projects/create-project"
              element={<CreateProject />}
            ></Route>
            <Route path="/projects/:id" element={<ProjectViewHome />} />
            <Route
              path="/projects/:id/edit-project"
              element={<CreateProject />}
            />
            {/* <Route path="/projects/:id/user" element={<Users />} />
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
            <Route path="/projects/:id/chats" element={<Chats />}></Route> */}
            <Route path="/staff-payout" element={<StaffPayout />}></Route>
            {/* <Route path="/staff-payout/staff" element={<Staff />}></Route> */}
            <Route
              path="/staff-payout/staff/:id"
              element={<StaffView />}
            ></Route>
            <Route path="/staff-payout/branches" element={<Branches />}></Route>
            <Route
              path="/staff-payout/designations"
              element={<Designation />}
            ></Route>
            <Route
              path="/staff-payout/designations/:id"
              element={<DesignationView />}
            ></Route>
            {/* <Route path="/staff-payout/roles" element={<Roles />}></Route>
            <Route path="/staff-payout/assets" element={<Assets />}></Route>
            <Route path="/staff-payout/weekOff" element={<WeekOff />}></Route>
            <Route
              path="/staff-payout/attendance"
              element={<Attendance />}
            ></Route> */}

            <Route path="/services" element={<Services />}></Route>
            <Route
              path="/services/create-service"
              element={<SetService />}
            ></Route>
            <Route
              path="/services/:id/edit-service"
              element={<SetService />}
            ></Route>
            <Route path="/po" element={<PO />}></Route>

            <Route path="/po/:id" element={<PoView />}></Route>
            <Route path="/po/create-po" element={<SetPO />}></Route>
            <Route path="/po/:poId/edit-po" element={<SetPO />}></Route>
            {/* <Route path="/create-po" element={<CreatePo />}></Route> */}
            <Route path="/documents" element={<Documents />}></Route>
            <Route path="/reminder" element={<Reminder />}></Route>
            <Route path="/expense" element={<BookList />}></Route>
            <Route path="/expense/:id" element={<Expense />}></Route>
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
              path="/credit-note/:creditNoteId/edit-creditnote"
              element={<SetCreditNote />}
            ></Route>
            <Route path="/debit-note" element={<DebitNoteList />}></Route>
            <Route path="/debit-note/:id" element={<DebitNoteView />}></Route>
            <Route
              path="/debit-note/create-debitnote"
              element={<SetDebitNote />}
            ></Route>
            <Route
              path="/debit-note/:debitNoteId/edit-debitnote"
              element={<SetDebitNote />}
            ></Route>
            <Route path="/vendor/po" element={<VendorPO />}></Route>
            <Route
              path="/settings/user-profile"
              element={<UserProfile />}
            ></Route>
            <Route
              path="/settings/company-profile"
              element={<CompanyProfile />}
            ></Route>
            {/* <Route path="/settings" element={<SettingsView />}></Route> */}
            <Route
              path="/settings/subscription-plan"
              element={<SubscriptionPlan />}
            ></Route>
            <Route path="/settings/prefix" element={<Prefix />}></Route>
            <Route path="/business-card" element={<BusinessCard />}></Route>
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
