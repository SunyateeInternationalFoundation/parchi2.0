import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";

const CreditNote = () => {
  const [creditNotes, setCreditNotes] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [creditNoteDate, setCreditNoteDate] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const reasons = ["Return", "Overcharge", "Discount"];

  const addCreditNote = (e) => {
    e.preventDefault();
    if (
      !customerName ||
      !invoiceNumber ||
      !creditNoteDate ||
      !reason ||
      !amount
    )
      return;

    const newCreditNote = {
      id: new Date().getTime(),
      customerName,
      invoiceNumber,
      creditNoteDate,
      reason,
      amount,
    };

    setCreditNotes([...creditNotes, newCreditNote]);
    clearForm();
    setIsSidebarOpen(false); // Close the sidebar after adding
  };

  const clearForm = () => {
    setCustomerName("");
    setInvoiceNumber("");
    setCreditNoteDate("");
    setReason("");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to={"./../"}
            className="flex items-center text-gray-700 py-1 px-4 rounded-full hover:bg-gray-200 transition duration-200"
          >
            <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-lg font-medium"></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Credit Notes</h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 focus:outline-none"
        >
          Add Credit Note
        </button>
      </div>

      {/* Credit Notes List */}
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-200 text-gray-700 ">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Customer Name</th>
            <th className="py-3 px-4 text-left">Invoice Number</th>
            <th className="py-3 px-4 text-left">Credit Note Date</th>
            <th className="py-3 px-4 text-left">Reason</th>
            <th className="py-3 px-4 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {creditNotes.map((note) => (
            <tr key={note.id} className="border-t border-gray-200 ">
              <td className="py-3 px-4">{note.id}</td>
              <td className="py-3 px-4">{note.customerName}</td>
              <td className="py-3 px-4">{note.invoiceNumber}</td>
              <td className="py-3 px-4">{note.creditNoteDate}</td>
              <td className="py-3 px-4">{note.reason}</td>
              <td className="py-3 px-4">{note.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end z-50">
          <div className="w-96 bg-white h-full p-6 shadow-lg overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Add Credit Note
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                ✖
              </button>
            </div>
            <form onSubmit={addCreditNote} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Customer Name:
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Invoice Number:
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Credit Note Date:
                </label>
                <input
                  type="date"
                  value={creditNoteDate}
                  onChange={(e) => setCreditNoteDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reason:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Reason</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Amount:
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 focus:outline-none"
              >
                Add Credit Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditNote;
