import { collection, getDocs, query, where } from "firebase/firestore";
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

function Invoice() {
  const userDetails = useSelector((state) => state.users);
  const [loading, setLoading] = useState(false);
  const [companiesId, setCompaniesId] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [invoicePaginationData, setInvoicePaginationData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCustomerCompanies() {
      setLoading(true);
      try {
        const customerRef = collection(db, "customers");
        const q = query(customerRef, where("phone", "==", userDetails.phone));
        const getData = await getDocs(q);
        const getCompaniesId = getData.docs.map((doc) => {
          const { name, companyRef } = doc.data();
          return {
            id: doc.id,
            name,
            companyId: companyRef.id,
          };
        });

        // for (const item of userDetails.userAsOtherCompanies.customer) {
        // }
        setCompaniesId(getCompaniesId);
      } catch (error) {
        console.log("🚀 ~ fetchCustomerCompanies ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerCompanies();
  }, []);

  useEffect(() => {
    setLoading(true);
    async function fetchInvoices() {
      try {
        const invoiceList = [];
        for (const company of companiesId) {
          const invoiceRef = collection(
            db,
            "companies",
            company.companyId,
            "invoices"
          );
          const q = query(
            invoiceRef,
            where("customerDetails.phone", "==", "1234567890")
          );
          const getData = await getDocs(q);
          const getAllInvoices = getData.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });

          invoiceList.push(...getAllInvoices);
        }
        setTotalPages(Math.ceil(invoiceList.length / 10));
        setInvoicePaginationData(invoiceList.slice(0, 10));
        setInvoices(invoiceList);
      } catch (error) {
        console.log("🚀 ~ fetchInvoices ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [companiesId]);
  useEffect(() => {
    const filteredInvoices = invoices.filter((invoice) => {
      const { createdBy, invoiceNo, paymentStatus } = invoice;
      const customerName = createdBy?.name || "";
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoiceNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        createdBy?.phoneNo
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

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        {/* <div className="bg-white rounded-lg shadow mt-4 py-5">
          <h1 className="text-2xl font-bold pb-3 px-10 ">Invoice Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-indigo-600 font-bold">
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
              <div className="text-lg"> Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg"> UnPaid Amount</div>
              <div className="text-3xl text-red-600 font-bold">
                ₹ {totalAmount - paidAmount}
              </div>
            </div>
          </div>
        </div> */}

        <div className="bg-white pb-8 pt-6 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div
                className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
              >
                <input
                  type="text"
                  placeholder="Search by invoice #..."
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
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="UnPaid">UnPaid</option>
                </select>
              </div>
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
                    {invoicePaginationData.length > 0 ? (
                      invoicePaginationData.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-gray-200 text-center cursor-pointer"
                        >
                          <td className="px-8 py-3 text-start">
                            <FormatTimestamp timestamp={invoice.date} />
                          </td>
                          <td className="px-5 py-3 font-bold text-center">
                            {invoice.prefix || ""}- {invoice.invoiceNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {invoice.createdBy?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {invoice.createdBy.phoneNo}
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
                              <div
                                className={
                                  invoice.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : invoice.paymentStatus === "Pending"
                                    ? "bg-yellow-100 "
                                    : "bg-red-100"
                                }
                              >
                                {invoice.paymentStatus}
                              </div>
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
}

export default Invoice;
