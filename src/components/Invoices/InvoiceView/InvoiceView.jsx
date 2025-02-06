import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { db } from "../../../firebase";
import SelectTemplateSideBar from "../../Templates/SelectTemplateSideBar";
import Invoice from "./Invoice";
import Returns from "./Returns";
import ReturnsHistory from "./ReturnsHistory";

function InvoiceView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get("tab");
  // const [activeTab, setActiveTab] = useState("Invoice");
  const [invoice, setInvoice] = useState({});
  const userDetails = useSelector((state) => state.users);
  const [bankDetails, setBankDetails] = useState({});
  const [returnData, setReturnData] = useState([]);
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }

  const fetchInvoices = async () => {
    try {
      let totalTaxableAmount = 0;
      let totalSgstAmount_2_5 = 0;
      let totalCgstAmount_2_5 = 0;
      let totalSgstAmount_6 = 0;
      let totalCgstAmount_6 = 0;
      let totalSgstAmount_9 = 0;
      let totalCgstAmount_9 = 0;
      let tax = 0;
      const invoiceRef = doc(db, "companies", companyId, "invoices", id);
      const { customerDetails, invoiceNo, ...resData } = (
        await getDoc(invoiceRef)
      ).data();
      const invoicesData = {
        id,
        ...resData,
        type: "Invoice",
        no: invoiceNo,
        userTo: customerDetails,
        items: resData.products.map((item) => {
          let discount = +item.discount || 0;

          if (item.discountType) {
            discount = (+item.sellingPrice / 100) * item.discount;
          }
          const netAmount = item.sellingPrice - (discount || 0);
          const taxRate = item.tax || 0;
          const sgst = taxRate / 2;
          const cgst = taxRate / 2;
          const taxAmount = netAmount * (taxRate / 100);
          const sgstAmount = netAmount * (sgst / 100);
          const cgstAmount = netAmount * (cgst / 100);
          tax += item.tax || 0;
          item.returnQty = 0;
          if (returnData.length > 0) {
            const returnProductQty = returnData.reduce((acc, cur) => {
              if (cur.productRef.id === item.productRef.id) {
                acc += cur.quantity;
              }
              return acc;
            }, 0);

            item.returnQty = returnProductQty || 0;
          }
          totalTaxableAmount += netAmount * item.quantity;
          totalSgstAmount_2_5 += sgst === 2.5 ? sgstAmount * item.quantity : 0;
          totalCgstAmount_2_5 += cgst === 2.5 ? cgstAmount * item.quantity : 0;
          totalSgstAmount_6 += sgst === 6 ? sgstAmount * item.quantity : 0;
          totalCgstAmount_6 += cgst === 6 ? cgstAmount * item.quantity : 0;
          totalSgstAmount_9 += sgst === 9 ? sgstAmount * item.quantity : 0;
          totalCgstAmount_9 += cgst === 9 ? cgstAmount * item.quantity : 0;
          return {
            ...item,
            sgst,
            cgst,
            taxAmount,
            sgstAmount,
            cgstAmount,
            totalAmount: netAmount * item.quantity,
            netAmount,
          };
        }),
        tax,
        totalTaxableAmount,
        totalSgstAmount_2_5,
        totalCgstAmount_2_5,
        totalSgstAmount_6,
        totalCgstAmount_6,
        totalSgstAmount_9,
        totalCgstAmount_9,
      };

      if (invoicesData.book.bookRef) {
        const bankData = (await getDoc(invoicesData.book.bookRef)).data();
        setBankDetails(bankData);
      }
      setInvoice(invoicesData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  async function fetchReturnData() {
    try {
      const returnsRef = collection(
        db,
        "companies",
        companyId,
        "invoices",
        id,
        "returns"
      );
      const q = query(returnsRef, orderBy("createdAt", "desc"));
      const getDataDocs = await getDocs(q);

      const getData = getDataDocs.docs.map((doc) => {
        const { createdAt, ...data } = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: createdAt,
        };
      });
      setReturnData(getData);
    } catch (error) {
      console.log("🚀 ~ fetchReturnData ~ error:", error);
    }
  }
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);

  const [selectTemplate, setSelectTemplate] = useState("template1");
  // useEffect(() => {
  //   fetchReturnData();
  // }, [companyId]);

  useEffect(() => {
    fetchInvoices();
  }, [returnData]);

  useEffect(() => {
    if (!tab) {
      navigate("?tab=Invoice");
    }
    fetchReturnData();
  }, [companyId]);

  return (
    <div className=" pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center bg-white  px-3 space-x-3">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold pe-4">
          {invoice.prefix}-{invoice.no}
        </h1>

        <nav className="flex space-x-4 w-full">
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (tab === "Invoice" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => navigate("?tab=Invoice")}
          >
            Invoice View
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (tab === "Returns" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => navigate("?tab=Returns")}
          >
            Returns
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (tab === "ReturnsHistory" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => navigate("?tab=ReturnsHistory")}
          >
            Return History
          </button>
        </nav>
        <div className="flex justify-end w-full">
          <button
            className={
              "px-4 py-2 flex items-center text-blue-500 border-2 rounded-md hover:bg-blue-500 hover:text-white"
            }
            onClick={() => setIsSelectTemplateOpen(true)}
          >
            <CiSettings className="w-6 h-6" />
            &nbsp; Change Template
          </button>
        </div>
      </header>

      <div className="w-full ">
        {tab === "Invoice" && (
          <div>
            <Invoice
              invoice={invoice}
              bankDetails={bankDetails}
              selectTemplate={selectTemplate}
            />
          </div>
        )}
        {tab === "Returns" && (
          <div>
            <Returns invoice={invoice} />
          </div>
        )}
        {tab === "Returns" && (
          <div>
            <ReturnsHistory products={returnData} refresh={fetchReturnData} />
          </div>
        )}
      </div>
      <hr />

      <SelectTemplateSideBar
        isOpen={isSelectTemplateOpen}
        onClose={() => setIsSelectTemplateOpen(false)}
        preSelectedTemplate={selectTemplate}
        onSelectedTemplate={(template) => {
          setSelectTemplate(template);
          setIsSelectTemplateOpen(false);
        }}
      />
    </div>
  );
}

export default InvoiceView;
