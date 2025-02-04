import { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import FormatTimestamp from "../../constants/FormatTimestamp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

function Invoice({ invoices }) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [invoicePaginationData, setInvoicePaginationData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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
    setTotalPages(Math.ceil(invoices.length / 10));
  }, [currentPage, invoices?.length, searchTerm, filterStatus]);

  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <div className="flex items-center text-lg font-bold space-x-3">
        <AiOutlineHome
          className="cursor-pointer"
          size={24}
          onClick={() => {
            navigate("/customer");
          }}
        />
        <div>Invoices</div>
      </div>
      <div className="container2">
        <nav className="flex mb-4 items-center px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md "
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
            <div className="w-56 ">
              <Select
                value={filterStatus || "All"}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Select Filter"} />
                </SelectTrigger>
                <SelectContent className=" h-26">
                  <SelectItem value="All"> All </SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="UnPaid">UnPaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </nav>
        <div style={{ height: "92vh" }}>
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
                  <td colSpan="7" className="h-96 text-center py-4">
                    <div className="w-full flex justify-center">
                      <img src={addItem} alt="add Item" className="w-24 h-24" />
                    </div>
                    <div className="mb-6">No invoices found</div>
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
    </div>
  );
}

export default Invoice;
