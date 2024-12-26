import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import QuotationView from "./QuotationView";

function QuotationViewHome() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Quotation");
  const [quotation, setQuotation] = useState({});
  const userDetails = useSelector((state) => state.users);
  const [bankDetails, setBankDetails] = useState({});

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const fetchQuotations = async () => {
    try {
      let totalTaxableAmount = 0;
      let totalSgstAmount_2_5 = 0;
      let totalCgstAmount_2_5 = 0;
      let totalSgstAmount_6 = 0;
      let totalCgstAmount_6 = 0;
      let totalSgstAmount_9 = 0;
      let totalCgstAmount_9 = 0;
      let tax = 0;
      const invoiceRef = doc(db, "companies", companyId, "quotations", id);
      const { customerDetails, quotationNo, ...resData } = (
        await getDoc(invoiceRef)
      ).data();
      const quotationsData = {
        id,
        type: "Quotation",
        ...resData,
        no: quotationNo,
        userTo: customerDetails,
        products: resData.products.map((item) => {
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

      if (quotationsData.book?.bookRef) {
        const bankData = (await getDoc(quotationsData.book.bookRef)).data();
        setBankDetails(bankData);
      }
      setQuotation(quotationsData);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };
  useEffect(() => {
    fetchQuotations();
  }, [companyId]);

  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 my-2 ">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">{quotation.quotationNo}</h1>
      </header>
      <hr />
      <div className="w-full">
        {activeTab === "Quotation" && (
          <div>
            <QuotationView quotation={quotation} bankDetails={bankDetails} />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuotationViewHome;
