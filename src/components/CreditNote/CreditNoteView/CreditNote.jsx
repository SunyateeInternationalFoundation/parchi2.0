import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import jsPDF from "jspdf";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoPrintOutline,
} from "react-icons/io5";
import { LiaTrashAltSolid } from "react-icons/lia";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import man from "../../../assets/dashboard/man.png";
import { db } from "../../../firebase";
import Template1 from "../../Templates/Template1";
import Template10 from "../../Templates/Template10";
import Template11 from "../../Templates/Template11";
import Template2 from "../../Templates/Template2";
import Template3 from "../../Templates/Template3";
import Template4 from "../../Templates/Template4";
import Template5 from "../../Templates/Template5";
import Template6 from "../../Templates/Template6";
import Template7 from "../../Templates/Template7";
import Template8 from "../../Templates/Template8";
import Template9 from "../../Templates/Template9";

const CreditNote = ({ creditNote, bankDetails, selectTemplate }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const print = searchParams.get("print");
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.creditNote;
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);
  const [totalTax, setTotalTax] = useState(0);

  const creditNoteRef = useRef();
  const reactToPrintFn = useReactToPrint({
    contentRef: creditNoteRef,
  });

  const templatesComponents = {
    template1: (
      <Template1
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),

    template2: (
      <Template2
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),

    template3: (
      <Template3
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),

    template4: (
      <Template4
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
    template5: (
      <Template5
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),

    template6: (
      <Template6
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
    template7: (
      <Template7
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
    template8: (
      <Template8
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
    template9: (
      <Template9
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
    template10: (
      <Template10
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
    template11: (
      <Template11
        ref={creditNoteRef}
        dataSet={creditNote}
        bankDetails={bankDetails}
      />
    ),
  };
  useEffect(() => {
    if (creditNote.products) {
      const tax = creditNote?.products.reduce((acc, cur) => {
        return acc + cur?.tax;
      }, 0);

      setTotalTax(tax);
    }
    if (print === "true") {
      reactToPrintFn();
    }
  }, [creditNote, print]);

  const handleDownloadPdf = () => {
    if (!creditNote.id) {
      return;
    }
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(creditNoteRef.current, {
      callback: function (doc) {
        doc.save(`${creditNote.userTo.name}'s creditNote.pdf`);
      },
      x: 0,
      y: 0,
    });
  };

  const handleDelete = async () => {
    try {
      if (!creditNote.id || !companyId) {
        alert("creditNote ID or Company ID is missing.");
        return;
      }

      const creditNoteDocRef = doc(
        db,
        "companies",
        companyId,
        "creditNote",
        creditNote.id
      );

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this CreditNote?"
      );
      if (!confirmDelete) return;
      await deleteDoc(creditNoteDocRef);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: creditNoteDocRef,
        date: serverTimestamp(),
        section: "Credit Note",
        action: "Delete",
        description: `${creditNote.prefix}-${creditNote.no} deleted by ${creditNote.createdBy.who}`,
      });
      navigate("./../");
    } catch (error) {
      console.error("Error deleting creditNote:", error);
      alert("Failed to delete the creditNote. Check the console for details.");
    }
  };

  function DateFormate(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }
  const columns = [
    {
      id: 1,
      label: "NAME",
    },
    {
      id: 2,
      label: "QUANTITY",
    },
    {
      id: 3,
      label: "DISCOUNT",
    },
    {
      id: 4,
      label: "TAX",
    },
    {
      id: 5,
      label: "isTax Included",
    },
    {
      id: 6,
      label: "PRICE",
    },
  ];
  const handleViewTemplate = () => {
    const state = {
      dataSet: creditNote,
      bankDetails: bankDetails,
    };

    const encodedState = btoa(JSON.stringify(state));

    const url = `/template/${selectTemplate}?state=${encodedState}`;

    window.open(url, "_blank");
  };
  return (
    <div className="bg-white mt-3 rounded-lg shadow-md overflow-hidden">
      <div className=" flex justify-between bg-white mt-3 border-b rounded-t-lg px-5 py-4">
        <div className="space-x-4 flex ">
          <button
            className={
              "px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
            }
            onClick={handleViewTemplate}
          >
            <IoDocumentTextOutline /> &nbsp; View
          </button>

          {(userDetails.selectedDashboard === "" || role?.edit) && (
            <button
              className={
                "px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
              }
              onClick={() => navigate("edit-creditnote")}
            >
              <TbEdit /> &nbsp; Edit
            </button>
          )}
          <button
            className={
              "px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
            }
            onClick={handleDownloadPdf}
          >
            <IoDownloadOutline /> &nbsp; Save As PDF
          </button>
          <button className="px-4 py-1 text-gray-600  rounded-md flex items-center  border hover:bg-black hover:text-white">
            <FaWhatsapp /> &nbsp; Share on WhatsApp
          </button>
          <button className="px-4 py-1 text-gray-600 rounded-md flex items-center  border hover:bg-black hover:text-white">
            <MdOutlineMarkEmailRead /> &nbsp; Share via Email
          </button>
          <button
            className="px-4 py-1 text-gray-600 rounded-md flex items-center  border hover:bg-black hover:text-white"
            onClick={() => reactToPrintFn()}
          >
            <IoPrintOutline /> &nbsp; Print
          </button>
        </div>
        <div className="flex items-center">
          {creditNote.paymentStatus !== "Paid" && (
            <div className="text-end">
              {(userDetails.selectedDashboard === "" || role?.delete) && (
                <button
                  className={
                    "px-4 py-1 text-red-700 flex items-center border rounded-md hover:bg-red-700 hover:text-white"
                  }
                  onClick={handleDelete}
                >
                  <LiaTrashAltSolid />
                  &nbsp; Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto px-6" style={{ height: "70vh" }}>
        <div className="p-5 bg-white rounded-lg">
          <div className="flex gap-6 flex-col md:flex-row pt-8">
            <div className="flex-1">
              <div className="border w-[89px] h-[89px] shadow flex items-center justify-center">
                {companyDetails.companyLogo ? (
                  <img
                    src={companyDetails.companyLogo}
                    className="rounded-md object-contain w-[89px] h-[89px]"
                  />
                ) : (
                  <img
                    src={man}
                    className="rounded-full object-contain w-[89px] h-[89px]"
                  />
                )}
              </div>
              <div className="mt-5">
                <div className="text-lg font-semibold text-gray-900">
                  Billing To:
                </div>
                <div className="text-lg  text-gray-800 mt-1">
                  {creditNote.userTo?.name}
                </div>
                <div className=" text-gray-600 mt-2">
                  {creditNote.userTo?.address} <br />
                  {creditNote.userTo?.city} <br />
                  {creditNote.userTo?.zipCode} <br />
                </div>
              </div>
            </div>
            <div className="flex-none md:text-end">
              <div className="text-4xl font-semibold text-gray-900">
                CreditNote #
              </div>
              <div className="mt-1.5 text-xl  text-gray-600">
                {creditNote.prefix}-{creditNote.no}
              </div>
              <div className="mt-4  text-gray-600">
                {creditNote.createdBy?.name} <br />
                {creditNote.createdBy?.address} <br />
                {creditNote.createdBy?.city} <br />
                {creditNote.createdBy?.zipCode} <br />
                Mobile:{creditNote.createdBy?.phoneNo} <br />
                Email:{creditNote.createdBy?.email}
                <br />
                GST: {companyDetails?.gst}
              </div>
              <div className="mt-8">
                <div className="mb-2.5">
                  <span className="mr-12  font-semibold text-gray-900">
                    CreditNote Date:
                  </span>
                  <span className="  text-gray-600">
                    {DateFormate(creditNote?.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border-2  rounded-lg">
            <table className="w-full ">
              <thead>
                <tr className="border-b-2 [&_th:last-child]:text-end">
                  {columns.map((column) => (
                    <th
                      key={`creditNote-table-${column.id}`}
                      className="text-start p-3 "
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-1 ">
                {creditNote?.products?.length > 0 &&
                  creditNote?.products.map((item) => (
                    <tr
                      key={`creditNote-description-${item.id}`}
                      className="border-b-2 p-3 [&_td:last-child]:text-end"
                    >
                      <td className="  text-gray-600 max-w-[200px] truncate p-3">
                        {item.name}
                      </td>
                      <td className="  text-gray-600 p-3">
                        {item.quantity} pcs
                      </td>
                      <td className="  text-gray-600 whitespace-nowrap p-3">
                        {item.discount}
                      </td>
                      <td className="  text-gray-600 whitespace-nowrap p-3">
                        {item.tax}%
                      </td>
                      <td className="  text-gray-600 whitespace-nowrap p-3">
                        {item.sellingPriceTaxType ? "YES" : "NO"}
                      </td>
                      <td className="ltr:text-right rtl:text-left   text-gray-600 p-3">
                        ₹{item.sellingPrice}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="mt-2 flex justify-end  p-6">
              <div>
                {[
                  {
                    label: "Sub Total",
                    amount: creditNote.subTotal,
                  },
                  {
                    label: "Extra Discount",
                    amount:
                      creditNote?.extraDiscountType === "percentage"
                        ? `${creditNote?.extraDiscount || 0}%`
                        : `₹${creditNote?.extraDiscount || 0}`,
                  },
                  {
                    label: "TAX(%)",
                    amount: totalTax,
                  },
                  {
                    label: "Shipping",
                    amount: "₹" + creditNote.shippingCharges,
                  },
                  {
                    label: "Packaging",
                    amount: "₹" + creditNote.packagingCharges,
                  },
                ].map((item, index) => (
                  <div
                    key={`creditNote-item-${index}`}
                    className="mb-3 text-end flex justify-end "
                  >
                    <span className="  text-gray-600 ">{item.label}:</span>
                    <span className="  text-end w-[100px] md:w-[160px] block ">
                      {item.amount}
                    </span>
                  </div>
                ))}
                <div className="mb-3 text-end flex justify-end ">
                  <span className="  text-gray-600 ">Total :</span>
                  <span className="   text-end w-[100px] md:w-[160px] block  font-bold">
                    {creditNote.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="  text-gray-600 mt-6">Note:</div>
          <div className=" text-gray-800">{creditNote.notes || "No notes"}</div>
          <div className="mt-3.5   text-gray-600">Terms & Conditions:</div>
          <div className=" text-gray-800 mt-1">
            {creditNote.terms || "No Terms and Conditions"}
          </div>
          <div className="mt-6 text-lg font-semibold text-gray-900">
            Thank You!
          </div>
          <div className="mt-1  text-gray-800">
            If you have any questions concerning this creditNote, use the
            following contact information:
          </div>
          <div className="text-xs text-gray-800 mt-2">
            {creditNote.createdBy?.email}
          </div>
          <div className="text-xs text-gray-800 mt-1">
            {creditNote.createdBy?.phoneNo}
          </div>
          <div className="mt-8 text-xs text-gray-800">© 2025 Sunya</div>
        </div>
      </div>

      {creditNote.id && (
        <div
          className="fixed inset-0 z-20 "
          onClick={() => setIsCreditNoteOpen(false)}
          style={{ display: isCreditNoteOpen ? "block" : "none" }}
        >
          <div
            className="fixed inset-0 flex pt-10 justify-center z-20 "
            style={{ backgroundColor: "#0009" }}
          >
            <div className="h-4/5 " onClick={(e) => e.stopPropagation()}>
              <div className="bg-white mb-5 overflow-y-auto w-fit h-fit rounded ">
                <div className="flex justify-end border-b-2 py-2">
                  <div
                    className="relative text-2xl text-red-700 group px-2 cursor-pointer"
                    onClick={() => setIsCreditNoteOpen(false)}
                  >
                    <IoMdClose />
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-8 px-1 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 z-200">
                      Close
                    </div>
                  </div>
                </div>
                {templatesComponents[selectTemplate]}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
CreditNote.propTypes = {
  creditNote: PropTypes.object.isRequired,
  bankDetails: PropTypes.object,
  selectTemplate: PropTypes.string,
};

export default CreditNote;
