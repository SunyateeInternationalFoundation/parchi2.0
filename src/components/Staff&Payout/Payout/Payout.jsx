import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";


function Payout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <header className="flex items-center justify-between px-5">
          <div className="flex space-x-3 items-center">
            <h1 className="text-2xl font-bold">Payouts</h1>
            <div className="flex items-center bg-white space-x-4 border p-2 rounded-md">
              <input
                type="text"
                placeholder="Search by Payout Name..."
                className="w-full focus:outline-none"
              />
              <IoSearch />
            </div>
          </div>
          <button
            className="btn-add"
            onClick={() => setSidebarOpen(true)}
          >
            + Create Payout
          </button>
        </header>

        <div className="py-3" style={{ height: "92vh" }}>
          <table className="w-full border-collapse text-start">
            <thead className="bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start">Date</td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">Name</td>
                <td className="px-8 py-1 text-gray-400 font-semibold text-end">Action</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="h-24 text-center py-4">
                  No Payout Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            1 of 1 page(s)
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                disabled
              >
                <div className="flex justify-center">
                  <LuChevronsLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                disabled
              >
                <div className="flex justify-center">
                  <LuChevronLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                disabled
              >
                <div className="flex justify-center">
                  <LuChevronRight className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                disabled
              >
                <div className="flex justify-center">
                  <LuChevronsRight />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for Create Payout */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 opacity-100 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="bg-white pt-2 transform transition-transform translate-x-0"
            style={{ maxHeight: "100vh", width: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex justify-between items-center border-b px-5 py-3"
              style={{ height: "6vh" }}
            >
              <h2 className="text-sm text-gray-600">Create Payout</h2>
              <button
                className="text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              >
                 <IoMdClose size={24} />
              </button>
            </div>

            <div className="p-5 space-y-4" style={{ height: "84vh" }}>
              <label htmlFor="basicSalary" className="text-sm text-gray-600">
                Basic Salary
              </label>
              <input
                id="basicSalary"
                type="number"
                className="w-full input-tag"
              />

              <label htmlFor="deductions" className="text-sm text-gray-600">
                Deductions
              </label>
              <input
                id="deductions"
                type="number"
                className="w-full input-tag"
              />

              <label htmlFor="bonuses" className="text-sm text-gray-600">
                Bonuses/Incentives
              </label>
              <input
                id="bonuses"
                type="number"
                className="w-full input-tag"
              />

              <label htmlFor="netPayable" className="text-sm text-gray-600">
                Net Payable Amount
              </label>
              <input
                id="netPayable"
                type="number"
                className="w-full input-tag"
              />

              {/* <div className="flex justify-end">
                <button className="btn-primary px-4 py-2 bg-blue-600 text-white rounded-md">
                  Save Payout
                </button>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payout;
