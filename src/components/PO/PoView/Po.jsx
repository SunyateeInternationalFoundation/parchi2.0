import { deleteDoc, doc, increment, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoMdClose, IoMdDownload } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SunyaLogo from "../../../assets/SunyaLogo.jpg";
import { db, storage } from "../../../firebase";
import SelectTemplateSideBar from "../../Templates/SelectTemplateSideBar";
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

function Po({ Po, bankDetails }) {
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [isPoOpen, setIsPoOpen] = useState(false);
  const [totalTax, setTotalTax] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const poRef = useRef();
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);
  const [selectTemplate, setSelectTemplate] = useState("template1");

  useEffect(() => {
    if (Po.products) {
      const tax = Po?.products.reduce((acc, cur) => {
        return acc + cur?.tax;
      }, 0);
      const discount = Po?.products.reduce((acc, cur) => {
        return acc + cur?.discount;
      }, 0);
      setTotalTax(tax);
      setTotalDiscount(discount);
    }
  }, [Po]);

  const handleDownloadPdf = () => {
    if (!Po.id) {
      return;
    }
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(poRef.current, {
      callback: function (doc) {
        doc.save(`${Po.vendorDetailsname}'s Po.pdf`);
      },
      x: 0,
      y: 0,
    });
  };

  const handleWhatsAppShare = async () => {
    if (!Po.id) {
      console.error("Po ID is missing!");
      return;
    }

    try {
      // Generate the PDF in-memory
      const doc = new jsPDF("p", "pt", "a4");
      doc.html(poRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");

          // Create a reference to the file in Firebase Storage
          const fileName = `Pos/${Po.id}.pdf`;
          const fileRef = ref(storage, fileName);

          // Upload the file
          await uploadBytes(fileRef, pdfBlob);

          // Generate a public download URL
          const downloadURL = await getDownloadURL(fileRef);

          // Share the public link via WhatsApp
          const message = `Here is your Po for ${Po.vendorDetailsname}: ${downloadURL}`;
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
    template1: <Template1 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,

    template2: <Template2 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,

    template3: <Template3 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,

    template4: <Template4 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,
    template5: <Template5 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,

    template6: <Template6 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,
    template7: <Template7 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,
    template8: <Template8 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,
    template9: <Template9 ref={poRef} dataSet={Po} bankDetails={bankDetails} />,
    template10: (
      <Template10 ref={poRef} dataSet={Po} bankDetails={bankDetails} />
    ),
    template11: (
      <Template11 ref={poRef} dataSet={Po} bankDetails={bankDetails} />
    ),
  };
  const handleEmailShare = async () => {
    if (!Po.id) {
      console.error("Po ID is missing!");
      return;
    }

    try {
      // Generate the PDF in-memory
      const doc = new jsPDF("p", "pt", "a4");
      doc.html(poRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");

          // Create a reference to the file in Firebase Storage
          const fileName = `Pos/${Po.id}.pdf`;
          const fileRef = ref(storage, fileName);

          // Upload the file to Firebase Storage
          await uploadBytes(fileRef, pdfBlob);

          // Generate a public download URL
          const downloadURL = await getDownloadURL(fileRef);

          // Construct the email subject and body
          const subject = `Po for ${Po.vendorDetailsname}`;
          const body = `Hi ${Po.vendorDetailsname},%0D%0A%0D%0AHere is your Po for the recent Po.%0D%0A%0D%0AYou can download it here: ${downloadURL}`;

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
      if (!Po.id || !companyId) {
        alert("Po ID or Company ID is missing.");
        return;
      }

      const PoDocRef = doc(db, "companies", companyId, "po", Po.id);

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Po?"
      );
      if (!confirmDelete) return;
      await deleteDoc(PoDocRef);

      if (Po.products && Po.products.length > 0) {
        const updateInventoryPromises = Po.products.map((inventoryItem) => {
          console.log("inventoryitem", inventoryItem);
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
        });
        await Promise.all(updateInventoryPromises);
      }
      navigate("/po");
    } catch (error) {
      console.error("Error deleting Po:", error);
      alert("Failed to delete the Po. Check the console for details.");
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
            onClick={() => setIsPoOpen(true)}
          >
            <FaRegEye /> &nbsp; View
          </button>
          <button
            className={
              "px-4 py-1 bg-red-300 text-white rounded-full flex items-center"
            }
            onClick={() => navigate("edit-po")}
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
          {Po.paymentStatus !== "Paid" && (
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
            <div>Date: {DateFormate(Po?.date)}</div>
          </div>
        </div>
        <div className="bg-white rounded-b-lg px-3 pb-3">
          {Po?.products?.length > 0 &&
            Po?.products.map((ele, index) => (
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
            <div>subTotal: ₹{Po.subTotal}</div>
            <div>Tax: {totalTax}%</div>
            <div>
              {Po.extraDiscount?.amount > 0 && (
                <>
                  Extra Discount:{" "}
                  {Po?.extraDiscount?.type === "percentage"
                    ? `${Po.extraDiscount.amount}%`
                    : `₹${Po.extraDiscount.amount}`}{" "}
                </>
              )}
            </div>
            <div>
              {" "}
              {Po.packagingCharges > 0 && (
                <>Packaging Charges: ₹{Po.packagingCharges}</>
              )}
            </div>
            <div>
              {" "}
              {Po.shippingCharges > 0 && (
                <>Shipping Charges: ₹{Po.shippingCharges} </>
              )}{" "}
            </div>
          </div>
          <div className="flex space-x-3 justify-end font-bold text-lg">
            <div>Total:</div>
            <div>₹ {Po.total}</div>
          </div>
          <div className="bg-gray-100  rounded-lg">
            <div className="p-2">
              <div>Notes</div>
              <div className="font-bold">{Po.notes || "No Data"}</div>
            </div>
            <hr />
            <div className="p-2">
              <div>Terms And Conditions</div>
              <div className="font-bold">{Po.terms || "No Data"}</div>
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
                    <img src={SunyaLogo} width={100} alt="logo" height={100} />
                    <span className="text-3xl font-bold text-primary-600">
                      Sunya
                    </span>
                  </Link>
                  <div className="mt-5">
                    <div className="text-lg font-semibold text-gray-900">
                      Billing To:
                    </div>
                    <div className="text-lg  text-gray-800 mt-1">
                      {Po.vendorDetails?.name}
                    </div>
                    <div className=" text-gray-600 mt-2">
                      {Po.vendorDetails?.address} <br />
                      {Po.vendorDetails?.city} <br />
                      {Po.vendorDetails?.zipCode} <br />
                    </div>
                  </div>
                </div>
                <div className="flex-none md:text-end">
                  <div className="text-4xl font-semibold text-gray-900">
                    Po #
                  </div>
                  <div className="mt-1.5 text-xl  text-gray-600">{Po.PoNo}</div>
                  <div className="mt-4  text-gray-600">
                    {Po.createdBy?.name} <br />
                    {Po.createdBy?.address} <br />
                    {Po.createdBy?.city} <br />
                    {Po.createdBy?.zipCode} <br />
                  </div>
                  <div className="mt-8">
                    <div className="mb-2.5">
                      <span className="mr-12  font-semibold text-gray-900">
                        Po Date:
                      </span>
                      <span className="  text-gray-600">
                        {DateFormate(Po?.date)}
                      </span>
                    </div>
                    {/* <div>
                      <span className="mr-12  font-semibold text-gray-900">
                        Due Date:
                      </span>
                      <span className="  text-gray-600">
                        {DateFormate(Po?.dueDate)}
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
                          key={`Po-table-${column.id}`}
                          className="text-start p-3 "
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-1 ">
                    {Po?.products?.length > 0 &&
                      Po?.products.map((item, index) => (
                        <tr
                          key={`Po-description-${index}`}
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
                        amount: Po.subTotal,
                      },
                      {
                        label: "Extra Discount",
                        amount:
                          Po?.extraDiscountType === "percentage"
                            ? `${Po?.extraDiscount || 0}%`
                            : `₹${Po?.extraDiscount || 0}`,
                      },
                      {
                        label: "TAX(%)",
                        amount: totalTax,
                      },
                      {
                        label: "Shipping",
                        amount: "₹" + Po.shippingCharges,
                      },
                      {
                        label: "Packaging",
                        amount: "₹" + Po.packagingCharges,
                      },
                    ].map((item, index) => (
                      <div
                        key={`Po-item-${index}`}
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
                        {Po.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="  text-gray-600 mt-6">Note:</div>
              <div className=" text-gray-800">{Po.notes || "No notes"}</div>
              <div className="mt-3.5   text-gray-600">Terms & Conditions:</div>
              <div className=" text-gray-800 mt-1">
                {Po.terms || "No Terms and Conditions"}
              </div>
              <div className="mt-6 text-lg font-semibold text-gray-900">
                Thank You!
              </div>
              <div className="mt-1  text-gray-800">
                If you have any questions concerning this Po, use the following
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
      {Po.id && (
        <div
          className="fixed inset-0 z-20 "
          onClick={() => setIsPoOpen(false)}
          style={{ display: isPoOpen ? "block" : "none" }}
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
                    onClick={() => setIsPoOpen(false)}
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

export default Po;
