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

const POS = ({ companyDetails, isStaff }) => {
  const [pos, setPos] = useState([]);
  const [isPosOpen, setIsPosOpen] = useState(false);
  const posRef = useRef();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosData, setSelectedPosData] = useState(null);
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
    const fetchPos = async () => {
      setLoading(true);
      try {
        const posRef = collection(db, "companies", companyId, "pos");
        const querySnapshot = await getDocs(posRef);
        const posData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // const q = query(posRef, orderBy("date", "desc"));
        // const querySnapshot = await getDocs(q);
        // const posData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        setSelectedPosData(posData[0]);
        setPos(posData);
      } catch (error) {
        console.error("Error fetching pos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPos();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleposClick = async (posData) => {
    try {
      setSelectedPosData(posData);
      setIsPosOpen(true);
    } catch (error) {
      console.error("Error fetching pos:", error);
    }
  };

  const handleStatusChange = async (posId, newStatus) => {
    try {
      const posDoc = doc(db, "companies", companyId, "pos", posId);
      await updateDoc(posDoc, { paymentStatus: newStatus });
      setPos((prevpos) =>
        prevpos.map((pos) =>
          pos.id === posId ? { ...pos, paymentStatus: newStatus } : pos
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredPos = pos.filter((dc) => {
    const { customerDetails, posNo, paymentStatus } = dc;
    const customerName = customerDetails?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      posNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerDetails?.phone
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredPos.reduce((sum, pos) => sum + pos.total, 0);

  const paidAmount = filteredPos
    .filter((pos) => pos.paymentStatus === "Paid")
    .reduce((sum, pos) => sum + pos.total, 0);
  const pendingAmount = filteredPos
    .filter((pos) => pos.paymentStatus === "Pending")
    .reduce((sum, pos) => sum + pos.total, 0);

  const handleDownloadPdf = (pos) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(posRef.current, {
      callback: function (doc) {
        doc.save(`${pos.customerDetails.name}'s pos.pdf`);
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
          <h1 className="text-2xl font-bold py-3 px-10 ">POS Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-indigo-600 font-bold">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg">Paid Amount</div>
              <div className="text-3xl text-emerald-600 font-bold">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg">Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg">UnPaid Amount</div>
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
                  placeholder="Search by customer name, phone number, pos number#..."
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
                to="create-pos"
              >
                + Create POS
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading pos...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        POS No
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
                    {filteredPos.length > 0 ? (
                      filteredPos.map((pos) => (
                        <tr
                          key={pos.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(pos.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">{pos.posNo}</td>

                          <td className="px-5 py-3 text-start">
                            {pos.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {pos.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              pos.date.seconds * 1000 +
                                pos.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold  text-center">{`₹ ${pos.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                pos.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : pos.paymentStatus === "Pending"
                                  ? "bg-yellow-100 "
                                  : "bg-red-100 "
                              }`}
                            >
                              <select
                                value={pos.paymentStatus}
                                onChange={(e) => {
                                  handleStatusChange(pos.id, e.target.value);
                                }}
                                className={` ${
                                  pos.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : pos.paymentStatus === "Pending"
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
                          <td className="px-5 py-3">{pos.mode || "Online"}</td>

                          <td className="px-5 py-3">
                            {pos?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No pos found
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

export default POS;
