import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
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
import SetHoliday from "./SetHoliday";

const Holidays = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [holiday, setHoliday] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const fetchHoliday = async () => {
    setLoading(true);
    try {
      const holidayRef = collection(db, "companies", companyId, "holidays");

      const q = query(holidayRef, orderBy("date", "desc"));

      const querySnapshot = await getDocs(q);

      const holidayData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHoliday(holidayData);

      setTotalPages(Math.ceil(holidayData.length / 10)); // Set total pages based on the data length
      setPaginationData(holidayData.slice(0, 10)); // Set initial pagination data
    } catch (error) {
      console.error("Error fetching holiday:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHoliday();
  }, [companyId]);

  useEffect(() => {
    const filteredHoliday = holiday.filter((b) =>
      b.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setPaginationData(
      filteredHoliday.slice(currentPage * 10, currentPage * 10 + 10)
    );
    setTotalPages(Math.ceil(filteredHoliday.length / 10));
  }, [holiday, currentPage, searchInput]);

  const handleAddHoliday = (newData) => {
    setHoliday((prev) => [...prev, newData]);
  };

  async function OnDeleteHoliday(e, holidayId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this Holiday?"
      );
      if (!confirm) return;

      await deleteDoc(doc(db, "companies", companyId, "holiday", holidayId));

      setHoliday((prev) => {
        const updatedHoliday = prev.filter((item) => item.id !== holidayId);

        return updatedHoliday;
      });
    } catch (error) {
      console.error("Error deleting Holiday:", error);
    }
  }
  return (
    <div className="main-container " style={{ height: "82vh" }}>
      <div className="container ">
        <header className="flex items-center justify-between px-5">
          <div className="flex space-x-3  items-center">
            <h1 className="text-2xl font-bold">Holidays</h1>
            <div className="input-div-icon">
              <input
                type="text"
                placeholder="Search by Holiday Name..."
                className=" w-full"
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
              <IoSearch />
            </div>
          </div>

          <button
            className="btn-add "
            onClick={() => {
              setIsSidebarOpen(true);
            }}
          >
            + Create Holiday
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
                      Name
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                      Delete
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((holiday) => (
                      <tr
                        key={holiday.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={holiday.createdAt} />
                        </td>
                        <td className="px-5 py-3 text-start">{holiday.name}</td>
                        <td
                          className="px-12 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className="text-red-500 flex items-center justify-end"
                            onClick={() => OnDeleteHoliday(holiday.id)}
                          >
                            <RiDeleteBin6Line />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="h-24 text-center py-4">
                        No Holiday Found
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
      {isSidebarOpen && (
        <SetHoliday
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddHoliday={handleAddHoliday}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default Holidays;
