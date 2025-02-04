import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
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
import { useNavigate } from "react-router-dom";
import addItem from "../../../assets/addItem.png";
import { db } from "../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
import CreateStaff from "./CreateStaff";

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
    setPaginationData(
      filteredStaff.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, staffData, searchInput]);

  const navigate = useNavigate();
  function onViewStaff(staffId) {
    navigate(staffId);
    navigate("staff/" + staffId);
  }

  const handleDeleteStaff = async (staffId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Staff?"
      );
      if (!confirmDelete) return;
      await deleteDoc(doc(db, "staff", staffId));
      fetchStaffData();
    } catch (error) {
      console.log("🚀 ~ handleDeleteStaff ~ error:", error);
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      const invoiceDoc = doc(db, "staff", staffId);
      await updateDoc(invoiceDoc, { status: newStatus });
      setStaffData((prevData) =>
        prevData.map((staff) =>
          staff.id === staffId ? { ...staff, status: newStatus } : staff
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <nav className="flex items-center mb-4 px-5">
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
          <div style={{ minHeight: "82vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className="bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                    Name
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Phone
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Payment Details
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Status
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Actions
                  </td>
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
                      <td className="px-4 py-3 font-bold flex items-center space-x-3">
                        {staff.profileImage ? (
                          <img
                            src={staff.profileImage}
                            alt="Profile"
                            className="mt-2 w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="bg-purple-500 uppercase text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                            {staff.name.charAt(0)}
                          </span>
                        )}
                        <span>{staff.name}</span>
                      </td>
                      <td className="px-5 py-3">{staff.phone}</td>
                      <td className="px-5 py-3">
                        ₹{staff.paymentDetails}
                        <span className="text-xs text-gray-600">
                          {staff.isDailyWages ? " (perDay)" : " (perMonth)"}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className={` text-center flex justify-center items-center h-8 overflow-hidden w-28  rounded-lg text-xs  ${staff.status === "Active"
                              ? "bg-green-100"
                              : "bg-red-100"
                            }`}
                        >
                          <Select
                            value={staff.status}
                            onValueChange={(value) =>
                              handleStatusChange(staff.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={"Select Status"} />
                            </SelectTrigger>
                            <SelectContent className="w-10 h-26">
                              <SelectItem value="Active" className="h-8">
                                Active
                              </SelectItem>
                              <SelectItem value="InActive" className="h-8">
                                InActive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div
                          className="text-red-500 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStaff(staff.id);
                          }}
                        >
                          <RiDeleteBin6Line />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="h-96 text-center py-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={addItem}
                          alt="add Item"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="mb-6">No Staff Found</div>
                      <div className="">
                        <button
                          className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                          onClick={() => setIsSideBarOpen(true)}
                        >
                          + Create Staff
                        </button>
                      </div>
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
                  <LuChevronsRight />
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
