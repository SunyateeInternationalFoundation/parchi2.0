import PropTypes from "prop-types";
import FormatTimestamp from "../../../constants/FormatTimestamp";

function ReturnsHistory({ products }) {
  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container" style={{ height: "72vh" }}>
        <div className="overflow-y-auto" style={{ height: "68vh " }}>
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
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product.productRef.id} className="border-b">
                    <td className="px-1 py-3 text-start">{index + 1}</td>
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
