import React, { useEffect, useState } from "react";
import CreditNote from "./CreditNote";
import { Link, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const CreditNoteView = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("CreditNote");
  const [creditNote, setCreditNote] = useState({});
  const userDetails = useSelector((state) => state.users);
  const [bankDetails, setBankDetails] = useState({});
  const [returnData, setReturnData] = useState([]);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

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
      const creditNoteRef = doc(db, "companies", companyId, "creditnote", id);
      const { customerDetails, creditNoteNo, ...resData } = (
        await getDoc(creditNoteRef)
      ).data();
      const creditNoteData = {
        id,
        ...resData,
        type: "Credit Note",
        no: creditNoteNo,
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

  //   async function fetchReturnData() {
  //     try {
  //       const returnsRef = collection(
  //         db,
  //         "companies",
  //         companyId,
  //         "creditnote",
  //         id,
  //         "returns"
  //       );
  //       const q = query(returnsRef, orderBy("createdAt", "desc"));
  //       const getDataDocs = await getDocs(q);

  //       const getData = getDataDocs.docs.map((doc) => {
  //         const { createdAt, ...data } = doc.data();
  //         return {
  //           id: doc.id,
  //           ...data,
  //           createdAt: DateFormate(createdAt),
  //         };
  //       });
  //       setReturnData(getData);
  //     } catch (error) {
  //       console.log("🚀 ~ fetchReturnData ~ error:", error);
  //     }
  //   }

  //   useEffect(() => {
  //     fetchReturnData();
  //   }, [companyId]);

  useEffect(() => {
    fetchCreditNote();
  }, [companyId]);

  //   function DateFormate(timestamp) {
  //     const milliseconds =
  //       timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  //     const date = new Date(milliseconds);
  //     const getDate = String(date.getDate()).padStart(2, "0");
  //     const getMonth = String(date.getMonth() + 1).padStart(2, "0");
  //     const getFullYear = date.getFullYear();

  //     return `${getDate}/${getMonth}/${getFullYear}`;
  //   }
  console.log("credit-note", creditNote);
  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 my-2 ">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">{creditNote.creditNoteNo}</h1>
      </header>

      <div>
        <nav className="flex space-x-4 mt-3 mb-3">
          {/* <button
            className={
              "px-4 py-1" +
              (activeTab === "CreditNote"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("CreditNote")}
          >
            CreditNote View
          </button> */}
          {/* <button
            className={
              "px-4 py-1" +
              (activeTab === "Returns"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Returns")}
          >
            Returns
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "ReturnsHistory"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("ReturnsHistory")}
          >
            ReturnsHistory
          </button> */}
        </nav>
      </div>
      <hr />
      <div className="w-full">
        {activeTab === "CreditNote" && (
          <div>
            <CreditNote creditNote={creditNote} bankDetails={bankDetails} />
          </div>
        )}
        {/* {activeTab === "Returns" && (
          <div>
            <Returns creditNote={creditNote} />
          </div>
        )}
        {activeTab === "ReturnsHistory" && (
          <div>
            <ReturnsHistory products={returnData} refresh={fetchReturnData} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CreditNoteView;
