import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";
import addItem from "../../assets/addItem.png";

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const userDetails = useSelector((state) => state.users);

  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.purchase;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const purchaseRef = collection(db, "companies", companyId, "purchases");
        const q = query(purchaseRef, orderBy("purchaseNo", "asc"));
        const querySnapshot = await getDocs(q);
        const purchasesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotalPages(Math.ceil(purchasesData.length / 10));
        setPaginationData(purchasesData.slice(0, 10));
        setPurchases(purchasesData);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (purchaseId, newStatus) => {
    try {
      const purchaseDoc = doc(
        db,
        "companies",
        companyId,
        "purchases",
        purchaseId
      );
      await updateDoc(purchaseDoc, { orderStatus: newStatus });
      setPurchases((prevPurchases) =>
        prevPurchases.map((purchase) =>
          purchase.id === purchaseId
            ? { ...purchase, orderStatus: newStatus }
            : purchase
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = purchases.reduce(
    (sum, purchase) => sum + purchase.total,
    0
  );

  const receivedAmount = purchases
    .filter((purchase) => purchase.orderStatus === "Received")
    .reduce((sum, purchase) => sum + purchase.total, 0);
  const pendingAmount = purchases
    .filter((purchase) => purchase.orderStatus === "Pending")
    .reduce((sum, purchase) => sum + purchase.total, 0);
  useEffect(() => {
    const filteredPurchases = purchases.filter((purchase) => {
      const { vendorDetails, purchaseNo, orderStatus } = purchase;
      const VendorName = vendorDetails?.name || "";
      const matchesSearch =
        VendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchaseNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        vendorDetails?.phone
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || orderStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredPurchases.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, purchases, searchTerm, filterStatus]);

  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <div className="mt-4 py-3">
        <h1 className="text-2xl font-bold pb-3  ">Purchase Overview</h1>
        <div className="grid grid-cols-4 gap-8">
          <div className="rounded-lg p-5  bg-white shadow  ">
            <div className="text-lg">Total Amount</div>
            <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold p-2">
              ₹ {totalAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Received Amount</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {" "}
              ₹ {receivedAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Pending Amount</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              ₹ {pendingAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg">Total Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {totalAmount}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="flex items-center mb-4 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
            >
              <input
                type="text"
                placeholder="Search by purchase #..."
                className=" w-full focus:outline-none"
                value={searchTerm}
                onChange={handleSearch}
              />
              <IoSearch />
            </div>
            <div
              className="flex items-center space-x-4  border
      px-5 py-3 rounded-md  "
            >
              <select onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All"> All Transactions</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <Link
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                to="create-purchase"
              >
                + Create Purchase
              </Link>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6" style={{ height: "92vh" }}>
            Loading purchases...
          </div>
        ) : (
          <div style={{ height: "92vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Date
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-semibold text-center">
                    Purchase No
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-semibold text-start">
                    Vendor
                  </td>
                  <td className="px-5 py-3 text-center text-gray-400 font-semibold  ">
                    Amount
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-semibold text-center ">
                    Status
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-semibold text-start ">
                    Mode
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-semibold text-start ">
                    Created By
                  </td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b text-center cursor-pointer text-start"
                      onClick={() => {
                        navigate(purchase.id);
                      }}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={purchase.date} />
                      </td>
                      <td className="px-5 py-3 font-bold text-center">
                        {purchase.prefix || ""}-{purchase.purchaseNo}
                      </td>

                      <td className="px-5 py-3 text-start">
                        {purchase.vendorDetails?.name} <br />
                        <span className="text-gray-500 text-sm">
                          Ph.No {purchase.vendorDetails.phone}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-center">{`₹ ${purchase.total.toFixed(
                        2
                      )}`}</td>
                      <td
                        className="px-5 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className={`px-1 text-center py-2 rounded-lg text-xs  ${
                            purchase.orderStatus !== "Pending"
                              ? "bg-green-200 "
                              : "bg-red-200 "
                          }`}
                        >
                          <select
                            value={purchase.orderStatus}
                            onChange={(e) => {
                              handleStatusChange(purchase.id, e.target.value);
                            }}
                            className={` ${
                              purchase.orderStatus !== "Pending"
                                ? "bg-green-200 "
                                : "bg-red-200 "
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-3">{purchase.mode || "Online"}</td>

                      <td className="px-5 py-3">{purchase?.createdBy?.who}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="h-24 text-center py-4">
                      No found
                    </td>
                    <td colSpan="7" className="h-96 text-center py-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={addItem}
                          alt="add Item"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="mb-6">No purchases Created</div>
                      <div className="">
                        {(userDetails.selectedDashboard === "" ||
                          role?.create) && (
                          <Link
                            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                            to="create-purchase"
                          >
                            + Create purchases
                          </Link>
                        )}
                      </div>
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
    </div>
  );
};

export default Purchase;
