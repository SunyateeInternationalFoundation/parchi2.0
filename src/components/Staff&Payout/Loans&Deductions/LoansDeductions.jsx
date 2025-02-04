import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";
import SidebarLoans from "./SidebarLoans";

const LoansDeductions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const loanRef = collection(db, "companies", companyId, "loans");

      const q = query(loanRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);

      const loanData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLoans(loanData);

      setTotalPages(Math.ceil(loanData.length / 10));
      setPaginationData(loanData.slice(0, 10));
    } catch (error) {
      console.error("Error fetching loan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [companyId]);

  useEffect(() => {
    const filteredLoans = loans.filter((loan) =>
      loan.staff.toLowerCase().includes(searchInput.toLowerCase())
    );
    setPaginationData(
      filteredLoans.slice(currentPage * 10, currentPage * 10 + 10)
    );
    setTotalPages(Math.ceil(filteredLoans.length / 10));
  }, [loans, currentPage, searchInput]);

  const handleAddLoan = (newData) => {
    setLoans((prev) => [...prev, newData]);
  };

  async function OnDeleteLoan(e, loanId, name) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this Loan?"
      );
      if (!confirm) return;
      const ref = doc(db, "companies", companyId, "loans", loanId);
      await deleteDoc(ref);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: ref,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Delete",
        description: `${name} staff loan deleted`,
      });
      setLoans((prev) => {
        const updatedLoans = prev.filter((item) => item.id !== loanId);
        return updatedLoans;
      });
    } catch (error) {
      console.error("Error deleting Loan:", error);
    }
  }

  // Handle loan record click
  const handleLoanClick = (loan) => {
    setSelectedLoan(loan); // Set the clicked loan as selected loan
    setIsSidebarOpen(true); // Open the sidebar for editing
  };

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container2">
        <header className="flex items-center justify-between px-5">
          <div className="flex space-x-3 items-center">
            <h1 className="text-2xl font-bold">Loans&Deductions</h1>
            <div className="input-div-icon">
              <input
                type="text"
                placeholder="Search by Staff Name..."
                className=" w-full"
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
              <IoSearch />
            </div>
          </div>

          <button
            className="btn-add"
            onClick={() => {
              setIsSidebarOpen(true);
              setSelectedLoan(null);
            }}
          >
            + Create Loan
          </button>
        </header>

        <div>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="overflow-y-auto py-3" style={{ height: "76vh" }}>
              <table className="w-full border-collapse text-start">
                <thead className="bg-white">
                  <tr className="border-b">
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Staff Name
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Financial Option
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Payment Schedule
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                      Amount
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                      Delete
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((loan) => (
                      <tr
                        key={loan.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                        onClick={() => handleLoanClick(loan)} // Click handler to open sidebar with loan data
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={loan.date} />
                        </td>
                        <td className="px-5 py-3 text-start">{loan.staff}</td>
                        <td className="px-8 py-3 text-start">
                          {loan.financialOption}
                        </td>
                        <td className="px-8 py-3 text-start">
                          {loan.paymentSchedule}
                        </td>
                        <td className="px-8 py-3 text-end">{loan.amount}</td>
                        <td
                          className="px-12 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className="text-red-500 flex items-center justify-end"
                            onClick={(e) =>
                              OnDeleteLoan(e, loan.id, loan.staff)
                            }
                          >
                            <RiDeleteBin6Line />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="h-24 text-center py-4">
                        No Loan Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage + 1} of {totalPages || 1} page(s)
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

      {/* Sidebar Component for Add/Edit Loan */}
      {isSidebarOpen && (
        <SidebarLoans
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddLoan={handleAddLoan}
          companyId={companyId}
          loanDataToEdit={selectedLoan} // Pass selected loan for editing
        />
      )}
    </div>
  );
};

export default LoansDeductions;
