import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import { db } from "../../firebase";
import CreateVendor from "./CreateVendor";

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const userDetails = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

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
      ?.vendors;

  const fetchVendors = async () => {
    setLoading(true);
    const companyRef = doc(db, "companies", companyId);
    try {
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const vendorsData = Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const amount = await fetchTotalAmount(doc.id);
          return {
            id: doc.id,
            ...doc.data(),
            amount,
          };
        })
      );

      setVendors(await vendorsData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  async function fetchTotalAmount(vendorId) {
    try {
      const poRef = collection(db, "companies", companyId, "po");
      const vendorRef = doc(db, "vendors", vendorId);
      const poQ = query(
        poRef,
        where("vendorDetails.vendorRef", "==", vendorRef)
      );

      const poQuerySnapshot = await getDocs(poQ);
      const vendorsPosAmount = poQuerySnapshot.docs.reduce((acc, cur) => {
        const { total } = cur.data();
        return (acc += +total);
      }, 0);
      const expenseRef = collection(db, "companies", companyId, "expenses");
      const q = query(
        expenseRef,
        where("toWhom.userRef", "==", vendorRef),
        where("transactionType", "==", "income")
      );
      const getExpenseDocs = await getDocs(q);

      let expenseAmount = 0;

      getExpenseDocs.docs.forEach((doc) => {
        const data = doc.data();
        expenseAmount += data.amount;
      });

      return vendorsPosAmount + expenseAmount;
    } catch (error) {
      console.log("🚀 ~ fetchInvoiceList ~ error:", error);
    }
    return 0;
  }
  useEffect(() => {
    if (companyId) {
      fetchVendors();
    }
  }, [companyId]);

  const navigator = useNavigate();
  function viewVendor(vendorId) {
    navigator(vendorId);
  }

  async function onHandleDeleteVendor(vendorId) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Vendor?"
      );
      if (!confirmDelete) return;
      await deleteDoc(doc(db, "vendors", vendorId));
      setVendors((val) => val.filter((ele) => ele.id !== vendorId));
    } catch (error) {
      console.log("🚀 ~ onHandleDeleteVendor ~ error:", error);
    }
  }

  useEffect(() => {
    const filteredVendors = vendors.filter((vendor) =>
      `${vendor.name} ${vendor.phone} ${vendor.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    setPaginationData(
      filteredVendors.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, vendors, searchQuery]);
  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <h1 className="text-2xl font-bold mt-4 py-3">Vendor</h1>
      <div className="container">
        <nav className="flex pb-3 px-5">
          <div className="space-x-4 w-full">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
            >
              <input
                type="text"
                placeholder="Search by vendor #..."
                className=" w-full focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IoSearch />
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <button
                className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                onClick={() => setIsModalOpen(true)}
              >
                + New Vendor
              </button>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6">Loading vendors...</div>
        ) : (
          <div style={{ height: "92vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Name
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Contact Info
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Email Id
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold  text-center">
                    Amount
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center ">
                    Delete
                  </td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() => viewVendor(vendor.id)}
                    >
                      <td className="px-5 py-3 font-bold">
                        <div className="flex items-center space-x-3">
                          {vendor.profileImage ? (
                            <img
                              src={vendor.profileImage}
                              alt="Profile"
                              className="mt-2 w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                              {vendor.name.charAt(0)}
                            </span>
                          )}
                          <div>
                            <div className="text-gray-800 font-semibold">
                              {vendor.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 font-bold  text-center">
                        {vendor.phone || "N/A"}
                      </td>

                      <td className="px-5 py-3 text-start">
                        {vendor.email || ""}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {vendor?.amount?.toFixed(2) || ""}
                      </td>
                      <td
                        className="px-5 py-3 text-start"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div
                          className="text-red-500 flex items-center justify-center"
                          onClick={() => onHandleDeleteVendor(vendor.id)}
                        >
                          <RiDeleteBin6Line />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="h-96 text-center py-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={addItem}
                          alt="add Item"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="mb-6">No vendors Found</div>
                      <div className="">
                        <button
                          className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                          onClick={() => setIsModalOpen(true)}
                        >
                          + Create vendors
                        </button>
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
        <CreateVendor
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVendor(null);
          }}
          onVendorAdded={fetchVendors}
          vendorData={selectedVendor}
        />
      </div>
    </div>
  );
};

export default VendorList;
