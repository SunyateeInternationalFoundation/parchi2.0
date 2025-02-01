import { deleteDoc, doc, increment, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
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
import { db, storage } from "../../../firebase";
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

function DebitNote({ debitNote, bankDetails, selectTemplate }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const print = searchParams.get("print");
  const userDetails = useSelector((state) => state.users);
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
      ?.debitNote;
  const [isDebitNoteOpen, setIsDebitNoteOpen] = useState(false);

  const [totalTax, setTotalTax] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const debitNoteRef = useRef();
  const reactToPrintFn = useReactToPrint({
    contentRef: debitNoteRef,
  });

  useEffect(() => {
    if (debitNote.products) {
      const tax = debitNote?.products.reduce((acc, cur) => {
        return acc + cur?.tax;
      }, 0);
      const discount = debitNote?.products.reduce((acc, cur) => {
        return acc + cur?.discount;
      }, 0);
      setTotalTax(tax);
      setTotalDiscount(discount);
    }
    if (print === "true") {
      reactToPrintFn();
    }
  }, [debitNote, print]);

  const handleDownloadPdf = () => {
    if (!debitNote.id) {
      return;
    }
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(debitNoteRef.current, {
      callback: function (doc) {
        doc.save(`${debitNote.userTo.name}'s debitNote.pdf`);
      },
      x: 0,
      y: 0,
    });
  };

  const handleWhatsAppShare = async () => {
    if (!debitNote.id) {
      console.error("debitNote ID is missing!");
      return;
    }

    try {
      // Generate the PDF in-memory
      const doc = new jsPDF("p", "pt", "a4");
      doc.html(debitNoteRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");

          // Create a reference to the file in Firebase Storage
          const fileName = `debitNotes/${debitNote.id}.pdf`;
          const fileRef = ref(storage, fileName);

          // Upload the file
          await uploadBytes(fileRef, pdfBlob);

          // Generate a public download URL
          const downloadURL = await getDownloadURL(fileRef);

          // Share the public link via WhatsApp
          const message = `Here is your debitNote for ${debitNote.userToname}: ${downloadURL}`;
          window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
            "_blank"
          );
        },
        x: 0,
        y: 0,
      });
    } catch (error) {
      console.error("Error uploading or sharing the PDF:", error);
    }
  };
  const templatesComponents = {
    template1: (
      <Template1
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),

    template2: (
      <Template2
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),

    template3: (
      <Template3
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),

    template4: (
      <Template4
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
    template5: (
      <Template5
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),

    template6: (
      <Template6
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
    template7: (
      <Template7
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
    template8: (
      <Template8
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
    template9: (
      <Template9
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
    template10: (
      <Template10
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
    template11: (
      <Template11
        ref={debitNoteRef}
        dataSet={debitNote}
        bankDetails={bankDetails}
      />
    ),
  };
  const handleEmailShare = async () => {
    if (!debitNote.id) {
      console.error("debitNote ID is missing!");
      return;
    }

    try {
      // Generate the PDF in-memory
      const doc = new jsPDF("p", "pt", "a4");
      doc.html(debitNoteRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");

          // Create a reference to the file in Firebase Storage
          const fileName = `debitNotes/${debitNote.id}.pdf`;
          const fileRef = ref(storage, fileName);

          // Upload the file to Firebase Storage
          await uploadBytes(fileRef, pdfBlob);

          // Generate a public download URL
          const downloadURL = await getDownloadURL(fileRef);

          // Construct the email subject and body
          const subject = `debitNote for ${debitNote.userToname}`;
          const body = `Hi ${debitNote.userToname},%0D%0A%0D%0AHere is your debitNote for the recent debitNote.%0D%0A%0D%0AYou can download it here: ${downloadURL}`;

          // Open the default email client with pre-filled subject and body
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
        },
        x: 0,
        y: 0,
      });
    } catch (error) {
      console.error("Error uploading or sharing the PDF:", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (!debitNote.id || !companyId) {
        alert("debitNote ID or Company ID is missing.");
        return;
      }

      const debitNoteDocRef = doc(
        db,
        "companies",
        companyId,
        "debitNote",
        debitNote.id
      );

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this debitNote?"
      );
      if (!confirmDelete) return;
      await deleteDoc(debitNoteDocRef);

      if (debitNote.products && debitNote.products.length > 0) {
        const updateInventoryPromises = debitNote.products.map(
          (inventoryItem) => {
            if (
              !inventoryItem.productRef ||
              typeof inventoryItem.quantity !== "number"
            ) {
              console.error("Invalid inventory item:", inventoryItem);
              return Promise.resolve();
            }

            const inventoryDocRef = doc(
              db,
              "companies",
              companyId,
              "products",
              inventoryItem.productRef.id
            );

            return updateDoc(inventoryDocRef, {
              stock: increment(-inventoryItem.quantity),
            });
          }
        );
        await Promise.all(updateInventoryPromises);
      }
      navigate("./../");
    } catch (error) {
      console.error("Error deleting debitNote:", error);
      alert("Failed to delete the debitNote. Check the console for details.");
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
    const serializableInvoice = JSON.parse(JSON.stringify(debitNote));
    const serializableBankDetails = JSON.parse(JSON.stringify(bankDetails));

    const state = {
      invoice: serializableInvoice,
      bankDetails: serializableBankDetails,
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
              onClick={() => navigate("edit-debitnote")}
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
          {debitNote.paymentStatus !== "Paid" && (
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
              <span className="text-3xl font-bold text-primary-600">
                {debitNote.createdBy?.name}
              </span>
              <div className="mt-5">
                <div className="text-lg font-semibold text-gray-900">
                  Billing To:
                </div>
                <div className="text-lg  text-gray-800 mt-1">
                  {debitNote.userTo?.name}
                </div>
                <div className=" text-gray-600 mt-2">
                  {debitNote.userTo?.address} <br />
                  {debitNote.userTo?.city} <br />
                  {debitNote.userTo?.zipCode} <br />
                </div>
              </div>
            </div>
            <div className="flex-none md:text-end">
              <div className="text-4xl font-semibold text-gray-900">
                debitNote #
              </div>
              <div className="mt-1.5 text-xl  text-gray-600">
                {debitNote.prefix}-{debitNote.no}
              </div>
              <div className="mt-4  text-gray-600">
                {debitNote.createdBy?.name} <br />
                {debitNote.createdBy?.address} <br />
                {debitNote.createdBy?.city} <br />
                {debitNote.createdBy?.zipCode} <br />
              </div>
              <div className="mt-8">
                <div className="mb-2.5">
                  <span className="mr-12  font-semibold text-gray-900">
                    debitNote Date:
                  </span>
                  <span className="  text-gray-600">
                    {DateFormate(debitNote?.date)}
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
                      key={`debitNote-table-${column.id}`}
                      className="text-start p-3 "
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-1 ">
                {debitNote?.products?.length > 0 &&
                  debitNote?.products.map((item, index) => (
                    <tr
                      key={`debitNote-description-${index}`}
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
                    amount: debitNote.subTotal,
                  },
                  {
                    label: "Extra Discount",
                    amount:
                      debitNote?.extraDiscountType === "percentage"
                        ? `${debitNote?.extraDiscount || 0}%`
                        : `₹${debitNote?.extraDiscount || 0}`,
                  },
                  {
                    label: "TAX(%)",
                    amount: totalTax,
                  },
                  {
                    label: "Shipping",
                    amount: "₹" + debitNote.shippingCharges,
                  },
                  {
                    label: "Packaging",
                    amount: "₹" + debitNote.packagingCharges,
                  },
                ].map((item, index) => (
                  <div
                    key={`debitNote-item-${index}`}
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
                    {debitNote.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="  text-gray-600 mt-6">Note:</div>
          <div className=" text-gray-800">{debitNote.notes || "No notes"}</div>
          <div className="mt-3.5   text-gray-600">Terms & Conditions:</div>
          <div className=" text-gray-800 mt-1">
            {debitNote.terms || "No Terms and Conditions"}
          </div>
          <div className="mt-6 text-lg font-semibold text-gray-900">
            Thank You!
          </div>
          <div className="mt-1  text-gray-800">
            If you have any questions concerning this debitNote, use the
            following contact information:
          </div>
          <div className="text-xs text-gray-800 mt-2">{userDetails.email}</div>
          <div className="text-xs text-gray-800 mt-1">{userDetails.phone}</div>
          <div className="mt-8 text-xs text-gray-800">
            © 2025 {debitNote.createdBy?.name}
          </div>
        </div>
      </div>

      {debitNote.id && (
        <div
          className="fixed inset-0 z-20 "
          onClick={() => setIsDebitNoteOpen(false)}
          style={{ display: isDebitNoteOpen ? "block" : "none" }}
        >
          <div
            className="fixed inset-0 flex pt-10 justify-center z-20 "
            style={{ backgroundColor: "#0009" }}
          >
            <div className="h-4/5 " onClick={(e) => e.stopPropagation()}>
              <div className="bg-white mb-5 overflow-y-auto w-fit h-fit rounded ">
                <div className="flex justify-end border-b-2 py-2">
                  <div
                    className="relative text-2xl text-red-700 group px-2 cursor-debitNoteinter"
                    onClick={() => setIsDebitNoteOpen(false)}
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
}
DebitNote.propTypes = {
  debitNote: PropTypes.object,
  bankDetails: PropTypes.object,
  selectTemplate: PropTypes.string,
};

export default DebitNote;
