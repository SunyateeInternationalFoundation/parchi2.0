import PropTypes from "prop-types";
import FormatTimestamp from "../../../constants/FormatTimestamp";

function ProductLogs({ logs }) {
  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <div className="">
          <div
            className=" border-b overflow-y-auto py-5"
            style={{ height: "62vh" }}
          >
            <table className="w-full border-collapse ">
              <thead className="bg-white">
                <tr className="border-b">
                  <th className="px-8 py-1 text-gray-400 font-semibold text-start">
                    Date
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Status
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
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-100 cursor-pointer text-gray-600"
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={log.date} />
                      </td>
                      <td className="px-5 py-3 text-start">{log.status}</td>
                      <td className="px-5 py-3 text-start">{log.from}</td>
                      <td className="px-5 py-3 text-center">{log.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="py-10 text-center">
                      <p>No logs available.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
ProductLogs.propTypes = {
  logs: PropTypes.array,
};

export default ProductLogs;
