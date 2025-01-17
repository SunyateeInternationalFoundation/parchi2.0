import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
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

const CreditNoteList = () => {
  const [creditNote, setCreditNote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const userDetails = useSelector((state) => state.users);

  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchCreditNote = async () => {
      setLoading(true);
      try {
        const creditNoteRef = collection(
          db,
          "companies",
          companyId,
          "creditNote"
        );

        const q = query(creditNoteRef, orderBy("creditNoteNo", "asc"));
        const querySnapshot = await getDocs(q);
        const creditNoteData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotalPages(Math.ceil(creditNoteData.length / 10));
        setPaginationData(creditNoteData.slice(0, 10));
        setCreditNote(creditNoteData);
      } catch (error) {
        console.error("Error fetching creditNote:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreditNote();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (creditNoteId, newStatus) => {
    try {
      const creditNoteDoc = doc(
        db,
        "companies",
        companyId,
        "creditNote",
        creditNoteId
      );
      await updateDoc(creditNoteDoc, { paymentStatus: newStatus });
      setCreditNote((prevCreditNote) =>
        prevCreditNote.map((creditNote) =>
          creditNote.id === creditNoteId
            ? { ...creditNote, paymentStatus: newStatus }
            : creditNote
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = creditNote.reduce(
    (sum, creditnote) => sum + creditnote.total,
    0
  );

  const paidAmount = creditNote
    .filter((creditnote) => creditnote.paymentStatus === "Paid")
    .reduce((sum, creditnote) => sum + creditnote.total, 0);
  const pendingAmount = creditNote
    .filter((creditnote) => creditnote.paymentStatus === "Pending")
    .reduce((sum, creditnote) => sum + creditnote.total, 0);

  useEffect(() => {
    const filteredCreditNote = creditNote.filter((creditNote) => {
      const { customerDetails, creditNoteNo, paymentStatus } = creditNote;
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
    setPaginationData(
      filteredCreditNote.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, creditNote, searchTerm, filterStatus]);

  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <div className="mt-4 py-3">
        <h1 className="text-2xl font-bold pb-3 ">Credit Note Overview</h1>
        <div className="grid grid-cols-4 gap-8 ">
          <div className="rounded-lg p-5 bg-white shadow  ">
            <div className="text-lg">Total Amount</div>
            <div className="text-3xl text-indigo-600 font-bold  p-2">
              ₹ {totalAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Paid Amount</div>
            <div className="text-3xl text-emerald-600 font-bold  p-2">
              {" "}
              ₹ {paidAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Pending Amount</div>
            <div className="text-3xl text-orange-600 font-bold  p-2">
              ₹ {pendingAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> UnPaid Amount</div>
            <div className="text-3xl text-red-600 font-bold  p-2">
              ₹ {totalAmount - paidAmount}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="flex items-center mb-4 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
            >
              <input
                type="text"
                placeholder="Search by Credit Note #..."
                className=" w-full focus:outline-none"
                value={searchTerm}
                onChange={handleSearch}
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
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="UnPaid">UnPaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <Link
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                to="create-creditnote"
              >
                + Create Credit Note
              </Link>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6" style={{ height: "92vh" }}>
            Loading Credit Notes...
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
                    Credit Note No
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Customer
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold  text-center ">
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
                  paginationData.map((creditNote) => (
                    <tr
                      key={creditNote.id}
                      className="border-b text-center cursor-pointer text-start"
                      onClick={(e) => {
                        navigate(creditNote.id);
                      }}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={creditNote.date} />
                      </td>
                      <td className="px-5 py-3 font-bold text-center">
                        {creditNote.prefix || ""}-{creditNote.creditNoteNo}
                      </td>

                      <td className="px-5 py-3 text-start">
                        {creditNote.customerDetails?.name} <br />
                        <span className="text-gray-500 text-sm">
                          Ph.No {creditNote.customerDetails.phone}
                        </span>
                      </td>

                      <td className="px-5 py-3 font-bold text-center">{`₹ ${creditNote.total.toFixed(
                        2
                      )}`}</td>
                      <td
                        className="px-5 py-3 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className={` text-center flex justify-center items-center h-8 overflow-hidden border rounded-lg text-xs  ${
                            creditNote.paymentStatus === "Paid"
                              ? "bg-green-100 "
                              : creditNote.paymentStatus === "Pending"
                              ? "bg-yellow-100 "
                              : "bg-red-100"
                          }`}
                        >
                          <Select
                            value={creditNote.paymentStatus}
                            onValueChange={(value) =>
                              handleStatusChange(creditNote.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={"Select Status"} />
                            </SelectTrigger>
                            <SelectContent className="w-10 h-26">
                              <SelectItem value="Pending" className="h-8">
                                Pending
                              </SelectItem>
                              <SelectItem value="Paid" className="h-8">
                                Paid
                              </SelectItem>
                              <SelectItem value="UnPaid" className="h-8">
                                UnPaid
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {creditNote.mode || "Online"}
                      </td>

                      <td className="px-5 py-3">
                        {creditNote?.createdBy?.who}
                      </td>
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
                      <div className="mb-6">No Credit Notes Created</div>
                      <div className="">
                        {(userDetails.selectedDashboard === "" ||
                          role?.create) && (
                          <Link
                            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                            to="create-creditnote"
                          >
                            + Create Credit Notes
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
};

export default CreditNoteList;
