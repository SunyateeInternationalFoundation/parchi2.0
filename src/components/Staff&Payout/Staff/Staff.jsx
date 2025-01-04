import { collection, doc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { LuChevronsLeft, LuChevronLeft, LuChevronRight, LuChevronsRight } from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import CreateStaff from "./CreateStaff";
import { RiDeleteBin6Line } from "react-icons/ri";

function Staff() {
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  async function fetchStaffData() {
    try {
      setLoading(true);
      const companyRef = doc(db, "companies", companyId);
      const q = query(
        collection(db, "staff"),
        where("companyRef", "==", companyRef)
      );
      const getData = await getDocs(q);
      const staffData = getData.docs.map((doc) => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl, // Ensure imageUrl is fetched
        ...doc.data(),
      }));
      setStaffData(staffData);
      setTotalPages(Math.ceil(staffData.length / 10));
      setPaginationData(staffData.slice(0, 10));
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaffData();
  }, [companyId]);

  useEffect(() => {
    const filteredStaff = staffData.filter((staff) =>
      `${staff.name} ${staff.phone}`
        .toLowerCase()
        .includes(searchInput.toLowerCase())
    );

    setTotalPages(Math.ceil(filteredStaff.length / 10));
    setPaginationData(filteredStaff.slice(currentPage * 10, currentPage * 10 + 10));
  }, [currentPage, staffData, searchInput]);

  const navigate = useNavigate();
  function onViewStaff(staffId) {
    navigate(staffId);
  }

  const handleDeleteStaff = async (staffId) => {
    try {
      await deleteDoc(doc(db, "staff", staffId));
      fetchStaffData();
    } catch (error) {
      console.log("🚀 ~ handleDeleteStaff ~ error:", error);
    }
  };

  return (
    <div className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto" style={{ height: "92vh" }}>
      <div className="bg-white pb-8 pt-6 rounded-lg shadow my-6">
        <nav className="flex mb-4 px-5">
          <div className="space-x-4 w-full">
            <div className="flex items-center space-x-4 border px-5 py-3 rounded-md w-full">
              <input
                type="text"
                placeholder="Search by Staff Name, Phone number..."
                className="w-full focus:outline-none"
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <IoSearch />
            </div>
          </div>
          <div className="w-full text-end">
            <button
              className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
              onClick={() => setIsSideBarOpen(true)}
            >
              + Create Staff
            </button>
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6">Loading Staff...</div>
        ) : (
          <div style={{ height: "96vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className="bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start">Name</td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">Phone</td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">Payment Details</td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">Actions</td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((staff) => (
                    <tr
                      key={staff.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() => onViewStaff(staff.id)}
                    >
                      <td className="px-2 py-3 font-bold flex items-center space-x-3">
                      <img
                                src={staff.profileImage}
                                alt="Profile"
                                className="mt-2 w-10 h-10 rounded-full object-cover"
                              />
                        <span>{staff.name}</span>
                      </td>
                      <td className="px-5 py-3">{staff.phone}</td>
                      <td className="px-5 py-3">₹{staff.paymentDetails}</td>
                      <td className="px-5 py-3">
                        <div
                          className="text-red-500 flex items-center justify-center"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <RiDeleteBin6Line />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="h-24 text-center py-4">
                      No Staff Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
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
                  <LuChevronsRight className="" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isSideBarOpen && (
        <CreateStaff
          isOpen={isSideBarOpen}
          onClose={() => {
            setIsSideBarOpen(false);
          }}
          staffAdded={fetchStaffData}
        />
      )}
    </div>
  );
}

export default Staff;
