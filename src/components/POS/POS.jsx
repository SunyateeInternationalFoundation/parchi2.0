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
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

const POS = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const userDetails = useSelector((state) => state.users);
  // let companyId;
  // if (!companyDetails) {
  //   companyId =
  //     userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  // } else {
  //   companyId = companyDetails.id;
  // }
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
      ?.pos;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPos = async () => {
      setLoading(true);
      try {
        const posRef = collection(db, "companies", companyId, "pos");
        // const querySnapshot = await getDocs(posRef);
        // const posData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        const q = query(posRef, orderBy("posNo", "asc"));
        const querySnapshot = await getDocs(q);
        const posData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotalPages(Math.ceil(posData.length / 10));
        setPaginationData(posData.slice(0, 10));
        setPos(posData);
      } catch (error) {
        console.error("Error fetching pos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPos();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (posId, newStatus) => {
    try {
      const posDoc = doc(db, "companies", companyId, "pos", posId);
      await updateDoc(posDoc, { paymentStatus: newStatus });
      setPos((prevPos) =>
        prevPos.map((pos) =>
          pos.id === posId ? { ...pos, paymentStatus: newStatus } : pos
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = pos.reduce((sum, pos) => sum + pos.total, 0);

  const paidAmount = pos
    .filter((pos) => pos.paymentStatus === "Paid")
    .reduce((sum, pos) => sum + pos.total, 0);
  const pendingAmount = pos
    .filter((pos) => pos.paymentStatus === "Pending")
    .reduce((sum, pos) => sum + pos.total, 0);

  useEffect(() => {
    const filteredPos = pos.filter((dc) => {
      const { customerDetails, posNo, paymentStatus } = dc;
      const customerName = customerDetails?.name || "";
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        posNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerDetails?.phone
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredPos.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, pos, searchTerm, filterStatus]);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="mt-4 py-3">
          <h1 className="text-2xl font-bold pb-3 ">POS Overview</h1>
          <div className="grid grid-cols-4 gap-8">
            <div className="rounded-lg p-5  bg-white shadow  ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold p-2">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg">Paid Amount</div>
              <div className="text-3xl text-emerald-600 font-bold p-2">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg">Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold p-2">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow">
              <div className="text-lg">UnPaid Amount</div>
              <div className="text-3xl text-red-600 font-bold p-2">
                ₹ {totalAmount - paidAmount}
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
                  placeholder="Search by customer name, phone number, pos number#..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border px-5 py-3 rounded-md  ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="UnPaid">UnPaid</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              {(userDetails.selectedDashboard === "" || role?.create) && (
                <Link
                  className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                  to="create-pos"
                >
                  + Create POS
                </Link>
              )}
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading pos...</div>
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
                        POS No
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                        Customer
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
                      paginationData.map((pos) => (
                        <tr
                          key={pos.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(pos.id);
                          }}
                        >
                          <td className="px-8 py-3 text-start">
                            <FormatTimestamp timestamp={pos.date} />
                          </td>
                          <td className="px-5 py-3 font-bold text-center">
                            {pos.prefix || ""}-{pos.posNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {pos.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {pos.customerDetails.phone}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold  text-center">{`₹ ${pos.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs  ${
                                pos.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : pos.paymentStatus === "Pending"
                                  ? "bg-yellow-100 "
                                  : "bg-red-100 "
                              }`}
                            >
                              <select
                                value={pos.paymentStatus}
                                onChange={(e) => {
                                  handleStatusChange(pos.id, e.target.value);
                                }}
                                className={` ${
                                  pos.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : pos.paymentStatus === "Pending"
                                    ? "bg-yellow-100 "
                                    : "bg-red-100 "
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="UnPaid">UnPaid</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3">{pos.mode || "Online"}</td>

                          <td className="px-5 py-3">{pos?.createdBy?.who}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No pos found
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
};

export default POS;
