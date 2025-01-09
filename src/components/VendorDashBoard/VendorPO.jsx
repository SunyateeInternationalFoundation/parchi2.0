import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

const VendorPO = () => {
  const userDetails = useSelector((state) => state.users);
  const phone = userDetails.phone;
  const asVendorDetails = userDetails.userAsOtherCompanies.vendor;

  const [loading, setLoading] = useState(false);
  const [po, setPo] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    async function fetchPO() {
      try {
        const POList = [];
        for (const item of asVendorDetails) {
          const poRef = collection(db, "companies", item.companyId, "po");
          const q = query(
            poRef,
            where(
              "vendorDetails.vendorRef",
              "==",
              doc(db, "vendors", item.vendorId)
            )
          );
          const getData = await getDocs(q);
          const getAllPO = getData.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });
          POList.push(...getAllPO);
        }
        setTotalPages(Math.ceil(POList.length / 10));
        setPaginationData(POList.slice(0, 10));
        setPo(POList);
      } catch (error) {
        console.log("🚀 ~ fetchPO ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPO();
  }, [asVendorDetails]);

  useEffect(() => {
    const filteredPO = po.filter((item) => {
      const { createdBy, poNo, orderStatus } = item;
      const vendorName = createdBy?.name || "";
      const matchesSearch =
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        createdBy?.phoneNo
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || orderStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredPO.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, po, searchTerm, filterStatus]);

  return (
    <div className="w-full">
      <div className="main-container" style={{ height: "92vh" }}>
        <div className="bg-white pb-8 pt-6 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div
                className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
              >
                <input
                  type="text"
                  placeholder="Search by PO #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch />
              </div>
              <div
                className="flex items-center space-x-4  border
      px-5 py-3 rounded-md  "
              >
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading po...</div>
          ) : (
            <div style={{ height: "96vh" }}>
              <div style={{ height: "92vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className=" bg-white">
                    <tr className="border-b">
                      <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                        PO No
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                        Company
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
                      paginationData.map((po) => (
                        <tr
                          key={po.id}
                          className="border-b text-center cursor-pointer text-start"
                        >
                          <td className="px-8 py-3 text-start">
                            <FormatTimestamp timestamp={po.date} />
                          </td>
                          <td className="px-5 py-3 font-bold text-center">
                            {po.prefix || ""}-{po.poNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {po.createdBy?.name} <br />
                            <span className="text-gray-500">
                              Ph.No {po.createdBy.phoneNo}
                            </span>
                          </td>

                          <td className="px-5 py-3  text-center">{`₹ ${po.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs  ${
                                po.orderStatus !== "Pending"
                                  ? "bg-green-200 "
                                  : "bg-red-200 "
                              }`}
                            >
                              <div
                                className={` ${
                                  po.orderStatus !== "Pending"
                                    ? "bg-green-200 "
                                    : "bg-red-200 "
                                }`}
                              >
                                {po.orderStatus}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">{po.mode || "Online"}</td>

                          <td className="px-5 py-3">{po?.createdBy?.who}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No po found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPO;
