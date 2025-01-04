import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";
import CreateBookSidebar from "./CreateBookSidebar";

const BookList = () => {
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [books, setbooks] = useState([]);
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const navigate = useNavigate();
  async function fetchBooks() {
    setLoading(true);
    try {
      const bookRef = collection(db, "companies", companyId, "books");
      const querySnapshot = await getDocs(bookRef);
      const bookData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });
      setbooks(bookData);
    } catch (error) {
      console.log("🚀 ~ fetchBooks ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <header className="mt-4  py-3 flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Book/Accounts</h1>
        </header>

        <div className="bg-white  pb-8 pt-6 rounded-lg shadow my-6">
          <nav className="flex items-center  mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4  border px-5  py-3 rounded-md w-full">
                <input
                  type="text"
                  placeholder="Search ..."
                  className=" w-full focus:outline-none"
                  // value={searchTerm}
                  // onChange={handleSearch}
                />
                <IoSearch />
              </div>
            </div>
            <div className="w-full text-end ">
              <button
                className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                onClick={() => setIsSidebarOpen(true)}
              >
                Create Book/Account
              </button>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading ...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "96vh" }}>
              <table className="w-full border-collapse text-start">
                <thead className=" bg-white">
                  <tr className="border-b">
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                      Book
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                      Opening Balance
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                      Branch
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {books.length > 0 ? (
                    books.map((book) => (
                      <tr
                        key={book.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                        onClick={() => navigate(book.id)}
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={book.createdAt} />
                        </td>
                        <td className="px-5 py-3 text-start">{book.name}</td>
                        <td className="px-5 py-3 font-bold">
                          ₹ {book.openingBalance}
                        </td>
                        <td className="px-5 py-3  text-start">{book.branch}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="h-24 text-center py-4">
                        No Expenses Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {isSidebarOpen && (
          <CreateBookSidebar
            onClose={() => setIsSidebarOpen(false)}
            isOpen={isSidebarOpen}
            refresh={fetchBooks}
          />
        )}
      </div>
    </div>
  );
};

export default BookList;
