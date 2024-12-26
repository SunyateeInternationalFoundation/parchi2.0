import React from "react";
import SideBar from "../UI/Sidebar";
import Navbar from "../UI/Navbar";
import InvoiceList from "../Invoices/InvoiceList";
import {
  Routes,
  Route,
  Outlet,
  useLocation,
  matchPath,
} from "react-router-dom";
import VendorList from "../Vendors/VendorList";
import ProductHome from "../Products/ProductHome";
import Projects from "../Projects/Projects";
import ProjectView from "../Projects/ProjectView/ProjectView";
import CreateProject from "../Projects/CreateProject/CreateProject";
import CustomerList from "../Customers/CustomerList";
import Tasks from "../Projects/ProjectView/Tasks/Tasks";
import Milestone from "../Projects/ProjectView/Milestone/Milestone";
import Files from "../Projects/ProjectView/Files/Files";
import Approval from "../Projects/ProjectView/Approvals/Approval";
import Users from "../Projects/ProjectView/Users/Users";
import StaffPayout from "../Staff&Payout/StaffPayout";
import Staff from "../Staff&Payout/Staff/Staff";
import Items from "../Projects/ProjectView/Items/Items";
import Chats from "../Projects/ProjectView/Chats/Chats";
import CustomerView from "../Customers/CustomerView/CustomerView";
import VendorView from "../Vendors/VendorView/VendorView";
import StaffView from "../Staff&Payout/Staff/StaffView/StaffView";
import PO from "../PO/PO";
import CreatePo from "../PO/CreatePo";
import Branches from "../Staff&Payout/Branches/Branches";
import Roles from "../Staff&Payout/Roles/Roles";
import Services from "../Services/Services";
import ServicesList from "../ServicesList/ServicesList";
import CreateService from "../Services/CreateService/CreateService";
import InvoiceView from "../Invoices/InvoiceView/InvoiceView";
import Expense from "../Expense/Expense";
import BookList from "../Expense/Book/BookList";
import Quotation from "../Quotation/Quotation";
import QuotationViewHome from "../Quotation/QuotationView/QuotationViewHome";
import POS from "../POS/POS";
import POSView from "../POS/POSView/POSView";
import ProFormaInvoice from "../ProFormaInvoice/ProFormaInvoice";
// import CreateProFormaInvoice from "../ProFormaInvoice/CreateProFormaInvoice/CreateProFormaInvoice";
import ProFormaView from "../ProFormaInvoice/ProFormaInvoiceView/ProFormaView";
import Reminder from "../Reminder/Reminder";
import Designation from "../Staff&Payout/Designation/Designation";
import Assets from "../Staff&Payout/Assets/Assets";
import Attendance from "../Staff&Payout/Attendance/Attendance";
import DesignationView from "../Staff&Payout/Designation/DesignationView";
import WeekOff from "../Staff&Payout/WeekOff/WeekOff";
import EditService from "../Services/CreateService/EditService";
import SetInvoice from "../Invoices/SetInvoice/SetInvoice";
import SetQuotation from "../Quotation/SetQuotation/SetQuotation";
import VendorPO from "../VendorDashBoard/VendorPO";
import Payment from "../Projects/ProjectView/Payment/Payment";
import CreditNoteList from "../CreditNote/CreditNoteList";
import CreditNoteView from "../CreditNote/CreditNoteView/CreditNoteView";
import SetCreditNote from "../CreditNote/SetCreditNote/SetCreditNote";
import DeliveryChallanList from "../DeliveryChallan/DeliveryChallanList";
import DeliveryChallanView from "../DeliveryChallan/DeliveryChallanView/DeliveryChallanView";
import SetDeliveryChallan from "../DeliveryChallan/SetDeliveryChallan/SetDeliveryChallan";
import PoView from "../PO/PoView/PoView";
import SetPO from "../PO/SetPO/SetPO";
import SetProFormaInvoice from "../ProFormaInvoice/SetProFormaInvoice/SetProFormaInvoice";
import SetPos from "../POS/SetPos/SetPos";
import Purchase from "../Purchase/Purchase";
import PurchaseViewHome from "../Purchase/PurchaseView/PurchaseViewHome";
import SetPurchase from "../Purchase/SetPurchase/SetPurchase";
import Settings from "../Settings/Settings";
import SettingView from "../Settings/SettingView";
import ProductViewHome from "../Products/ProductView/ProductViewHome";
import UserProfile from "../Settings/UserProfile";
import Prefix from "../Settings/Prefix";
import ServiceView from "../Services/ServicesView/ServiceView";

