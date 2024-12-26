import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import DebitNote from "./DebitNote";

const DebitNoteView = () => {
  const { id } = useParams();
  const [debitNote, setDebitNote] = useState({});
  const userDetails = useSelector((state) => state.users);
  const [bankDetails, setBankDetails] = useState({});

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const fetchDebitNote = async () => {
    try {
      let totalTaxableAmount = 0;
      let totalSgstAmount_2_5 = 0;
      let totalCgstAmount_2_5 = 0;
      let totalSgstAmount_6 = 0;
      let totalCgstAmount_6 = 0;
      let totalSgstAmount_9 = 0;
      let totalCgstAmount_9 = 0;
      let tax = 0;
      const debitNoteRef = doc(db, "companies", companyId, "debitNote", id);
      const { customerDetails, debitNoteNo, ...resData } = (
        await getDoc(debitNoteRef)
      ).data();
      const debitNoteData = {
        id,
        ...resData,
        type: "Debit Note",
        no: debitNoteNo,
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

      if (debitNoteData?.book?.bookRef) {
        const bankData = (await getDoc(debitNoteData?.book.bookRef)).data();
        setBankDetails(bankData);
      }
      setDebitNote(debitNoteData);
    } catch (error) {
      console.error("Error fetching debitNote:", error);
    }
  };

  useEffect(() => {
    fetchDebitNote();
  }, [companyId]);

  console.log("debit-note", debitNote);
  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 my-2 ">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">{debitNote.debitNoteNo}</h1>
      </header>

      
      <hr />
      <div className="w-full">
          <div>
            <DebitNote debitNote={debitNote} bankDetails={bankDetails} />
          </div>
      </div>
    </div>
  );
};

export default DebitNoteView;