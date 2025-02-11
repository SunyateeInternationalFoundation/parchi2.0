import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import TransferSidebar from "./TransferSidebar";

function Transfers({ transfersData, refreshTransfersData, productDetails }) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [updateData, setUpdateData] = useState({});

  useEffect(() => {
    if (transfersData.length <= 0) {
      return;
    }
    setTotalPages(Math.ceil(transfersData.length / 10));
    setPaginationData(transfersData.slice(0, 10));
  }, [transfersData]);

  useEffect(() => {
    if (!transfersData?.id) {
      return;
    }
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    setPaginationData(transfersData.slice(startIndex, endIndex));
  }, [currentPage, transfersData]);

  return (
    <div className="main-container" style={{ height: "80vh" }}>
      <div className="container2">
        <div>
          <div
            className="border-b overflow-y-auto space-y-3"
            style={{ height: "80vh" }}
          >
            <div className="w-full text-end px-5">
              <button
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                onClick={() => setIsSideBarOpen(true)}
              >
                + Create Transfer
              </button>
            </div>
            <table className="w-full border-collapse ">
              <thead className="bg-white">
                <tr className="border-b">
                  <th className=" pl-8 py-1 text-gray-400 font-semibold text-start">
                    Date
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    From
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    To
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((transfer) => (
                    <tr key={transfer.id} className="cursor-pointer" onClick={() => {
                      setUpdateData(transfer)
                      setIsSideBarOpen(true)
                    }}>
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={transfer.date} />
                      </td>
                      <td className="px-5 py-3 text-start">{transfer.from}</td>
                      <td className="px-5 py-3 text-start">{transfer.to}</td>
                      <td className="px-5 py-3 text-center">
                        {transfer.quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="py-10 text-center">
                      <p>No Transfer available.</p>
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
      <TransferSidebar
        isSideBarOpen={isSideBarOpen}
        productDetails={productDetails}
        onClose={() => {
          setUpdateData({})
          setIsSideBarOpen(false);
        }}
        updateData={updateData}
        refresh={(data) => {
          const modifiedData = transfersData.filter(ele => ele.id !== data.id)
          refreshTransfersData([data, ...modifiedData])
        }
        }
      />
    </div>
  );
}
Transfers.propTypes = {
  transfersData: PropTypes.array,
};

export default Transfers;
