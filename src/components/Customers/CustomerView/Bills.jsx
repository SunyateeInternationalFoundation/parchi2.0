import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
function Bills({ salesData }) {
  const tabs = {
    Invoice: {
      colletionName: "invoices",
      path: "invoice",
    },
    Quotation: {
      collectionName: "quotations",
      path: "quotation",
    },
    "Pro Forma Invoice": {
      collectionName: "proFormaInvoice",
      path: "pro-forma-invoice",
    },
    "Delivery Challan": {
      collectionName: "deliveryChallan",
      path: "delivery-challan",
    },
    "Credit Note": {
      collectionName: "creditNote",
      path: "credit-note",
    },
  };
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [paginationData, setPaginationData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const collection = salesData[tabs[activeTab].collectionName] || [];
    console.log("collection", collection);
    setTotalPages(Math.ceil(collection?.length / 10));
    const filteredServices = collection.filter((service) => {
      const { paymentStatus, no } = service;
      const matchesSearch = no
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    console.log("🚀 ~ filteredServices ~ filteredServices:", filteredServices);
    setPaginationData(
      filteredServices.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, salesData, searchTerm, filterStatus, activeTab]);
  console.log("salesData", salesData);
  return (
    <div
      className="w-full bg-gray-100 overflow-y-auto"
      style={{ height: "84vh" }}
    >
      <div className=" px-8 py-4 space-x-3 border-b mb-3 bg-white">
        {Object.keys(tabs).map((ele) => (
          <button
            className={
              "px-4 py-1 border rounded-md " +
              (activeTab == ele && "bg-black text-white")
            }
            key={ele}
            onClick={() => setActiveTab(ele)}
          >
            {ele}
          </button>
        ))}
      </div>
      <div className="bg-white mx-8 rounded-lg shadow ">
        <nav className="flex py-4 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-3/2"
            >
              <input
                type="text"
                placeholder="Search by Sales #..."
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

        <div style={{ height: "96vh" }}>
          <div style={{ height: "88vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Date
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    {activeTab} No
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
                  paginationData.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() => {
                        navigate(`/${tabs[activeTab].path}/${sale.id}`);
                      }}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={sale.date} />
                      </td>
                      <td className="px-5 py-3 font-bold">
                        {sale.prefix || ""}-{sale.no}
                      </td>
                      <td className="px-5 py-3 font-bold  text-center">{`₹ ${sale.total.toFixed(
                        2
                      )}`}</td>
                      <td
                        className="px-5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className={`px-1 text-center py-2 rounded-lg text-xs  ${
                            sale.paymentStatus === "Paid"
                              ? "bg-green-100 "
                              : sale.paymentStatus === "Pending"
                              ? "bg-yellow-100 "
                              : "bg-red-100"
                          }`}
                        >
                          <div>{sale.paymentStatus}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-start">
                        {sale.mode || "Online"}
                      </td>

                      <td className="px-5 py-3 text-start">
                        {sale?.createdBy?.who}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="h-24 text-center py-4">
                      No {activeTab} found
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
    </div>
  );
}

Bills.propTypes = {
  salesData: PropTypes.object,
};

export default Bills;
