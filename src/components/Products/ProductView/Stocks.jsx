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
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { LiaTrashAltSolid } from "react-icons/lia";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";
import StockSidebar from "./StockSidebar";

const Stocks = ({ projectDetails }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filterUser, setFilterUser] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [totalAmounts, setTotalAmounts] = useState({
    total: 0,
    income: 0,
    stock: 0,
  });
  const [loading, setLoading] = useState(true); // Set to true initially
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
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

  async function fetchStocks() {
    setLoading(true);
    try {
      const stocksRef = collection(db, "companies", companyId, "stocks");
      const projectRef = doc(db, "projects", id);
      const q = query(stocksRef, where("projectRef", "==", projectRef));
      const querySnapshot = await getDocs(q);
      const totalAmountData = {
        total: 0,
        income: 0,
        stock: 0,
      };
      const stocksData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.transactionType === "income") {
          totalAmountData.income += +data.amount;
          totalAmountData.total += +data.amount;
        } else {
          totalAmountData.stock += +data.amount;
          totalAmountData.total -= +data.amount;
        }
        return {
          id: doc.id,
          ...data,
        };
      });
      setTotalAmounts(totalAmountData);

      setStocks(stocksData);
    } catch (error) {
      console.log("🚀 ~ fetchStocks ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchVendorData = async (collectionName) => {
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
  useEffect(() => {
    // fetchStocks();
    fetchVendorData("vendors");
  }, []);

  useEffect(() => {
    const filterStocksData = stocks.filter((stock) => {
      const { toWhom } = stock;

      const userTypeLower = toWhom.userType.toLowerCase();
      const filterUserLower = filterUser.toLowerCase();

      const matchesSearch = toWhom.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterUser === "All" || userTypeLower === filterUserLower;

      return matchesSearch && matchesStatus;
    });

    setTotalPages(Math.ceil(filterStocksData.length / 10));
    setPaginationData(
      filterStocksData.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, stocks, searchTerm, filterUser]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  async function onDeleteStock(stockId) {
    try {
      if (!window.confirm("Are you sure you want to delete this stock?"))
        return;
      await deleteDoc(doc(db, "companies", companyId, "stocks", stockId));
      setStocks((prev) => prev.filter((stock) => stock.id !== stockId));
    } catch (error) {
      console.log("🚀 ~ onDeleteStock ~ error:", error);
    }
  }
  return (
    <div className="main-container" style={{ height: "82vh" }}>
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
          </div>
          <div className="w-full">
            <div className=" flex justify-end items-center space-x-4">
              <button
                className="bg-green-500 flex items-center justify-center text-white space-x-2  px-5 py-3 font-semibold rounded-md"
                onClick={() =>
                  setIsModalOpen({
                    isOpen: true,
                    type: "stock In",
                  })
                }
              >
                <FiPlusCircle />
                <div>Stock In</div>
              </button>
              <button
                className="bg-red-700 flex items-center  text-white text-center space-x-2 px-5  py-3 font-semibold rounded-md"
                onClick={() =>
                  setIsModalOpen({
                    isOpen: true,
                    type: "stock Out",
                  })
                }
              >
                <FiMinusCircle /> <div>Stock Out</div>
              </button>
            </div>
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6">Loading Stocks...</div>
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
                    Quantity
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                    Selling Price
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Purchase Price
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    remarks
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Delete
                  </td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? ( // Use paginationData for rendering
                  paginationData.map((stock) => (
                    <tr
                      key={stock.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() =>
                        setIsModalOpen({
                          isOpen: true,
                          type: stock.transactionType,
                          updateData: stock,
                        })
                      }
                    >
                      <td className="px-8 py-3 text-start w-24">
                        {stock.transactionType === "income" ? (
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
                        <FormatTimestamp timestamp={stock.date} />
                      </td>
                      <td className="px-5 py-3 text-start">
                        {stock.toWhom.name} <br />
                        <span className="text-gray-500 text-sm">
                          Ph.No {stock.toWhom.phoneNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold">₹ {stock.amount}</td>
                      <td className="px-5 py-3  text-start">
                        {stock.paymentMode}
                      </td>
                      <td className="px-5 py-3  text-start">
                        {stock.category}
                      </td>
                      <td
                        className="px-5 py-3   text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStock(stock.id);
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
                    <td colSpan="7" className="h-24 text-center py-4">
                      No Stocks Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage + 1} of {totalPages || 1} row(s) selected.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage(0)}
                disabled={currentPage <= 0}
              >
                <div className="flex justify-center">
                  <LuChevronsLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage((val) => val - 1)}
                disabled={currentPage <= 0}
              >
                <div className="flex justify-center">
                  <LuChevronLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage((val) => val + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                <div className="flex justify-center">
                  <LuChevronRight className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                <div className="flex justify-center">
                  <LuChevronsRight />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <StockSidebar
        isModalOpen={isModalOpen}
        userDataSet={userDataSet}
        onClose={() => {
          setIsModalOpen({
            isOpen: false,
            type: "",
            updateData: {},
          });
        }}
        refresh={fetchStocks}
      />
    </div>
  );
};

export default Stocks;
