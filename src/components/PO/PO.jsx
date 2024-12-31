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
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

function PO() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(!true);
  const userDetails = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
      ?.po;

  const navigate = useNavigate();
  const [POList, setPOList] = useState([]);

  const [POCount, setPOCount] = useState({
    total: 0,
    received: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    async function fetchPoList() {
      setLoading(true);
      try {
        const getData = await getDocs(
          collection(db, "companies", companyId, "po")
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
        setPOList(data);
        setPOCount({
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

  async function onStatusUpdate(value, poId) {
    try {
      const docRef = doc(db, "companies", companyId, "po", poId);
      await updateDoc(docRef, { orderStatus: value });
      const UpdatedData = POList.map((ele) => {
        if (ele.id === poId) {
          ele.orderStatus = value;
        }
        return ele;
      });
      setPOList(UpdatedData);
      alert("Successfully Status Updated");
    } catch (error) {
      console.log("🚀 ~ onStatusUpdate ~ error:", error);
    }
  }
  useEffect(() => {
    const filteredPO = POList.filter((po) => {
      const { vendorDetails, poNo, orderStatus } = po;
      const vendorName = vendorDetails?.name || "";
      const matchesSearch =
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorDetails?.phone
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
  }, [currentPage, POList, searchTerm, filterStatus]);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="mt-4 py-3">
          <h1 className="text-2xl font-bold pb-3 ">PO Overview</h1>
          <div className="grid grid-cols-4 gap-8">
            <div className="rounded-lg p-5  bg-white shadow  ">
              <div className="text-lg">All PO&apos;s</div>
              <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold p-2">
                ₹ {POCount.total}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg">Received PO</div>
              <div className="text-3xl text-green-600 font-bold p-2">
                {" "}
                ₹ {POCount.received}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg">Pending PO</div>
              <div className="text-3xl text-orange-600 font-bold p-2">
                {" "}
                ₹ {POCount.total - POCount.received}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow">
              <div className="text-lg">Total Paid PO Amount</div>
              <div className="text-3xl text-red-600 font-bold p-2">
                ₹ {POCount.totalPrice}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  pb-8 pt-6  rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border px-5  py-3 rounded-md w-full">
                <input
                  type="text"
                  placeholder="Search by PO #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border px-5 py-3 rounded-md  ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              {(userDetails.selectedDashboard === "" || role?.create) && (
                <Link
                  className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                  to="create-po"
                >
                  + Create PO
                </Link>
              )}
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading po...</div>
          ) : (
            <div className="" style={{ height: "96vh" }}>
              <div className="" style={{ height: "92vh" }}>
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
                      paginationData.map((po) => (
                        <tr
                          key={po.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(po.id);
                          }}
                        >
                          <td className="px-8 py-3 text-start">
                            <FormatTimestamp timestamp={po.date} />
                          </td>
                          <td className="px-5 py-3 font-bold text-center">
                            {po.prefix || ""}-{po.poNo}
                          </td>
                          <td className="px-5 py-3 text-start">
                            {po.vendorDetails?.name} <br />
                            <span className="text-gray-500">
                              Ph.No {po.vendorDetails.phone}
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
                              <select
                                value={po.orderStatus}
                                onChange={(e) => {
                                  onStatusUpdate(e.target.value, po.id);
                                }}
                                className={` ${
                                  po.orderStatus !== "Pending"
                                    ? "bg-green-200 "
                                    : "bg-red-200 "
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Received">Received</option>
                              </select>
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
}

export default PO;
