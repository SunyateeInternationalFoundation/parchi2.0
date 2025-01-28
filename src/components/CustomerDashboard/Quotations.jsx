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

function Quotations({ quotations }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const filteredQuotations = quotations.filter((quotation) => {
      const { createdBy, quotationNo, paymentStatus } = quotation;
      const customerName = createdBy?.name || "";
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotationNo
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

    setPaginationData(
      filteredQuotations.slice(currentPage * 10, currentPage * 10 + 10)
    );
    setTotalPages(Math.ceil(quotations.length / 10));
  }, [currentPage, quotations?.length, searchTerm, filterStatus]);

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
        <div>Quotations</div>
      </div>
      <div className="container">
        <nav className="flex mb-4 items-center px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md"
            >
              <input
                type="text"
                placeholder="Search by quotation #..."
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
                  Quotation No
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Company
                </td>

                <td className="px-5 py-1 text-gray-400 text-center font-semibold  ">
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
                paginationData.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className="border-b cursor-pointer text-start"
                  >
                    <td className="px-8 py-3 text-start">
                      <FormatTimestamp timestamp={quotation.date} />
                    </td>
                    <td className="px-5 py-3 font-bold text-center">
                      {quotation.prefix || ""}-{quotation.quotationNo}
                    </td>

                    <td className="px-5 py-3 text-start">
                      {quotation.createdBy?.name} <br />
                      <span className="text-gray-500 text-sm">
                        Ph.No {quotation.createdBy.phoneNo}
                      </span>
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
                        className={`px-1 text-center py-2 rounded-lg text-xs  ${
                          quotation.paymentStatus === "Paid"
                            ? "bg-green-100 "
                            : quotation.paymentStatus === "Pending"
                            ? "bg-yellow-100 "
                            : "bg-red-100"
                        }`}
                      >
                        <div
                          className={
                            quotation.paymentStatus === "Paid"
                              ? "bg-green-100 "
                              : quotation.paymentStatus === "Pending"
                              ? "bg-yellow-100 "
                              : "bg-red-100 "
                          }
                        >
                          {quotation.paymentStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{quotation.mode || "Online"}</td>

                    <td className="px-5 py-3">{quotation?.createdBy?.who}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="h-96 text-center py-4">
                    <div className="w-full flex justify-center">
                      <img src={addItem} alt="add Item" className="w-24 h-24" />
                    </div>
                    <div className="mb-6">No quotations found</div>
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

export default Quotations;
