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

const CreditNoteList = () => {
  const [creditNote, setCreditNote] = useState([]);
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);
  const creditNoteRef = useRef();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreditNoteData, setSelectedCreditNoteData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreditNote = async () => {
      setLoading(true);
      try {
        const creditNoteRef = collection(
          db,
          "companies",
          companyId,
          "creditnote"
        );
        const querySnapshot = await getDocs(creditNoteRef);
        const creditNoteData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // const q = query(creditnoteRef, orderBy("date", "desc"));
        // const querySnapshot = await getDocs(q);
        // const creditnoteData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        setSelectedCreditNoteData(creditNoteData[0]);
        setCreditNote(creditNoteData);
      } catch (error) {
        console.error("Error fetching creditnote:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreditNote();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreditNoteClick = async (creditNoteData) => {
    try {
      setSelectedCreditNoteData(creditNoteData);
      setIsCreditNoteOpen(true);
    } catch (error) {
      console.error("Error fetching creditnote:", error);
    }
  };

  const handleStatusChange = async (creditNoteId, newStatus) => {
    try {
      const creditNoteDoc = doc(
        db,
        "companies",
        companyId,
        "creditnote",
        creditNoteId
      );
      await updateDoc(creditNoteDoc, { paymentStatus: newStatus });
      setCreditNote((prevcreditnote) =>
        prevcreditnote.map((creditnote) =>
          creditnote.id === creditNoteId
            ? { ...creditnote, paymentStatus: newStatus }
            : creditnote
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredCreditNote = creditNote.filter((creditnote) => {
    const { customerDetails, creditNoteNo, paymentStatus } = creditnote;
    const customerName = customerDetails?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditNoteNo
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

  const totalAmount = filteredCreditNote.reduce(
    (sum, creditnote) => sum + creditnote.total,
    0
  );

  const paidAmount = filteredCreditNote
    .filter((creditnote) => creditnote.paymentStatus === "Paid")
    .reduce((sum, creditnote) => sum + creditnote.total, 0);
  const pendingAmount = filteredCreditNote
    .filter((creditnote) => creditnote.paymentStatus === "Pending")
    .reduce((sum, creditnote) => sum + creditnote.total, 0);

  const handleDownloadPdf = (creditnote) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(creditNoteRef.current, {
      callback: function (doc) {
        doc.save(`${creditnote.customerDetails.name}'s creditnote.pdf`);
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
            Credit Note Overview
          </h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-indigo-600 font-bold">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg"> Paid Amount</div>
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
                  placeholder="Search by Credit Note #..."
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
                to="create-creditnote"
              >
                + Create Credit Note
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading Credit Notes...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Credit Note No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Customer
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold  text-center ">
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
                    {filteredCreditNote.length > 0 ? (
                      filteredCreditNote.map((creditnote) => (
                        <tr
                          key={creditnote.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(creditnote.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">
                            {creditnote.creditNoteNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {creditnote.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {creditnote.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              creditnote.date.seconds * 1000 +
                                creditnote.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold text-center">{`₹ ${creditnote.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                creditnote.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : creditnote.paymentStatus === "Pending"
                                  ? "bg-yellow-100"
                                  : "bg-red-100 "
                              }`}
                            >
                              <select
                                value={creditnote.paymentStatus}
                                onChange={(e) => {
                                  handleStatusChange(
                                    creditnote.id,
                                    e.target.value
                                  );
                                }}
                                className={`${
                                  creditnote.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : creditnote.paymentStatus === "Pending"
                                    ? "bg-yellow-100"
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
                            {creditnote.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {creditnote?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No Credit Notes found
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

export default CreditNoteList;
