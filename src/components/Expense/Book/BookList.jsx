import React, { useEffect } from "react";
import { useState } from "react";
import CreateBookSidebar from "./CreateBookSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
          date: DateFormate(data.createdAt),
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

  function DateFormate(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Book/Accounts</h1>
          <button
            className="bg-blue-500 text-white py-1 px-2 rounded"
            onClick={() => setIsSidebarOpen(true)}
          >
            + Create Book/Account
          </button>
        </header>
        <div className="pb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-4  overflow-y-auto" style={{ height: "74vh" }}>
          {loading ? (
            <div className="w-full text-center">Loading...</div>
          ) : books.length > 0 ? (
            books.map((book) => (
              <div
                key={book.id}
                className="bg-blue-200 text-gray-800 rounded-lg p-4 flex justify-between items-center shadow-md hover:bg-blue-200 transition cursor-pointer"
                onClick={() => navigate(book.id)}
              >
                <div>
                  <h2 className="text-xl font-bold">Balance</h2>
                  <p className="text-lg mt-2">₹ {book.openingBalance}</p>
                  <p className="text-sm mt-1 text-gray-600">
                    Created on {book.date}
                  </p>
                </div>
                <div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    {book.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center">No Book Found</div>
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
