import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { LiaTrashAltSolid } from "react-icons/lia";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../../../constants/FormatTimestamp";
import { db } from "../../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../UI/select";
import PaymentSidebar from "./PaymentSidebar";

const Payment = ({ projectDetails }) => {
  const { id } = useParams();
  const [filterUser, setFilterUser] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
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
    updateData: {},
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
      const projectRef = doc(db, "projects", id);
      const q = query(expensesRef, where("projectRef", "==", projectRef));
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  async function onDeleteExpense(expenseId) {
    try {
      if (!window.confirm("Are you sure you want to delete this expense?"))
        return;
      await deleteDoc(doc(db, "companies", companyId, "expenses", expenseId));
      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
    } catch (error) {
      console.log("🚀 ~ onDeleteExpense ~ error:", error);
    }
  }
  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className=" mt-4 py-3">
        <div className="grid grid-cols-4 gap-8 ">
          <div className="rounded-lg p-5 bg-white shadow  ">
            <div className="text-lg">Income Amount</div>
            <div className="text-3xl text-indigo-600 font-bold p-2">
              ₹ {totalAmounts.income}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Expense Amount</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {" "}
              ₹ {totalAmounts.expense}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Current Amount</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              ₹ {totalAmounts.total}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg">Budget Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {projectDetails?.budget || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="flex items-center  mb-4 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div className="flex items-center space-x-4  border px-5  py-3 rounded-md w-full">
              <input
                type="text"
                placeholder="Search ..."
                className=" w-full focus:outline-none"
                value={searchTerm}
                onChange={handleSearch}
              />
              <IoSearch />
            </div>
            <Select
              defaultValue={"All"}
              onValueChange={(val) => {
                setFilterUser(val);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder=" Select PurchasePriceTaxType" />
              </SelectTrigger>
              <SelectContent className="h-18">
                <SelectItem value="All"> All</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Vendors">Vendors</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <div className=" flex justify-end items-center space-x-4">
              <button
                className="bg-red-500 flex items-center justify-center text-white space-x-2  px-5 py-3 font-semibold rounded-md"
                onClick={() =>
                  setIsModalOpen({
                    isOpen: true,
                    type: "expense",
                  })
                }
              >
                <FaArrowUp />
                <div>Expense</div>
              </button>
              <button
                className="bg-green-700 flex items-center  text-white text-center space-x-2 px-5  py-3 font-semibold rounded-md"
                onClick={() =>
                  setIsModalOpen({
                    isOpen: true,
                    type: "income",
                  })
                }
              >
                <FaArrowDown /> <div>Income</div>
              </button>
            </div>
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6">Loading Expenses...</div>
        ) : (
          <div className="overflow-y-auto" style={{ height: "96vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Type
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Date
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    ToWhom
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                    Amount
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Mode
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Category
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Delete
                  </td>
                </tr>
              </thead>
              <tbody>
                {filterExpensesData.length > 0 ? (
                  filterExpensesData.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() =>
                        setIsModalOpen({
                          isOpen: true,
                          type: expense.transactionType,
                          updateData: expense,
                        })
                      }
                    >
                      <td className="px-8 py-3 text-start w-24">
                        {expense.transactionType === "income" ? (
                          <div className="text-green-500 p-3 bg-sky-100 rounded-lg ">
                            <FaArrowDown />
                          </div>
                        ) : (
                          <div className="text-red-500 p-3 bg-red-100 rounded-lg">
                            <FaArrowUp />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-start">
                        <FormatTimestamp timestamp={expense.date} />
                      </td>
                      <td className="px-5 py-3 text-start">
                        {expense.toWhom.name} <br />
                        <span className="text-gray-500 text-sm">
                          Ph.No {expense.toWhom.phoneNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold">
                        ₹ {expense.amount}
                      </td>
                      <td className="px-5 py-3  text-start">
                        {expense.paymentMode}
                      </td>
                      <td className="px-5 py-3  text-start">
                        {expense.category}
                      </td>
                      <td
                        className="px-5 py-3   text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteExpense(expense.id);
                        }}
                      >
                        <div className=" flex items-center justify-center">
                          <LiaTrashAltSolid className=" text-red-500 text-xl " />
                        </div>
                      </td>
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
      <PaymentSidebar
        isModalOpen={isModalOpen}
        userDataSet={userDataSet}
        onClose={() => {
          setIsModalOpen({
            isOpen: false,
            type: "",
            updateData: {},
          });
        }}
        refresh={fetchExpenses}
      />
    </div>
  );
};

export default Payment;
