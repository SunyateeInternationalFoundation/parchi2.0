import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import FormatTimestamp from "../../../constants/FormatTimestamp";

function ReturnsHistory({ products }) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(products.length / 10);
  const [paginationData, setPaginationData] = useState([]);
  useEffect(() => {
    setPaginationData(products.slice(currentPage * 10, currentPage * 10 + 10));
  }, [currentPage, products]);
  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="flex justify-center items-center">
        <div className="container">
          <div className="" style={{ height: "76vh " }}>
            <table className="w-full text-center text-gray-500 font-semibold">
              <thead className="border-b">
                <tr>
                  <th className="px-8 py-1 text-start">S.No</th>
                  <th className="px-1 py-1 text-start">Product Name</th>
                  <th className="px-1 py-1 text-start">Date</th>
                  <th className="px-1 py-1">Quantity</th>
                  <th className="px-1 py-1">Return Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((product, index) => (
                    <tr key={product.productRef.id} className="border-b">
                      <td className="px-8 py-3 text-start">{index + 1}</td>
                      <td className="px-1 py-3 text-start">{product.name}</td>
                      <td className="px-1 py-3 text-start">
                        {" "}
                        <FormatTimestamp timestamp={product.createdAt} />
                      </td>
                      <td className="px-1 py-3">{product.quantity}</td>
                      <td className="px-1 py-3">₹{product.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center">
                      No Product Found
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
ReturnsHistory.propTypes = {
  products: PropTypes.array,
};

export default ReturnsHistory;
