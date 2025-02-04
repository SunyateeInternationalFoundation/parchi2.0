import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import addItem from "../../assets/addItem.png";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

const AllLogs = () => {
  const [loading, setLoading] = useState(false);

  const [allLogs, setAllLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  async function fetchLogs() {
    setLoading(true);
    try {
      const bookRef = collection(db, "companies", companyId, "audit");
      const q = query(bookRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const bookData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });

      setTotalPages(Math.ceil(bookData.length / 10));
      setPaginationData(bookData.slice(0, 10));
      setAllLogs(bookData);
    } catch (error) {
      console.log("🚀 ~ fetchallLogs ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);
  useEffect(() => {
    const filteredLogs = allLogs.filter((book) => {
      const { section, action } = book;
      const matchesSearch = `${section} ${action}`
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    setPaginationData(
      filteredLogs.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, allLogs, searchTerm]);
  console.log("logs", allLogs);
  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <header className="mt-4  py-3">
        <h1 className="text-2xl font-bold">All Logs</h1>
      </header>

      <div className="flex items-center justify-center">
        <div className="container2">
          <nav className="flex items-center mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4  border px-5  py-3 rounded-md w-full">
                <input
                  type="text"
                  placeholder="Search ..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch />
              </div>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading ...</div>
          ) : (
            <div className="overflow-y-auto" style={{ minHeight: "80vh" }}>
              <table className="w-full border-collapse text-start">
                <thead className=" bg-white">
                  <tr className="border-b">
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                      Section
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                      Action
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                      Description
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((logs) => (
                      <tr
                        key={logs.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={logs.date} />
                        </td>
                        <td className="px-5 py-3 text-start">{logs.section}</td>
                        <td className="px-5 py-3 ">{logs.action}</td>
                        <td className="px-5 py-3 text-start">
                          {logs.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="h-24 text-center py-4">
                        <div className="w-full flex justify-center">
                          <img
                            src={addItem}
                            alt="add Item"
                            className="w-24 h-24"
                          />
                        </div>

                        <div> No Logs Found </div>
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
      </div>
    </div>
  );
};

export default AllLogs;
