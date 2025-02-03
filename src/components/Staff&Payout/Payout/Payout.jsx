import { IoSearch } from "react-icons/io5";
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";


function Payout() {

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
    </div>
  );
}

export default Payout;
