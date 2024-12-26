import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import jsPDF from "jspdf";
import { useSelector } from "react-redux";
import { FaRegEye } from "react-icons/fa";
import { IoMdClose, IoMdDownload } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

const DeliveryChallanList = ({ companyDetails, isStaff }) => {
  const [deliveryChallan, setDeliveryChallan] = useState([]);
  const [isDeliveryChallanOpen, setIsDeliveryChallanOpen] = useState(false);
  const deliveryChallanRef = useRef();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeliveryChallanData, setSelectedDeliveryChallanData] =
    useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const userDetails = useSelector((state) => state.users);

  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryChallan = async () => {
      setLoading(true);
      try {
        const deliveryChallanRef = collection(
          db,
          "companies",
          companyId,
          "deliverychallan"
        );
        const querySnapshot = await getDocs(deliveryChallanRef);
        const deliveryChallanData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // const q = query(deliveryChallanRef, orderBy("date", "desc"));
        // const querySnapshot = await getDocs(q);
        // const deliveryChallanData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        setSelectedDeliveryChallanData(deliveryChallanData[0]);
        setDeliveryChallan(deliveryChallanData);
      } catch (error) {
        console.error("Error fetching deliveryChallan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryChallan();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeliveryChallanClick = async (deliveryChallanData) => {
    try {
      setSelectedDeliveryChallanData(deliveryChallanData);
      setIsDeliveryChallanOpen(true);
    } catch (error) {
      console.error("Error fetching deliveryChallan:", error);
    }
  };

  const handleStatusChange = async (deliveryChallanId, newStatus) => {
    try {
      const deliveryChallanDoc = doc(
        db,
        "companies",
        companyId,
        "deliverychallan",
        deliveryChallanId
      );
      await updateDoc(deliveryChallanDoc, { paymentStatus: newStatus });
      setDeliveryChallan((prevDeliveryChallan) =>
        prevDeliveryChallan.map((deliveryChallan) =>
          deliveryChallan.id === deliveryChallanId
            ? { ...deliveryChallan, paymentStatus: newStatus }
            : deliveryChallan
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredDeliveryChallan = deliveryChallan.filter((dc) => {
    const { customerDetails, deliveryChallanNo, paymentStatus } = dc;
    const customerName = customerDetails?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliveryChallanNo
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customerDetails?.phone
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredDeliveryChallan.reduce(
    (sum, deliveryChallan) => sum + deliveryChallan.total,
    0
  );

  const paidAmount = filteredDeliveryChallan
    .filter((deliveryChallan) => deliveryChallan.paymentStatus === "Paid")
    .reduce((sum, deliveryChallan) => sum + deliveryChallan.total, 0);
  const pendingAmount = filteredDeliveryChallan
    .filter((deliveryChallan) => deliveryChallan.paymentStatus === "Pending")
    .reduce((sum, deliveryChallan) => sum + deliveryChallan.total, 0);

  const handleDownloadPdf = (deliveryChallan) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(deliveryChallanRef.current, {
      callback: function (doc) {
        doc.save(
          `${deliveryChallan.customerDetails.name}'s deliveryChallan.pdf`
        );
      },
      x: 0,
      y: 0,
    });
  };

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 h-48">
          <h1 className="text-2xl font-bold py-3 px-10 ">
            Delivery Challan Overview
          </h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg"> Paid Amount </div>
              <div className="text-3xl text-emerald-600 font-bold">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg"> Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg"> UnPaid Amount</div>
              <div className="text-3xl text-red-600 font-bold">
                ₹ {totalAmount - paidAmount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  py-8 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by deliveryChallan ..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="UnPaid">UnPaid</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              <Link
                className="bg-blue-500 text-white py-2 px-2 rounded-lg"
                to="create-deliveryChallan"
              >
                + Create Delivery Challan
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading Delivery Challan...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        DeliveryChallan No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Customer
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold  text-center">
                        Amount
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-center ">
                        Status
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Mode
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Created By
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveryChallan.length > 0 ? (
                      filteredDeliveryChallan.map((dcItem) => (
                        <tr
                          key={dcItem.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(dcItem.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">
                            {dcItem.deliveryChallanNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {dcItem.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {dcItem.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              dcItem.date.seconds * 1000 +
                                dcItem.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold text-center">{`₹ ${dcItem.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                dcItem.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : dcItem.paymentStatus === "Pending"
                                  ? "bg-yellow-100 "
                                  : "bg-red-100 "
                              }`}
                            >
                              <select
                                value={dcItem.paymentStatus}
                                onChange={(e) => {
                                  handleStatusChange(dcItem.id, e.target.value);
                                }}
                                className={` ${
                                  dcItem.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : dcItem.paymentStatus === "Pending"
                                    ? "bg-yellow-100 "
                                    : "bg-red-100 "
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="UnPaid">UnPaid</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {dcItem.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {dcItem?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No Delivery Challan found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
                <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
                  0 of 10 row(s) selected.
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronsLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronRight className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronsRight className="" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanList;
