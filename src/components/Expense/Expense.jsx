import React, { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaFilter } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { Link, useParams } from "react-router-dom";
import ExpenseSidebar from "./ExpenseSidebar";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import { AiOutlineArrowLeft } from "react-icons/ai";

function Expense() {
  const { id } = useParams();
  const [filter, setFilter] = useState("All");
  const [filterUser, setFilterUser] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [expenses, setExpenses] = useState([]);
  const [totalAmounts, setTotalAmounts] = useState({
    total: 0,
    income: 0,
    expense: 0,
  });
  const [loading, setLoading] = useState(!true);

  const [isModalOpen, setIsModalOpen] = useState({
    isOpen: false,
    type: "",
  });

  const [userDataSet, setUserDataset] = useState({
    customers: [],
    vendors: [],
    staff: [],
  });

  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  async function fetchExpenses() {
    setLoading(true);
    try {
      const expensesRef = collection(db, "companies", companyId, "expenses");
      const bookRef = doc(db, "companies", companyId, "books", id);
      const q = query(expensesRef, where("bookRef", "==", bookRef));
      const querySnapshot = await getDocs(q);
      const totalAmountData = {
        total: 0,
        income: 0,
        expense: 0,
      };
      const expensesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.transactionType === "income") {
          totalAmountData.income += +data.amount;
          totalAmountData.total += +data.amount;
        } else {
          totalAmountData.expense += +data.amount;
          totalAmountData.total -= +data.amount;
        }
        return {
          id: doc.id,
          ...data,
        };
      });
      setTotalAmounts(totalAmountData);

      setExpenses(expensesData);
    } catch (error) {
      console.log("🚀 ~ fetchExpenses ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetch_Cus_Vend_Staff_data = async (collectionName) => {
      setLoading(true);
      try {
        const ref = collection(db, collectionName);

        const companyRef = doc(db, "companies", companyId);
        const q = query(ref, where("companyRef", "==", companyRef));

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserDataset((val) => ({ ...val, [collectionName]: data }));
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
    fetch_Cus_Vend_Staff_data("staff");
    fetch_Cus_Vend_Staff_data("vendors");
    fetch_Cus_Vend_Staff_data("customers");
  }, []);

  const filterExpensesData = expenses.filter((expense) => {
    const { toWhom } = expense;

    const userTypeLower = toWhom.userType.toLowerCase();
    const filterUserLower = filterUser.toLowerCase();

    const matchesSearch = toWhom.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterUser === "All" || userTypeLower === filterUserLower;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
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
          <div className="flex space-x-3">
            <Link
              className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
              to={"./../"}
            >
              <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
            </Link>{" "}
            <h1 className="text-2xl font-bold">Expenses</h1>
          </div>
          <div className="space-x-4">
            <button
              className="bg-red-500 text-white py-1 px-3 rounded"
              onClick={() =>
                setIsModalOpen({
                  isOpen: true,
                  type: "expense",
                })
              }
            >
              - Expense
            </button>
            <button
              className="bg-green-700 text-white py-1 px-3 rounded"
              onClick={() =>
                setIsModalOpen({
                  isOpen: true,
                  type: "income",
                })
              }
            >
              + Income
            </button>
          </div>
        </header>
        <div className=" bg-white shadow rounded-lg mt-4">
          <div className="px-4 py-2">
            <div className="flex justify-between mb-2">
              <div className="flex justify-around text-gray-600">
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "All" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("All")}
                >
                  All
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Today" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Today")}
                >
                  Today
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Week" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Week")}
                >
                  Week
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Month" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Month")}
                >
                  Month
                </button>
              </div>
              <FaFilter />
            </div>
            <div className="flex justify-between items-center">
              <div className="">
                <div className="flex items-center ">
                  <div className="text-green-500 p-3 bg-sky-100 rounded-lg">
                    <FaArrowDown />
                  </div>
                  <span className="font-bold ml-5">Income</span>
                </div>
                <div className="font-bold">{totalAmounts.income}</div>
              </div>
              <div className="">
                <div className="flex items-center ">
                  <span className=" font-bold mr-5">Expense</span>
                  <div className="text-red-500 p-3 bg-red-200 rounded-lg">
                    <FaArrowUp />
                  </div>
                </div>
                <div className="text-end font-bold">{totalAmounts.expense}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between bg-green-500  text-center p-2 rounded-b-lg">
            <div>Balance</div>
            <div className="font-bold">{totalAmounts.total}</div>
          </div>
        </div>
        <div className="bg-white py-2 px-4  my-3 rounded-lg shadow mb-4">
          <div className="flex  mb-2 text-gray-600">
            <button
              className={
                "px-4 py-1" +
                (filterUser === "All" ? " bg-gray-300 rounded-full" : "")
              }
              onClick={() => setFilterUser("All")}
            >
              All
            </button>
            <button
              className={
                "px-4 py-1" +
                (filterUser === "Customer" ? " bg-gray-300 rounded-full" : "")
              }
              onClick={() => setFilterUser("Customer")}
            >
              Customers
            </button>
            <button
              className={
                "px-4 py-1" +
                (filterUser === "Vendor" ? " bg-gray-300 rounded-full" : "")
              }
              onClick={() => setFilterUser("Vendor")}
            >
              Vendors
            </button>
            <button
              className={
                "px-4 py-1" +
                (filterUser === "Staff" ? " bg-gray-300 rounded-full" : "")
              }
              onClick={() => setFilterUser("Staff")}
            >
              Staff
            </button>
          </div>
          <div className="flex  items-center space-x-4 mb-4 border p-2 rounded">
            <input
              type="text"
              placeholder="Search..."
              className=" w-full focus:outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
            <IoSearch />
          </div>
          <div className="overflow-y-auto" style={{ height: "44vh" }}>
            {loading ? (
              <div className="text-center py-6">Loading Expense...</div>
            ) : filterExpensesData.length > 0 ? (
              filterExpensesData.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white-100 text-gray-800  border my-3 rounded-lg p-4 flex justify-between items-center shadow-lg hover:bg-blue-200 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    {expense.transactionType === "income" ? (
                      <div className="text-green-500 p-3 bg-sky-100 rounded-lg">
                        <FaArrowDown />
                      </div>
                    ) : (
                      <div className="text-red-500 p-3 bg-red-100 rounded-lg">
                        <FaArrowUp />
                      </div>
                    )}
                    <div>
                      <div>{expense.toWhom?.name}</div>
                      <div>Created at: {DateFormate(expense.date)}</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div>₹ {expense.amount}</div>
                    <div>
                      category:{" "}
                      <span className="font-bold">{expense.categoryType}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-20 overflow-y-auto">
                <div className="text-center py-4">No Expense found</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ExpenseSidebar
        isModalOpen={isModalOpen}
        userDataSet={userDataSet}
        onClose={() => {
          setIsModalOpen({
            isOpen: false,
            type: "",
          });
        }}
        refresh={fetchExpenses}
      />
    </div>
  );
}

export default Expense;
