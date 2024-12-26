import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";

import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

const InvoiceList = ({ companyDetails, isStaff }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const invoiceRef = collection(db, "companies", companyId, "invoices");
        const querySnapshot = await getDocs(invoiceRef);
        const invoicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // const q = query(invoiceRef, orderBy("date", "desc"));
        // const querySnapshot = await getDocs(q);
        // const invoicesData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
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

  const filteredInvoices = invoices.filter((invoice) => {
    const { customerDetails, invoiceNo, paymentStatus } = invoice;
    const customerName = customerDetails?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerDetails?.phone
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + invoice.total,
    0
  );

  const paidAmount = filteredInvoices
    .filter((invoice) => invoice.paymentStatus === "Paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingAmount = filteredInvoices
    .filter((invoice) => invoice.paymentStatus === "Pending")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 h-48">
          <h1 className="text-2xl font-bold py-3 px-10 ">Invoice Overview</h1>
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
        </div>

        <div className="bg-white  py-8 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by invoice #..."
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
              <Link
                className="bg-blue-500 text-white py-2 px-2 rounded-lg"
                to="create-invoice"
              >
                + Create Invoice
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading invoices...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Invoice No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Customer
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold  text-center">
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
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-gray-200 text-center cursor-pointer  text-start"
                          onClick={(e) => {
                            navigate(invoice.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">
                            {invoice.invoiceNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {invoice.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {invoice.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              invoice.date.seconds * 1000 +
                                invoice.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold  text-center">{`₹ ${invoice.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
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
                          <td className="px-5 py-3">
                            {invoice.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {invoice?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
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
                  0 of 10 row(s) selected.
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronsLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronRight className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
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