const Home = () => {
  const location = useLocation();

  const matchPathList = [
    "/invoice/create-invoice",
    "/projects/create-Project",
    "/customers/:id",
    "/vendors/:id",
    "/staff-payout/staff/:id",
    "/create-po",
    "/services/create-service",
  ];
  const match = [
    "user",
    "/user/user-profile",
    "/user/company-profile",
    "/user/prefix",
  ];

  const noSideBarPagesList = match.find((path) =>
    matchPath({ path }, location.pathname)
  );

  return (
    <div>
      <div style={{ height: "8vh" }}>
        <Navbar />
      </div>
      <div className="flex" style={{ height: "92vh" }}>
        {!noSideBarPagesList ? (
          <div>
            <SideBar />
          </div>
        ) : (
          <div className="w-1/4">
            <SettingView />
          </div>
        )}
        <div style={{ width: "100%", height: "92vh" }} className="bg-gray-100">
          <Routes>
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
            <Route path="/pos" element={<POS />}></Route>
            <Route path="/pos/:id" element={<POSView />}></Route>
            <Route path="/pos/create-pos" element={<SetPos />}></Route>
            <Route path="/pos/:posId/edit-pos" element={<SetPos />}></Route>
            <Route path="/customers" element={<CustomerList />}></Route>
            <Route path="/customers/:id" element={<CustomerView />}></Route>
            <Route path="/vendors" element={<VendorList />}></Route>
            <Route path="/vendors/:id" element={<VendorView />}></Route>
            <Route path="/products" element={<ProductHome />}></Route>
            <Route path="/services-list" element={<ServicesList />}></Route>
            <Route path="/service/:id" element={<ServiceView />}></Route>
            <Route path="/projects" element={<Projects />}></Route>
            <Route path="/products/:id" element={<ProductViewHome />}></Route>

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
            <Route path="/staff-payout" element={<StaffPayout />}></Route>
            <Route path="/staff-payout/staff" element={<Staff />}></Route>
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
            <Route path="/staff-payout/roles" element={<Roles />}></Route>
            <Route path="/staff-payout/assets" element={<Assets />}></Route>
            <Route path="/staff-payout/weekOff" element={<WeekOff />}></Route>
            <Route
              path="/staff-payout/attendance"
              element={<Attendance />}
            ></Route>

            <Route path="/services" element={<Services />}></Route>
            <Route
              path="/services/create-service"
              element={<CreateService />}
            ></Route>
            <Route
              path="/services/:id/edit-service"
              element={<EditService />}
            ></Route>
            <Route path="/po" element={<PO />}></Route>

            <Route path="/po/:id" element={<PoView />}></Route>
            <Route path="/po/create-po" element={<SetPO />}></Route>
            <Route path="/po/:poId/edit-po" element={<SetPO />}></Route>
            {/* <Route path="/create-po" element={<CreatePo />}></Route> */}
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
              path="/credit-note/:creditnoteId/edit-creditnote"
              element={<SetCreditNote />}
            ></Route>
            <Route path="/vendor/po" element={<VendorPO />}></Route>
            <Route path="/user/user-profile" element={<UserProfile />}></Route>
            <Route path="/user/company-profile" element={<Settings />}></Route>
            <Route path="/user" element={<Settings />}></Route>
            <Route path="/user/prefix" element={<Prefix />}></Route>
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
