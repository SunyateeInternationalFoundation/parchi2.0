import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function DeliveryChallan() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulating fetching challans data
    setTimeout(() => {
      setChallans([
        { customer: "Anshul", amount: 100, status: "Paid", mode: "Online", challanNo: "001", date: "2023-01-01" },
        { customer: "Rakesh", amount: 200, status: "Pending", mode: "Cash", challanNo: "002", date: "2023-02-01" },
        { customer: "Kayatri", amount: 150, status: "Paid", mode: "Online", challanNo: "003", date: "2023-03-01" }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredChallans = challans.filter(challan =>
    challan.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challan.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challan.mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4">
      <header className="flex items-center justify-between my-6">
        <h1 className="text-2xl font-bold text-gray-800">Delivery Challan</h1>
        <Link
          className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600"
          to="create-challan"
        >
          + Create Delivery Challan
        </Link>
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer name, challan number, or mode..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 rounded border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto mt-4">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                {["Customer", "Amount", "Status", "Mode", "Challan NO", "Date / Updated Time"].map((header, index) => (
                  <th key={index} className="p-4 border-b text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredChallans.map((challan, index) => (
                <tr key={index} className="border-b cursor-pointer hover:bg-blue-100">
                  <td className="p-4">{challan.customer}</td>
                  <td className="p-4">{challan.amount}</td>
                  <td className={`p-4 ${challan.status === "Paid" ? "text-green-600 font-bold" : "text-red-500"}`}>
                    {challan.status}
                  </td>
                  <td className="p-4">{challan.mode}</td>
                  <td className="p-4">{challan.challanNo}</td>
                  <td className="p-4">{challan.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Summary */}
      <footer className="flex justify-between mt-4 bg-gray-100 p-4 rounded shadow">
        <div><strong>Total Amount:</strong> ₹450</div>
        <div><strong>Paid Amount:</strong> ₹250</div>
        <div><strong>Pending Amount:</strong> ₹200</div>
      </footer>
    </div>
  );
}

export default DeliveryChallan;
