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
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";

import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [invoicePaginationData, setInvoicePaginationData] = useState([]);
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
      ?.invoice;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const invoiceRef = collection(db, "companies", companyId, "invoices");
        // const querySnapshot = await getDocs(invoiceRef);
        // const invoicesData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        const q = query(invoiceRef, orderBy("invoiceNo", "asc"));
        const querySnapshot = await getDocs(q);
        const invoicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotalPages(Math.ceil(invoicesData.length / 10));
        setInvoicePaginationData(invoicesData.slice(0, 10));
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const invoiceDoc = doc(db, "companies", companyId, "invoices", invoiceId);
      await updateDoc(invoiceDoc, { paymentStatus: newStatus });
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === invoiceId
            ? { ...invoice, paymentStatus: newStatus }
            : invoice
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const paidAmount = invoices
    .filter((invoice) => invoice.paymentStatus === "Paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const pendingAmount = invoices
    .filter((invoice) => invoice.paymentStatus === "Pending")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  useEffect(() => {
    const filteredInvoices = invoices.filter((invoice) => {
      const { customerDetails, invoiceNo, paymentStatus } = invoice;
      const customerName = customerDetails?.name || "";
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoiceNo
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

    setInvoicePaginationData(
      filteredInvoices.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, invoices, searchTerm, filterStatus]);

  function formatTimestamp(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" }); // 'Jan', 'Feb', etc.
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    return (
      <>
        <div>
          {day}-{month}-{year}
        </div>{" "}
        <div className="text-sm text-gray-400">
          {" "}
          {hours}:{minutes} {ampm}
        </div>
      </>
    );
  }
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className=" mt-4 py-3">
          <h1 className="text-2xl font-bold pb-3 ">Invoice Overview</h1>
          <div className="grid grid-cols-4 gap-8  ">
            <div className="rounded-lg p-5 bg-white shadow  ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-indigo-600 font-bold p-2">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg"> Paid Amount</div>
              <div className="text-3xl text-emerald-600 font-bold p-2">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg"> Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold p-2">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow">
              <div className="text-lg"> UnPaid Amount</div>
              <div className="text-3xl text-red-600 font-bold p-2">
                ₹ {totalAmount - paidAmount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  pb-8 pt-6 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border px-5  py-3 rounded-md w-full">
                <input
                  type="text"
                  placeholder="Search by invoice #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border px-5  py-3 rounded-md ">
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
                  className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                  to="create-invoice"
                >
                  <span className="text-2xl">+</span> Create Invoice
                </Link>
              )}
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading invoices...</div>
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
                        Invoice No
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
                    {invoicePaginationData.length > 0 ? (
                      invoicePaginationData.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-gray-200 text-center cursor-pointer"
                          onClick={(e) => {
                            navigate(invoice.id);
                          }}
                        >
                          <td className="px-8 py-3 text-start">
                            {formatTimestamp(invoice.date)}
                          </td>
                          <td className="px-5 py-3 font-bold">
                            {invoice.prefix || ""}-{invoice.invoiceNo}
                          </td>
                          <td className="px-5 py-3 text-start">
                            {invoice.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {invoice.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3 font-bold  text-center">{`₹ ${invoice.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs  ${
                                invoice.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : invoice.paymentStatus === "Pending"
                                  ? "bg-yellow-100 "
                                  : "bg-red-100"
                              }`}
                            >
                              <select
                                value={invoice.paymentStatus}
                                className={
                                  invoice.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : invoice.paymentStatus === "Pending"
                                    ? "bg-yellow-100 "
                                    : "bg-red-100"
                                }
                                onChange={(e) => {
                                  handleStatusChange(
                                    invoice.id,
                                    e.target.value
                                  );
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="UnPaid">UnPaid</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-start">
                            {invoice.mode || "Online"}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {invoice?.createdBy?.who}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No invoices found
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

export default InvoiceList;
