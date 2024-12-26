import React from "react";

function ReturnsHistory({ products }) {
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "76vh" }}
      >
        <div className="bg-white">
          <div className="mb-4">
            <table className="min-w-full text-center text-gray-500 font-semibold">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-1 py-2">Date</th>
                  <th className="px-1 py-2">Product Name</th>
                  <th className="px-1 py-2">Quantity</th>
                  <th className="px-1 py-2">Return Amount</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.productRef.id} className="border-b-2">
                      <td className="px-1 py-2">{product.createdAt}</td>
                      <td className="px-1 py-2">{product.name}</td>
                      <td className="px-1 py-2">{product.quantity}</td>
                      <td className="px-1 py-2">₹{product.amount}</td>
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
    </div>
  );
}

export default ReturnsHistory;
