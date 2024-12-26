import React, { useEffect, useRef, useState } from "react";
import { IoMdClose, IoMdDownload } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbEdit } from "react-icons/tb";
import jsPDF from "jspdf";
import { FaRegEye } from "react-icons/fa";
import { db } from "../../../firebase";
import { useSelector } from "react-redux";
import { doc, deleteDoc, increment, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Template1 from "../../Templates/Template1";
import Template2 from "../../Templates/Template2";
import Template3 from "../../Templates/Template3";
import Template4 from "../../Templates/Template4";
import Template5 from "../../Templates/Template5";
import Template6 from "../../Templates/Template6";
import Template7 from "../../Templates/Template7";
import Template8 from "../../Templates/Template8";
import Template9 from "../../Templates/Template9";
import Template10 from "../../Templates/Template10";
import Template11 from "../../Templates/Template11";
import SelectTemplateSideBar from "../../Templates/SelectTemplateSideBar";

function QuotationView({ quotation, bankDetails }) {
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [totalTax, setTotalTax] = useState(0);
  const [selectTemplate, setSelectTemplate] = useState("template1");
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);
  const quotationRef = useRef();

  const templatesComponents = {
    template1: (
      <Template1
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),

    template2: (
      <Template2
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),

    template3: (
      <Template3
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),

    template4: (
      <Template4
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
    template5: (
      <Template5
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),

    template6: (
      <Template6
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
    template7: (
      <Template7
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
    template8: (
      <Template8
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
    template9: (
      <Template9
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
    template10: (
      <Template10
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
    template11: (
      <Template11
        ref={quotationRef}
        dataSet={quotation}
        bankDetails={bankDetails}
      />
    ),
  };
  useEffect(() => {
    if (quotation.products) {
      const tax = quotation?.products.reduce((acc, cur) => {
        return acc + cur?.tax;
      }, 0);
      setTotalTax(tax);
    }
  }, [quotation]);

  const handleDownloadPdf = () => {
    if (!quotation.id) {
      return;
    }
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(quotationRef.current, {
      callback: function (doc) {
        doc.save(`${quotation.customerDetails.name}'s quotation.pdf`);
      },
      x: 0,
      y: 0,
    });
  };

  const handleDelete = async () => {
    try {
      if (!quotation.id || !companyId) {
        alert("quotation ID or Company ID is missing.");
        return;
      }

      const quotationDocRef = doc(
        db,
        "companies",
        companyId,
        "quotations",
        quotation.id
      );

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this quotation?"
      );
      if (!confirmDelete) return;
      await deleteDoc(quotationDocRef);
      navigate("/quotation");
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Failed to delete the quotation. Check the console for details.");
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
  return (
    <div className="">
      <div className="p-3 flex justify-between bg-white rounded-lg my-3">
        <div className="space-x-4 flex">
          <button
            className={
              "px-4 py-1 bg-blue-300 text-white rounded-full flex items-center"
            }
            onClick={() => setIsQuotationOpen(true)}
          >
            <FaRegEye /> &nbsp; View
          </button>
          <button
            className={
              "px-4 py-1 bg-red-300 text-white rounded-full flex items-center"
            }
            onClick={() => navigate("edit-quotation")}
          >
            <TbEdit /> &nbsp; Edit
          </button>
          <button
            className={
              "px-4 py-1 bg-green-500 text-white rounded-full flex items-center"
            }
            onClick={handleDownloadPdf}
          >
            <IoMdDownload /> &nbsp; download
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-end">
            <button
              className={"px-4 py-1 text-blue-700"}
              onClick={() => setIsSelectTemplateOpen(true)}
            >
              Change Template
            </button>
          </div>
          {quotation.paymentStatus !== "Paid" && (
            <div className="text-end">
              <button
                className={"px-4 py-1 text-red-700 text-2xl"}
                onClick={handleDelete}
              >
                <RiDeleteBin6Line />
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="grid grid-cols-12 gap-6 mt-6 overflow-y-auto"
        style={{ height: "64vh" }}
      >
        <div className="col-span-12 ">
          <div className="p-5 bg-white rounded-lg my-3">
            <div className="">
              <div className="flex gap-6 flex-col md:flex-row pt-8">
                <div className="flex-1">
                  <Link href="#">
                    <span className="text-3xl font-bold text-primary-600">
                      {quotation.createdBy?.name}
                    </span>
                  </Link>
                  <div className="mt-5">
                    <div className="text-lg font-semibold text-gray-900">
                      Billing To:
                    </div>
                    <div className="text-lg  text-gray-800 mt-1">
                      {quotation.customerDetails?.name}
                    </div>
                    <div className=" text-gray-600 mt-2">
                      {quotation.customerDetails?.address} <br />
                      {quotation.customerDetails?.city} <br />
                      {quotation.customerDetails?.zipCode} <br />
                    </div>
                  </div>
                </div>
                <div className="flex-none md:text-end">
                  <div className="text-4xl font-semibold text-gray-900">
                    Quotation #
                  </div>
                  <div className="mt-1.5 text-xl  text-gray-600">
                    {quotation.quotationNo}
                  </div>
                  <div className="mt-4  text-gray-600">
                    {quotation.createdBy?.name} <br />
                    {quotation.createdBy?.address} <br />
                    {quotation.createdBy?.city} <br />
                    {quotation.createdBy?.zipCode} <br />
                  </div>
                  <div className="mt-8">
                    <div className="mb-2.5">
                      <span className="mr-12  font-semibold text-gray-900">
                        Quotation Date:
                      </span>
                      <span className="  text-gray-600">
                        {DateFormate(quotation?.date)}
                      </span>
                    </div>
                    {/* <div>
                      <span className="mr-12  font-semibold text-gray-900">
                        Due Date:
                      </span>
                      <span className="  text-gray-600">
                        {DateFormate(quotation?.dueDate)}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="mt-6 border-2  rounded-lg">
                <table className="w-full ">
                  <thead>
                    <tr className="border-b-2 [&_th:last-child]:text-end">
                      {columns.map((column) => (
                        <th
                          key={`quotation-table-${column.id}`}
                          className="text-start p-3 "
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-1 ">
                    {quotation?.products?.length > 0 &&
                      quotation?.products.map((item) => (
                        <tr
                          key={`quotation-description-${item.id}`}
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
                        amount: quotation.subTotal,
                      },
                      {
                        label: "Extra Discount",
                        amount:
                          quotation?.extraDiscountType === "percentage"
                            ? `${quotation?.extraDiscount || 0}%`
                            : `₹${quotation?.extraDiscount || 0}`,
                      },
                      {
                        label: "TAX(%)",
                        amount: totalTax,
                      },
                      {
                        label: "Shipping",
                        amount: "₹" + quotation.shippingCharges,
                      },
                      {
                        label: "Packaging",
                        amount: "₹" + quotation.packagingCharges,
                      },
                    ].map((item, index) => (
                      <div
                        key={`quotation-item-${index}`}
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
                        {quotation.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="  text-gray-600 mt-6">Note:</div>
              <div className=" text-gray-800">
                {quotation.notes || "No notes"}
              </div>
              <div className="mt-3.5   text-gray-600">Terms & Conditions:</div>
              <div className=" text-gray-800 mt-1">
                {quotation.terms || "No Terms and Conditions"}
              </div>
              <div className="mt-6 text-lg font-semibold text-gray-900">
                Thank You!
              </div>
              <div className="mt-1  text-gray-800">
                If you have any questions concerning this quotation, use the
                following contact information:
              </div>
              <div className="text-xs text-gray-800 mt-2">
                {userDetails.email}
              </div>
              <div className="text-xs text-gray-800 mt-1">
                {userDetails.phone}
              </div>
              <div className="mt-8 text-xs text-gray-800">© 2024 Sunya</div>
            </div>
          </div>
        </div>
      </div>

      {quotation.id && (
        <div
          className="fixed inset-0 z-20 "
          onClick={() => setIsQuotationOpen(false)}
          style={{ display: isQuotationOpen ? "block" : "none" }}
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
                    onClick={() => setIsQuotationOpen(false)}
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

export default QuotationView;
