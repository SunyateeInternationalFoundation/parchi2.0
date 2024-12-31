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
import { db } from "../../firebase";

function Quotation() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const userDetails = useSelector((state) => state.users);

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
      ?.quotation;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        const quotationRef = collection(
          db,
          "companies",
          companyId,
          "quotations"
        );

        const q = query(quotationRef, orderBy("quotationNo", "asc"));
        const querySnapshot = await getDocs(q);
        const quotationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotalPages(Math.ceil(quotationsData.length / 10));
        setPaginationData(quotationsData.slice(0, 10));
        setQuotations(quotationsData);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      const quotationDoc = doc(
        db,
        "companies",
        companyId,
        "quotations",
        quotationId
      );
      await updateDoc(quotationDoc, { paymentStatus: newStatus });
      setQuotations((prevQuotations) =>
        prevQuotations.map((quotation) =>
          quotation.id === quotationId
            ? { ...quotation, paymentStatus: newStatus }
            : quotation
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = quotations.reduce(
    (sum, quotation) => sum + quotation.total,
    0
  );

  const paidAmount = quotations
    .filter((quotation) => quotation.paymentStatus === "Paid")
    .reduce((sum, quotation) => sum + quotation.total, 0);
  const pendingAmount = quotations
    .filter((quotation) => quotation.paymentStatus === "Pending")
    .reduce((sum, quotation) => sum + quotation.total, 0);

  useEffect(() => {
    const filteredQuotations = quotations.filter((quotation) => {
      const { customerDetails, quotationNo, paymentStatus } = quotation;
      const customerName = customerDetails?.name || "";
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotationNo
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
      filteredQuotations.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, quotations, searchTerm, filterStatus]);
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 py-5">
          <h1 className="text-2xl font-bold pb-3 px-10 ">Quotation Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg"> Paid Amount</div>
              <div className="text-3xl text-emerald-600 font-bold">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg">Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg">UnPaid Amount </div>
              <div className="text-3xl text-red-600 font-bold">
                ₹ {totalAmount - paidAmount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  py-8 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by quotation #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg ">
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
                  className="bg-blue-500 text-white py-2 px-2 rounded-lg"
                  to="create-quotation"
                >
                  + Create Quotation
                </Link>
              )}
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading quotations...</div>
          ) : (
            <div className="" style={{ height: "96vh" }}>
              <div className="" style={{ height: "92vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className=" bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Quotation No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Customer
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-600 text-center font-semibold  ">
                        Amount
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-center ">
                        Status
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Mode
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Created By
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {paginationData.length > 0 ? (
                      paginationData.map((quotation) => (
                        <tr
                          key={quotation.id}
                          className="border-b cursor-pointer text-start"
                          onClick={() => {
                            navigate(quotation.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">
                            {quotation.quotationNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {quotation.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {quotation.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              quotation.date.seconds * 1000 +
                                quotation.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold  text-center">{`₹ ${quotation.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                quotation.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : quotation.paymentStatus === "Pending"
                                  ? "bg-yellow-100 "
                                  : "bg-red-100"
                              }`}
                            >
                              <select
                                value={quotation.paymentStatus}
                                onChange={(e) => {
                                  handleStatusChange(
                                    quotation.id,
                                    e.target.value
                                  );
                                }}
                                className={
                                  quotation.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : quotation.paymentStatus === "Pending"
                                    ? "bg-yellow-100 "
                                    : "bg-red-100 "
                                }
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="UnPaid">UnPaid</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {quotation.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {/* {quotation?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name} */}
                            {quotation?.createdBy?.who}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No quotations found
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

export default Quotation;
