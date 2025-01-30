import PropTypes from "prop-types";
import { useState } from "react";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import TransferSidebar from "./TransferSidebar";

function Transfers({ transfersData, refreshTransfersData, productDetails }) {
  console.log("🚀 ~ Transfers ~ transfersData:", transfersData);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  return (
    <div className="main-container" style={{ height: "80vh" }}>
      <div className="container">
        <div>
          <div
            className=" border-b overflow-y-auto space-y-3 "
            style={{ height: "74vh" }}
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
                {transfersData.length > 0 ? (
                  transfersData.map((transfer) => (
                    <tr key={transfer.id}>
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
      </div>
      <TransferSidebar
        isSideBarOpen={isSideBarOpen}
        productDetails={productDetails}
        onClose={() => {
          setIsSideBarOpen(false);
        }}
        refresh={refreshTransfersData}
      />
    </div>
  );
}
Transfers.propTypes = {
  transfersData: PropTypes.array,
};

export default Transfers;
