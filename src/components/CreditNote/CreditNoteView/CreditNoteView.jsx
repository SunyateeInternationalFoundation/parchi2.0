import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import SelectTemplateSideBar from "../../Templates/SelectTemplateSideBar";
import CreditNote from "./CreditNote";

const CreditNoteView = () => {
  const { id } = useParams();
  const [creditNote, setCreditNote] = useState({});
  const userDetails = useSelector((state) => state.users);
  const [bankDetails, setBankDetails] = useState({});
  const [selectTemplate, setSelectTemplate] = useState("template1");
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);

  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }

  const fetchCreditNote = async () => {
    try {
      let totalTaxableAmount = 0;
      let totalSgstAmount_2_5 = 0;
      let totalCgstAmount_2_5 = 0;
      let totalSgstAmount_6 = 0;
      let totalCgstAmount_6 = 0;
      let totalSgstAmount_9 = 0;
      let totalCgstAmount_9 = 0;
      let tax = 0;
      const creditNoteRef = doc(db, "companies", companyId, "creditNote", id);
      const { customerDetails, creditNoteNo, ...resData } = (
        await getDoc(creditNoteRef)
      ).data();
      const creditNoteData = {
        id,
        ...resData,
        type: "Credit Note",
        no: creditNoteNo,
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

      if (creditNoteData?.book?.bookRef) {
        const bankData = (await getDoc(creditNoteData?.book.bookRef)).data();
        setBankDetails(bankData);
      }
      setCreditNote(creditNoteData);
    } catch (error) {
      console.error("Error fetching creditnote:", error);
    }
  };

  useEffect(() => {
    fetchCreditNote();
  }, [companyId]);

  return (
    <div className=" pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center bg-white  p-3 space-x-3">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold pe-4 w-full">
          {creditNote.prefix}-{creditNote.no}
        </h1>
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

      <hr />
      <div className="w-full px-5">
        <div>
          <CreditNote
            creditNote={creditNote}
            selectTemplate={selectTemplate}
            bankDetails={bankDetails}
          />
        </div>
      </div>
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
};

export default CreditNoteView;
