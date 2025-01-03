import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";
import { IoMdArrowRoundBack, IoMdClose } from "react-icons/io";
import { IoDocumentTextOutline, IoDownloadOutline } from "react-icons/io5";
import { LiaTrashAltSolid } from "react-icons/lia";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function ServiceView() {
  const { id } = useParams();
  const [service, setService] = useState({});
  const navigate = useNavigate();
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
      ?.invoice;
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);
  const [totalTax, setTotalTax] = useState(0);
  const ServiceRef = useRef();
  const [selectTemplate, setSelectTemplate] = useState("template1");

  const fetchServices = async () => {
    try {
      let totalTaxableAmount = 0;
      let totalSgstAmount_2_5 = 0;
      let totalCgstAmount_2_5 = 0;
      let totalSgstAmount_6 = 0;
      let totalCgstAmount_6 = 0;
      let totalSgstAmount_9 = 0;
      let totalCgstAmount_9 = 0;
      let tax = 0;
      const serviceRef = doc(db, "companies", companyId, "services", id);
      const { customerDetails, serviceNo, ...resData } = (
        await getDoc(serviceRef)
      ).data();

      const servicesData = {
        id,
        ...resData,
        type: "Service",
        no: serviceNo,
        userTo: customerDetails,
        items: resData.servicesList.map((item) => {
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

          totalTaxableAmount += netAmount;
          totalSgstAmount_2_5 += sgst === 2.5 ? sgstAmount : 0;
          totalCgstAmount_2_5 += cgst === 2.5 ? cgstAmount : 0;
          totalSgstAmount_6 += sgst === 6 ? sgstAmount : 0;
          totalCgstAmount_6 += cgst === 6 ? cgstAmount : 0;
          totalSgstAmount_9 += sgst === 9 ? sgstAmount : 0;
          totalCgstAmount_9 += cgst === 9 ? cgstAmount : 0;
          return {
            ...item,
            sgst,
            cgst,
            taxAmount,
            sgstAmount,
            cgstAmount,
            totalAmount: netAmount,
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
      setService(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const templatesComponents = {
    template1: <Template1 ref={ServiceRef} dataSet={service} />,

    template2: <Template2 ref={ServiceRef} dataSet={service} />,

    template3: <Template3 ref={ServiceRef} dataSet={service} />,

    template4: <Template4 ref={ServiceRef} dataSet={service} />,
    template5: <Template5 ref={ServiceRef} dataSet={service} />,

    template6: <Template6 ref={ServiceRef} dataSet={service} />,
    template7: <Template7 ref={ServiceRef} dataSet={service} />,
    template8: <Template8 ref={ServiceRef} dataSet={service} />,
    template9: <Template9 ref={ServiceRef} dataSet={service} />,
    template10: <Template10 ref={ServiceRef} dataSet={service} />,
    template11: <Template11 ref={ServiceRef} dataSet={service} />,
  };

  useEffect(() => {
    if (service.items) {
      const tax = service?.items.reduce((acc, cur) => {
        return acc + cur?.tax;
      }, 0);
      setTotalTax(tax);
    }
  }, [service]);

  const handleDownloadPdf = () => {
    if (id) {
      return;
    }
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(ServiceRef.current, {
      callback: function (doc) {
        doc.save(`${service.userTo.name}'s service.pdf`);
      },
      x: 0,
      y: 0,
    });
  };

  const handleWhatsAppShare = async () => {
    if (id) {
      console.error("Service ID is missing!");
      return;
    }

    try {
      // Generate the PDF in-memory
      const doc = new jsPDF("p", "pt", "a4");
      doc.html(ServiceRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");

          // Create a reference to the file in Firebase Storage
          const fileName = `services/${id}.pdf`;
          const fileRef = ref(storage, fileName);

          // Upload the file
          await uploadBytes(fileRef, pdfBlob);

          // Generate a public download URL
          const downloadURL = await getDownloadURL(fileRef);

          // Share the public link via WhatsApp
          const message = `Here is your Service for ${service.userTo.name}: ${downloadURL}`;
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

  const handleEmailShare = async () => {
    if (!id) {
      console.error("Service ID is missing!");
      return;
    }

    try {
      // Generate the PDF in-memory
      const doc = new jsPDF("p", "pt", "a4");
      doc.html(ServiceRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");

          // Create a reference to the file in Firebase Storage
          const fileName = `services/${id}.pdf`;
          const fileRef = ref(storage, fileName);

          // Upload the file to Firebase Storage
          await uploadBytes(fileRef, pdfBlob);

          // Generate a public download URL
          const downloadURL = await getDownloadURL(fileRef);

          // Construct the email subject and body
          const subject = `Service for ${service.userTo.name}`;
          const body = `Hi ${service.userTo.name},%0D%0A%0D%0AHere is your Service for the recent purchase.%0D%0A%0D%0AYou can download it here: ${downloadURL}`;

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
      if (!id) {
        return;
      }

      const ServiceDocRef = doc(db, "companies", companyId, "services", id);

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this service?"
      );
      if (!confirmDelete) return;
      await deleteDoc(ServiceDocRef);
      // navigate("/services");
      navigate("./../");
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete the service. Check the console for details.");
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
      id: 4,
      label: "DISCOUNT",
    },
    {
      id: 5,
      label: "TAX",
    },
    {
      id: 6,
      label: "isTax Included",
    },
    {
      id: 7,
      label: "PRICE",
    },
  ];

  return (
    <div>
      <div className="pb-5 bg-gray-100" style={{ width: "100%" }}>
        <header className="flex items-center bg-white  p-3 space-x-3">
          <Link className="flex items-center" to={"./../"}>
            <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
          </Link>
          <h1 className="text-xl font-bold pe-4 w-full">
            {service.prefix}-{service.no}
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
      </div>
      <div className="bg-white mt-3 rounded-lg shadow-md overflow-hidden mx-5">
        <div className=" flex justify-between bg-white mt-3 border-b rounded-t-lg px-5 py-4">
          <div className="space-x-4 flex ">
            <button
              className={
                "px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
              }
              onClick={() => setIsServiceOpen(true)}
            >
              <IoDocumentTextOutline /> &nbsp; View
            </button>
            {(userDetails.selectedDashboard === "" || role?.edit) && (
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
                }
                onClick={() => navigate("edit-Service")}
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
            <button
              className="px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
              onClick={handleWhatsAppShare}
            >
              <FaWhatsapp /> &nbsp; Share on WhatsApp
            </button>
            <button
              className="px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white"
              onClick={handleEmailShare}
            >
              <MdOutlineMarkEmailRead /> &nbsp; Share via Email
            </button>
          </div>
          <div className="flex items-center">
            {service.status !== "Active" && (
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
                  {service.createdBy?.name}
                </span>
                <div className="mt-5">
                  <div className="text-lg font-semibold text-gray-900">
                    Billing To:
                  </div>
                  <div className="text-lg  text-gray-800 mt-1">
                    {service.userTo?.name}
                  </div>
                  <div className=" text-gray-600 mt-2">
                    {service.userTo?.address} <br />
                    {service.userTo?.city} <br />
                    {service.userTo?.zipCode} <br />
                  </div>
                </div>
              </div>
              <div className="flex-none md:text-end">
                <div className="text-4xl font-semibold text-gray-900">
                  Service #
                </div>
                <div className="mt-1.5 text-xl  text-gray-600">
                  {service.prefix}-{service.no}
                </div>
                <div className="mt-4  text-gray-600">
                  {service.createdBy?.name} <br />
                  {service.createdBy?.address} <br />
                  {service.createdBy?.city} <br />
                  {service.createdBy?.zipCode} <br />
                </div>
                <div className="mt-8">
                  <div className="mb-2.5">
                    <span className="mr-12  font-semibold text-gray-900">
                      Service Date:
                    </span>
                    <span className="  text-gray-600">
                      {DateFormate(service?.date)}
                    </span>
                  </div>
                  <div>
                    <span className="mr-12  font-semibold text-gray-900">
                      Due Date:
                    </span>
                    <span className="  text-gray-600">
                      {DateFormate(service?.dueDate)}
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
                        key={`Service-table-${column.id}`}
                        className="text-start p-3 "
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-1 ">
                  {service?.items?.length > 0 &&
                    service?.items.map((item) => (
                      <tr
                        key={`Service-description-${item.serviceRef.id}`}
                        className="border-b-2 p-3 [&_td:last-child]:text-end"
                      >
                        <td className="  text-gray-600 max-w-[200px] truncate p-3">
                          {item.name}
                        </td>
                        <td className="  text-gray-600 whitespace-nowrap p-3">
                          {!item.discountType && "₹"}
                          {item.discount}
                          {item.discountType && "%"}
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
                      amount: service.subTotal,
                    },
                    {
                      label: "Extra Discount",
                      amount: service?.extraDiscountType
                        ? `${service?.extraDiscount || 0}%`
                        : `₹${service?.extraDiscount || 0}`,
                    },
                    {
                      label: "TAX(%)",
                      amount: totalTax,
                    },
                  ].map((item, index) => (
                    <div
                      key={`Service-item-${index}`}
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
                      {service.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="  text-gray-600 mt-6">Note:</div>
            <div className=" text-gray-800">{service.notes || "No notes"}</div>
            <div className="mt-3.5   text-gray-600">Terms & Conditions:</div>
            <div className=" text-gray-800 mt-1">
              {service.terms || "No Terms and Conditions"}
            </div>
            <div className="mt-6 text-lg font-semibold text-gray-900">
              Thank You!
            </div>
            <div className="mt-1  text-gray-800">
              If you have any questions concerning this Service, use the
              following contact information:
            </div>
            <div className="text-xs text-gray-800 mt-2">
              {userDetails.email}
            </div>
            <div className="text-xs text-gray-800 mt-1">
              {userDetails.phone}
            </div>
            <div className="mt-8 text-xs text-gray-800">
              © 2025 {service?.createdBy?.name}
            </div>
          </div>
        </div>
      </div>

      {id && (
        <div
          className="fixed inset-0 z-20 "
          onClick={() => setIsServiceOpen(false)}
          style={{ display: isServiceOpen ? "block" : "none" }}
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
                    onClick={() => setIsServiceOpen(false)}
                  >
                    <IoMdClose />
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-8 px-1 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 z-200">
                      Close
                    </div>
                  </div>
                </div>
                {Object.keys(service).length !== 0 &&
                  templatesComponents[selectTemplate]}
                {/* <Template7
                  ref={ServiceRef}
                  ServiceData={Service}
                  bankDetails={bankDetails}
                /> */}
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

export default ServiceView;
