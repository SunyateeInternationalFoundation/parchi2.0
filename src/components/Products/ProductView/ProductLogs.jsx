import React from "react";

function ProductLogs() {
  const products = [];
  return (
    <div className="p-6 bg-gray-50 overflow-y-auto" style={{ height: "76vh" }}>
      <div>
        <div className="bg-gray-50 border-b mb-4 py-4">
          <table className="min-w-full text-center text-gray-800 font-semibold">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">status</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-100 cursor-pointer text-gray-600"
                  >
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.description}</td>
                    <td className="px-4 py-3">{product.description}</td>
                    <td className="px-4 py-3">{product.description}</td>
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
  );
}

export default ProductLogs;
