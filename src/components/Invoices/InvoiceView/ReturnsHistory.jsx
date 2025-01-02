import PropTypes from "prop-types";
import FormatTimestamp from "../../../constants/FormatTimestamp";

function ReturnsHistory({ products }) {
  return (
    <div className="w-full mt-4">
      <div
        className="pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "76vh" }}
      >
        <div className="bg-white rounded-lg shadow-md overflow-hidden border">
          <table className="min-w-full text-center text-gray-500 font-semibold">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-1 py-4">S.No</th>
                <th className="px-1 py-4 text-start">Product Name</th>
                <th className="px-1 py-4 text-start">Date</th>
                <th className="px-1 py-4">Quantity</th>
                <th className="px-1 py-4">Return Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product.productRef.id} className="border-b">
                    <td className="px-1 py-3">{index + 1}</td>
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
      </div>
    </div>
  );
}
ReturnsHistory.propTypes = {
  products: PropTypes.array,
};

export default ReturnsHistory;
