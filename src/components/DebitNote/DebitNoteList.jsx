import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

function DebitNoteList() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(!true);
  const userDetails = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

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

  const navigate = useNavigate();
  const [DebitNoteList, setDebitNoteList] = useState([]);

  const [DebitNoteCount, setDebitNoteCount] = useState({
    total: 0,
    received: 0,
    totalPrice: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchPoList() {
      setLoading(true);
      try {
        const getData = await getDocs(
          collection(db, "companies", companyId, "debitNote")
        );
        let receivedCount = 0;
        let totalPrice = 0;
        const data = getData.docs.map((doc) => {
          const res = doc.data();
          if (res.orderStatus === "Received") {
            ++receivedCount;
          }
          totalPrice += res.total;
          return {
            id: doc.id,
            ...res,
          };
        });
        setTotalPages(Math.ceil(data.length / 10));
        setPaginationData(data.slice(0, 10));
        setDebitNoteList(data);
        setDebitNoteCount({
          total: data.length,
          received: receivedCount,
          totalPrice: totalPrice,
        });
      } catch (error) {
        console.log("🚀 ~ fetchPoList ~ error:", error);
      }
      setLoading(false);
    }
    fetchPoList();
  }, []);

  async function onStatusUpdate(value, debitNoteId) {
    try {
      const docRef = doc(db, "companies", companyId, "debitNote", debitNoteId);
      await updateDoc(docRef, { orderStatus: value });
      const UpdatedData = DebitNoteList.map((ele) => {
        if (ele.id === debitNoteId) {
          ele.orderStatus = value;
        }
        return ele;
      });
      setDebitNoteList(UpdatedData);
      alert("Successfully Status Updated");
    } catch (error) {
      console.log("🚀 ~ onStatusUpdate ~ error:", error);
    }
  }
  useEffect(() => {
    const filteredDebitNote = DebitNoteList.filter((debitNote) => {
      const { vendorDetails, debitNoteNo, orderStatus } = debitNote;
      const vendorName = vendorDetails?.name || "";
      const matchesSearch =
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debitNoteNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        vendorDetails?.phone
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || orderStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredDebitNote.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, DebitNoteList, searchTerm, filterStatus]);

  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <div className="mt-4 py-3">
        <h1 className="text-2xl font-bold pb-3 ">DebitNote Overview</h1>
        <div className="grid grid-cols-4 gap-8">
          <div className="rounded-lg p-5  bg-white shadow  ">
            <div className="text-lg">All Debit Notes</div>
            <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold p-2">
              {DebitNoteCount.total}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Received DebitNote</div>
            <div className="text-3xl text-green-600 font-bold p-2">
              {DebitNoteCount.received}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Pending DebitNote</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              {DebitNoteCount.total - DebitNoteCount.received}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg">Total Paid DebitNote Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {DebitNoteCount.totalPrice}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="flex mb-4 items-center px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
            >
              <input
                type="text"
                placeholder="Search by DebitNote #..."
                className=" w-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearch />
            </div>
            <div className="w-1/2">
              <Select
                value={filterStatus || "All"}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Select Filter"} />
                </SelectTrigger>
                <SelectContent className=" h-26">
                  <SelectItem value="All"> All </SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <Link
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                to="create-debitNote"
              >
                + Create DebitNote
              </Link>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6" style={{ height: "92vh" }}>
            Loading debitNote...
          </div>
        ) : (
          <div style={{ height: "92vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Date
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    DebitNote No
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Vendor
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                    Amount
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center ">
                    Status
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Mode
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Created By
                  </td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((debitNote) => (
                    <tr
                      key={debitNote.id}
                      className="border-b text-center cursor-pointer text-start"
                      onClick={(e) => {
                        navigate(debitNote.id);
                      }}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={debitNote.date} />
                      </td>
                      <td className="px-5 py-3 font-bold text-center">
                        {debitNote.prefix || ""}-{debitNote.debitNoteNo}
                      </td>

                      <td className="px-5 py-3 text-start">
                        {debitNote.vendorDetails?.name} <br />
                        <span className="text-gray-500">
                          Ph.No {debitNote.vendorDetails.phone}
                        </span>
                      </td>
                      <td className="px-5 py-3  text-center">{`₹ ${debitNote.total.toFixed(
                        2
                      )}`}</td>
                      <td
                        className="px-5 py-3 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className={` text-center flex justify-center items-center h-8 overflow-hidden border rounded-lg text-xs  ${
                            debitNote.orderStatus !== "Pending"
                              ? "bg-green-200 "
                              : "bg-red-200 "
                          }`}
                        >
                          <Select
                            value={debitNote.orderStatus}
                            onValueChange={(value) =>
                              onStatusUpdate(debitNote.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={"Select Status"} />
                            </SelectTrigger>
                            <SelectContent className="w-10 h-18">
                              <SelectItem value="Pending" className="h-8">
                                Pending
                              </SelectItem>
                              <SelectItem value="Received" className="h-8">
                                Received
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {debitNote.mode || "Online"}
                      </td>

                      <td className="px-5 py-3">{debitNote?.createdBy?.who}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="h-96 text-center py-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={addItem}
                          alt="add Item"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="mb-6">No Debit Note Created</div>
                      <div className="">
                        {(userDetails.selectedDashboard === "" ||
                          role?.create) && (
                          <Link
                            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                            to="create-debitNote"
                          >
                            + Create Debit Note
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage + 1} of {totalPages || 1} row(s) selected.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage(0)}
                disabled={currentPage <= 0}
              >
                <div className="flex justify-center">
                  <LuChevronsLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage((val) => val - 1)}
                disabled={currentPage <= 0}
              >
                <div className="flex justify-center">
                  <LuChevronLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage((val) => val + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                <div className="flex justify-center">
                  <LuChevronRight className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                <div className="flex justify-center">
                  <LuChevronsRight />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebitNoteList;
