import React, { useEffect, useRef, useState } from "react";
import { IoMdClose, IoMdDownload } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbEdit } from "react-icons/tb";
import jsPDF from "jspdf";
import { FaRegEye } from "react-icons/fa";
import { db } from "../../../firebase";
import { useSelector } from "react-redux";
import { doc, deleteDoc, increment, updateDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Template from "../Template/Template";
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

function POSViewHome({ POS, bankDetails }) {
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [totalTax, setTotalTax] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);
  const [selectTemplate, setSelectTemplate] = useState("template1");

  const POSRef = useRef();
  const templatesComponents = {
    template1: (
      <Template1 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),

    template2: (
      <Template2 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),

    template3: (
      <Template3 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),

    template4: (
      <Template4 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
    template5: (
      <Template5 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),

    template6: (
      <Template6 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
    template7: (
      <Template7 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
    template8: (
      <Template8 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
    template9: (
      <Template9 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
    template10: (
      <Template10 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
    template11: (
      <Template11 ref={POSRef} dataSet={POS} bankDetails={bankDetails} />
    ),
  };

  useEffect(() => {
    if (POS.products) {
      const tax = POS?.products.reduce((acc, cur) => {
        return acc + cur?.tax;
      }, 0);
      const discount = POS?.products.reduce((acc, cur) => {
        return acc + cur?.amount;
      }, 0);
      setTotalTax(tax);
      setTotalDiscount(discount);
    }
  }, [POS]);

  const handleDownloadPdf = () => {
    if (!POS.id) {
      return;
    }
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(POSRef.current, {
      callback: function (doc) {
        doc.save(`${POS.customerDetails?.name}'s POS.pdf`);
      },
      x: 0,
      y: 0,
    });
  };
  const handleDelete = async () => {
    try {
      if (!POS.id || !companyId) {
        alert("POS ID or Company ID is missing.");
        return;
      }

      // Ref to the POS document
      const POSDocRef = doc(db, "companies", companyId, "pos", POS.id);

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this POS?"
      );
      if (!confirmDelete) return;
      await deleteDoc(POSDocRef);

      // if (POS.items && POS.items.length > 0) {
      //   const updateInventoryPromises = POS.items.map((inventoryItem) => {
      //     if (
      //       !inventoryItem.productRef ||
      //       typeof inventoryItem.quantity !== "number"
      //     ) {
      //       console.error("Invalid inventory item:", inventoryItem);
      //       return Promise.resolve();
      //     }

      //     const inventoryDocRef = doc(
      //       db,
      //       "companies",
      //       companyId,
      //       "products",
      //       inventoryItem.productRef.id
      //     );

      //     return updateDoc(inventoryDocRef, {
      //       "stock.quantity": increment(inventoryItem.quantity),
      //     });
      //   });
      //   await Promise.all(updateInventoryPromises);
      // }
      navigate("/pos");
    } catch (error) {
      console.error("Error deleting POS:", error);
      alert("Failed to delete the POS. Check the console for details.");
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
            onClick={() => setIsPOSOpen(true)}
          >
            <FaRegEye /> &nbsp; View
          </button>
          <button
            className={
              "px-4 py-1 bg-red-300 text-white rounded-full flex items-center"
            }
            onClick={() => navigate("edit-pos")}
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
          {POS.paymentStatus !== "Paid" && (
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
      {/* <div className="space-y-2 ">
        <div className="bg-white rounded-t-lg p-3 py-2">
          <div>
            <div>
              <div></div>
              <div>
                <div>Bill To</div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div>Date: {DateFormate(POS?.date)}</div>
          </div>
        </div>
        <div className="bg-white rounded-b-lg px-3 pb-3">
          {POS?.products?.length > 0 &&
            POS.products.map((ele, index) => (
              <div key={index} className="flex justify-between border-b-2 py-3">
                <div>
                  <div className="text-lg font-bold">{ele.name}</div>
                  <div>-</div>
                  <div>Qty: {ele.quantity}</div>
                </div>
                <div className="text-end">
                <div>Price: ₹{ele?.sellingPrice}</div>
                  <div>Tax :{ele?.tax}%</div>
                  <div>Discount :₹{ele?.discount}</div>
                </div>
              </div>
            ))}
          <div className="text-end border-b-2 border-dashed py-3">
            <div>subTotal: ₹ {POS.subTotal}</div>
            <div>Discount: {totalDiscount}</div>
            <div>Tax: {totalTax}</div>
          </div>
          <div className="flex space-x-3 justify-end font-bold text-lg">
            <div>Total:</div>
            <div>₹ {POS.total}</div>
          </div>
          <div className="bg-gray-100  rounded-lg">
            <div className="p-2">
              <div>Notes</div>
              <div className="font-bold">{POS.notes || "No Data"}</div>
            </div>
            <hr />
            <div className="p-2">
              <div>Terms And Conditions</div>
              <div className="font-bold">{POS.terms || "No Data"}</div>
            </div>
          </div>
        </div>
      </div> */}
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
                      {POS.createdBy?.name}
                    </span>
                  </Link>
                  <div className="mt-5">
                    <div className="text-lg font-semibold text-gray-900">
                      Billing To:
                    </div>
                    <div className="text-lg  text-gray-800 mt-1">
                      {POS.customerDetails?.name}
                    </div>
                    <div className=" text-gray-600 mt-2">
                      {POS.customerDetails?.address} <br />
                      {POS.customerDetails?.city} <br />
                      {POS.customerDetails?.zipCode} <br />
                    </div>
                  </div>
                </div>
                <div className="flex-none md:text-end">
                  <div className="text-4xl font-semibold text-gray-900">
                    POS #
                  </div>
                  <div className="mt-1.5 text-xl  text-gray-600">
                    {POS.POSNo}
                  </div>
                  <div className="mt-4  text-gray-600">
                    {POS.createdBy?.name} <br />
                    {POS.createdBy?.address} <br />
                    {POS.createdBy?.city} <br />
                    {POS.createdBy?.zipCode} <br />
                  </div>
                  <div className="mt-8">
                    <div className="mb-2.5">
                      <span className="mr-12  font-semibold text-gray-900">
                        POS Date:
                      </span>
                      <span className="  text-gray-600">
                        {DateFormate(POS?.posDate)}
                      </span>
                    </div>
                    {/* <div>
                      <span className="mr-12  font-semibold text-gray-900">
                        Due Date:
                      </span>
                      <span className="  text-gray-600">
                        {DateFormate(POS?.dueDate)}
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
                          key={`POS-table-${column.id}`}
                          className="text-start p-3 "
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-1 ">
                    {POS?.products?.length > 0 &&
                      POS?.products.map((item, index) => (
                        <tr
                          key={`POS-description-${index}`}
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
                        amount: POS.subTotal,
                      },
                      {
                        label: "Extra Discount",
                        amount:
                          POS?.extraDiscountType === "percentage"
                            ? `${POS?.extraDiscount || 0}%`
                            : `₹${POS?.extraDiscount || 0}`,
                      },
                      {
                        label: "TAX(%)",
                        amount: totalTax,
                      },
                      {
                        label: "Shipping",
                        amount: "₹" + POS.shippingCharges,
                      },
                      {
                        label: "Packaging",
                        amount: "₹" + POS.packagingCharges,
                      },
                    ].map((item, index) => (
                      <div
                        key={`POS-item-${index}`}
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
                        {POS.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="  text-gray-600 mt-6">Note:</div>
              <div className=" text-gray-800">{POS.notes || "No notes"}</div>
              <div className="mt-3.5   text-gray-600">Terms & Conditions:</div>
              <div className=" text-gray-800 mt-1">
                {POS.terms || "No Terms and Conditions"}
              </div>
              <div className="mt-6 text-lg font-semibold text-gray-900">
                Thank You!
              </div>
              <div className="mt-1  text-gray-800">
                If you have any questions concerning this POS, use the following
                contact information:
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
      {POS.id && (
        <div
          className="fixed inset-0 z-20 "
          onClick={() => setIsPOSOpen(false)}
          style={{ display: isPOSOpen ? "block" : "none" }}
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
                    onClick={() => setIsPOSOpen(false)}
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

export default POSViewHome;
