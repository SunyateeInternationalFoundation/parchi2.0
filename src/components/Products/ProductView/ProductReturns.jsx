import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import FormatTimestamp from "../../../constants/FormatTimestamp";

function ProductReturns({ returns }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  useEffect(() => {
    // Calculate total pages based on returns length
    setTotalPages(Math.ceil(returns.length / 10));
    // Set initial pagination data
    setPaginationData(returns.slice(0, 10));
  }, [returns]);

  useEffect(() => {
    // Update pagination data when currentPage changes
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    setPaginationData(returns.slice(startIndex, endIndex));
  }, [currentPage, returns]);

  return (
    <div className="main-container" style={{ height: "80vh" }}>
      <div className="container2">
        <div>
          <div
            className="border-b overflow-y-auto py-5"
            style={{ height: "92vh" }}
          >
            <table className="w-full border-collapse ">
              <thead className="bg-white">
                <tr className="border-b">
                  <th className="px-8 py-1 text-gray-400 font-semibold text-start">
                    Date
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    From
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold ">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((log) => (
                    <tr key={log.id}>
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={log.date} />
                      </td>
                      <td className="px-5 py-3 text-start">{log.from}</td>
                      <td className="px-5 py-3 text-center">{log.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="py-10 text-center">
                      <p>No Returns available.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
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
ProductReturns.propTypes = {
  returns: PropTypes.array,
};

export default ProductReturns;
