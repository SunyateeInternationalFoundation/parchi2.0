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
import DebitNoteList from "../DebitNote/DebitNoteList";
import DebitNoteView from "../DebitNote/DebitNoteView/DebitNoteView";
import SetDebitNote from "../DebitNote/SetDebitNote/SetDebititNote";
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
import ProjectViewHome from "../Projects/ProjectView/ProjectViewHome";
import Purchase from "../Purchase/Purchase";
import PurchaseViewHome from "../Purchase/PurchaseView/PurchaseViewHome";
import SetPurchase from "../Purchase/SetPurchase/SetPurchase";
import Quotation from "../Quotation/Quotation";
import QuotationViewHome from "../Quotation/QuotationView/QuotationViewHome";
import SetQuotation from "../Quotation/SetQuotation/SetQuotation";
import SetService from "../Services/CreateService/SetService";
import Services from "../Services/Services";
import ServicesList from "../ServicesList/ServicesList";
import StaffView from "../Staff&Payout/Staff/StaffView/StaffView";
import Navbar from "../UI/Navbar";
import VendorList from "../Vendors/VendorList";
import VendorView from "../Vendors/VendorView/VendorView";
import StaffDashboard from "./StaffDashboard";

const StaffHome = () => {
  const dispatch = useDispatch();
  const [staffDetails, setStaffDetails] = useState(null);
  const userDetails = useSelector((state) => state.users);
  const { selectedStaffCompanyIndex } = userDetails;

  useEffect(() => {
    setStaffDetails(userDetails.asAStaffCompanies);
    if (userDetails.asAStaffCompanies.length == 0) {
      fetchCompanyDetails();
    }
  }, [userDetails]);

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
            const { companyRef, dateOfJoining, ...data } = doc.data();
            const companyDoc = await getDoc(companyRef);
            const { userRef, ...companyData } = companyDoc.data();
            return {
              id: doc.id,
              ...data,
              dateOfJoining: JSON.stringify(dateOfJoining),
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

  function checkPermission(field, subField) {
    if (!staffDetails || !staffDetails[selectedStaffCompanyIndex]?.roles) {
      return false;
    }
    const isTrue = staffDetails[selectedStaffCompanyIndex]?.roles[field];

    return isTrue && (isTrue[subField] ?? false);
  }

  return (
    <div>
      <div style={{ height: "8vh" }}>
        <Navbar />
      </div>
      <div className="flex" style={{ height: "92vh" }}>
        <div style={{ width: "100%", height: "92vh" }} className="bg-gray-100">
          <Routes>
            {staffDetails?.length > 0 && (
              <Route
                path="/"
                element={
                  <StaffDashboard
                    checkPermission={checkPermission}
                    staffDetails={staffDetails[selectedStaffCompanyIndex]}
                  />
                }
              ></Route>
            )}
            {userDetails.asAStaffCompanies.length > 0 && (
              <Route path="/profile/:id" element={<StaffView />}></Route>
            )}

            {checkPermission("invoice", "view") && (
              <Route path="/invoice" element={<InvoiceList />}></Route>
            )}

            {checkPermission("invoice", "view") && (
              <Route path="/invoice/:id" element={<InvoiceView />}></Route>
            )}
            {checkPermission("invoice", "create") && (
              <Route
                path="/invoice/create-invoice"
                element={<SetInvoice />}
              ></Route>
            )}
            {checkPermission("invoice", "edit") && (
              <Route
                path="/invoice/:invoiceId/edit-invoice"
                element={<SetInvoice />}
              ></Route>
            )}
            {checkPermission("quotation", "view") && (
              <Route path="/quotation" element={<Quotation />}></Route>
            )}
            {checkPermission("quotation", "view") && (
              <Route
                path="/quotation/:id"
                element={<QuotationViewHome />}
              ></Route>
            )}
            {checkPermission("quotation", "create") && (
              <Route
                path="/quotation/create-quotation"
                element={<SetQuotation />}
              ></Route>
            )}
            {checkPermission("quotation", "edit") && (
              <Route
                path="/quotation/:quotationId/edit-quotation"
                element={<SetQuotation />}
              ></Route>
            )}
            {checkPermission("purchase", "view") && (
              <Route path="/purchase" element={<Purchase />}></Route>
            )}
            {checkPermission("purchase", "view") && (
              <Route
                path="/purchase/:id"
                element={<PurchaseViewHome />}
              ></Route>
            )}
            {checkPermission("purchase", "create") && (
              <Route
                path="/purchase/create-purchase"
                element={<SetPurchase />}
              ></Route>
            )}
            {checkPermission("purchase", "edit") && (
              <Route
                path="/purchase/:purchaseId/edit-purchase"
                element={<SetPurchase />}
              ></Route>
            )}

            <Route path="/projects" element={<Projects />}></Route>

            {checkPermission("project", "create") && (
              <Route
                path="/projects/create-project"
                element={<CreateProject />}
              ></Route>
            )}

            <Route path="/projects/:id" element={<ProjectViewHome />} />

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
            ></Route> */}

            {/* {checkPermission("projects", "view") && (
              <Route
                path="/projects/:id/payments"
                element={<Payment />}
              ></Route>
            )} */}
            {/* {checkPermission("projects", "view") && (
              <Route path="/projects/:id/items" element={<Items />}></Route>
            )} */}
            {/* {checkPermission("projects", "view") && (
              <Route path="/projects/:id/chats" element={<Chats />}></Route>
            )} */}
            {checkPermission("customers", "view") && (
              <Route path="/customers" element={<CustomerList />}></Route>
            )}
            {checkPermission("customers", "view") && (
              <Route path="/customers/:id" element={<CustomerView />}></Route>
            )}
            {checkPermission("vendors", "view") && (
              <Route path="/vendors" element={<VendorList />}></Route>
            )}
            {checkPermission("vendors", "view") && (
              <Route path="/vendors/:id" element={<VendorView />}></Route>
            )}
            {checkPermission("po", "view") && (
              <Route path="/po" element={<PO />}></Route>
            )}
            {checkPermission("po", "view") && (
              <Route path="/po/:id" element={<PoView />}></Route>
            )}
            {checkPermission("po", "create") && (
              <Route path="/po/create-po" element={<SetPO />}></Route>
            )}
            {checkPermission("po", "edit") && (
              <Route path="/po/:poId/edit-po" element={<SetPO />}></Route>
            )}
            {checkPermission("subscription", "view") && (
              <Route path="/subscriptions" element={<Services />}></Route>
            )}
            {checkPermission("subscription", "create") && (
              <Route
                path="/subscriptions/create-subscription"
                element={<SetService />}
              ></Route>
            )}
            {checkPermission("subscription", "edit") && (
              <Route
                path="/subscriptions/:id/edit-subscription"
                element={<SetService />}
              ></Route>
            )}
            {checkPermission("subscription", "view") && (
              <Route path="/plan-list" element={<ServicesList />}></Route>
            )}
            {checkPermission("deliveryChallan", "view") && (
              <Route
                path="/delivery-challan"
                element={<DeliveryChallanList />}
              ></Route>
            )}
            {checkPermission("deliveryChallan", "view") && (
              <Route
                path="/delivery-challan/:id"
                element={<DeliveryChallanView />}
              ></Route>
            )}
            {checkPermission("deliveryChallan", "create") && (
              <Route
                path="/delivery-challan/create-deliverychallan"
                element={<SetDeliveryChallan />}
              ></Route>
            )}
            {checkPermission("deliveryChallan", "edit") && (
              <Route
                path="/delivery-challan/:deliverychallanId/edit-deliverychallan"
                element={<SetDeliveryChallan />}
              ></Route>
            )}
            {checkPermission("creditNote", "view") && (
              <Route path="/credit-note" element={<CreditNoteList />}></Route>
            )}
            {checkPermission("creditNote", "view") && (
              <Route
                path="/credit-note/:id"
                element={<CreditNoteView />}
              ></Route>
            )}
            {checkPermission("creditNote", "create") && (
              <Route
                path="/credit-note/create-creditnote"
                element={<SetCreditNote />}
              ></Route>
            )}
            {checkPermission("creditNote", "edit") && (
              <Route
                path="/credit-note/:creditNoteId/edit-creditnote"
                element={<SetCreditNote />}
              ></Route>
            )}
            {checkPermission("pos", "view") && (
              <Route path="/pos" element={<POS />}></Route>
            )}
            {checkPermission("pos", "view") && (
              <Route path="/pos/:id" element={<POSView />}></Route>
            )}
            {checkPermission("pos", "create") && (
              <Route path="/pos/create-pos" element={<SetPos />}></Route>
            )}
            {checkPermission("pos", "edit") && (
              <Route path="/pos/:posId/edit-pos" element={<SetPos />}></Route>
            )}
            {checkPermission("proFormaInvoice", "view") && (
              <Route
                path="/pro-forma-invoice"
                element={<ProFormaInvoice />}
              ></Route>
            )}
            {checkPermission("proFormaInvoice", "view") && (
              <Route
                path="/pro-forma-invoice/:id"
                element={<ProFormaView />}
              ></Route>
            )}
            {checkPermission("proFormaInvoice", "create") && (
              <Route
                path="/pro-forma-invoice/create-proForma-invoice"
                element={<SetProFormaInvoice />}
              ></Route>
            )}
            {checkPermission("proFormaInvoice", "edit") && (
              <Route
                path="/pro-forma-invoice/:proFormaId/edit-proForma-invoice"
                element={<SetProFormaInvoice />}
              ></Route>
            )}

            {checkPermission("debitNote", "view") && (
              <Route path="/debit-note" element={<DebitNoteList />}></Route>
            )}
            {checkPermission("debitNote", "view") && (
              <Route path="/debit-note/:id" element={<DebitNoteView />}></Route>
            )}
            {checkPermission("debitNote", "create") && (
              <Route
                path="/debit-note/create-debitnote"
                element={<SetDebitNote />}
              ></Route>
            )}
            {checkPermission("debitNote", "edit") && (
              <Route
                path="/debit-note/:debitNoteId/edit-debitnote"
                element={<SetDebitNote />}
              ></Route>
            )}
          </Routes>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
