import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

const VendorPurchase = () => {
  const [loading, setLoading] = useState(false);
  const [companiesId, setCompaniesId] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);
  const userDetails = useSelector((state) => state.users);
  const phone = userDetails.phone;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchVendorCompanies() {
      setLoading(true);
      try {
        const customerRef = collection(db, "vendors");
        const q = query(customerRef, where("phone", "==", phone));
        const getData = await getDocs(q);
        const getCompaniesId = getData.docs.map((doc) => {
          const { name, companyRef } = doc.data();
          return {
            id: doc.id,
            name,
            companyId: companyRef.id,
          };
        });
        setCompaniesId(getCompaniesId);
      } catch (error) {
        console.log("🚀 ~ fetchVendorCompanies ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVendorCompanies();
  }, []);

  useEffect(() => {
    setLoading(true);
    async function fetchPurchase() {
      try {
        const PurchaseList = [];
        const phoneNo = phone.startsWith("+91") ? phone.slice(3) : phone;
        for (const company of companiesId) {
          const purchaseRef = collection(
            db,
            "companies",
            company.companyId,
            "purchases"
          );
          const q = query(
            purchaseRef,
            where("vendorDetails.phone", "==", phoneNo)
          );
          const getData = await getDocs(q);
          const getAllPurchase = getData.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });
          PurchaseList.push(...getAllPurchase);
        }
        setTotalPages(Math.ceil(PurchaseList.length / 10));
        setPaginationData(PurchaseList.slice(0, 10));
        setPurchaseList(PurchaseList);
      } catch (error) {
        console.log("🚀 ~ fetchPurchase ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchase();
  }, [companiesId]);

  useEffect(() => {
    console.log("🚀 ~ filteredPurchase ~ purchase:", purchaseList);
    const filteredPurchase = purchaseList.filter((item) => {
      const { createdBy, purchaseNo, paymentStatus } = item;
      const vendorName = createdBy?.name || "";
      const matchesSearch =
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchaseNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        createdBy?.phoneNo
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredPurchase.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, purchaseList, searchTerm, filterStatus]);
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white pb-8 pt-6 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div
                className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
              >
                <input
                  type="text"
                  placeholder="Search by Purchase #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch />
              </div>
              <div
                className="flex items-center space-x-4  border
      px-5 py-3 rounded-md  "
              >
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading purchase...</div>
          ) : (
            <div className="" style={{ height: "96vh" }}>
              <div className="" style={{ height: "92vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className=" bg-white">
                    <tr className="border-b">
                      <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                        Purchase No
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                        Company
                      </td>

                      <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                        Amount
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-center ">
                        Status
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                        Mode
                      </td>
                      <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
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
                        >
                          <td className="px-8 py-3 text-start">
                            <FormatTimestamp timestamp={purchase.date} />
                          </td>
                          <td className="px-5 py-3 font-bold text-center">
                            {purchase.prefix || ""}- {purchase.purchaseNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {purchase.createdBy?.name} <br />
                            <span className="text-gray-500">
                              Ph.No {purchase.createdBy.phoneNo}
                            </span>
                          </td>

                          <td className="px-5 py-3  text-center">{`₹ ${purchase.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs  ${
                                purchase.paymentStatus !== "Pending"
                                  ? "bg-green-200 "
                                  : "bg-red-200 "
                              }`}
                            >
                              <div
                                className={` ${
                                  purchase.paymentStatus !== "Pending"
                                    ? "bg-green-200 "
                                    : "bg-red-200 "
                                }`}
                              >
                                {purchase.paymentStatus}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {purchase.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {purchase?.createdBy?.who}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No purchase found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                        <LuChevronsRight className="" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPurchase;
