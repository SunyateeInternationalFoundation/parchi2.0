import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import { db } from "../../firebase";
import {
  deleteCustomerDetails,
  setAllCustomersDetails,
} from "../../store/CustomerSlice";
import CreateCustomer from "./CreateCustomer";

const CustomerList = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const userDetails = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const navigate = useNavigate();
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
      ?.customers;
  const customersDetails = useSelector((state) => state.customers).data;
  const dispatch = useDispatch();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const customersRef = collection(db, "customers");
      const companyRef = doc(db, "companies", companyId);
      const q = query(customersRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const customersData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const { createdAt, companyRef, ...data } = doc.data();

          const amount = await fetchTotalAmount(doc.id);
          return {
            id: doc.id,
            createdAt: JSON.stringify(createdAt),
            companyRef: JSON.stringify(companyRef),
            ...data,
            amount,
          };
        })
      );

      setTotalPages(Math.ceil(customersData.length / 10));
      setPaginationData(customersData.slice(0, 10));
      dispatch(setAllCustomersDetails(customersData));
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  async function fetchTotalAmount(customerId) {
    try {
      const invoiceRef = collection(db, "companies", companyId, "invoices");
      const serviceRef = collection(db, "companies", companyId, "services");
      const customerRef = doc(db, "customers", customerId);
      const expenseRef = collection(db, "companies", companyId, "expenses");
      const invoiceQ = query(
        invoiceRef,
        where("customerDetails.customerRef", "==", customerRef)
      );
      const serviceQ = query(
        serviceRef,
        where("customerDetails.customerRef", "==", customerRef)
      );
      const q = query(
        expenseRef,
        where("toWhom.userRef", "==", customerRef),
        where("transactionType", "==", "income")
      );
      const getExpenseDocs = await getDocs(q);

      let expenseAmount = 0;

      getExpenseDocs.docs.forEach((doc) => {
        const data = doc.data();
        expenseAmount += data.amount;
      });

      const invoiceQuerySnapshot = await getDocs(invoiceQ);
      const serviesQuerySnapshot = await getDocs(serviceQ);
      const customersInvoicesAmount = invoiceQuerySnapshot.docs.reduce(
        (acc, cur) => {
          const { total } = cur.data();
          return (acc += +total);
        },
        0
      );
      const customersServiceAmount = serviesQuerySnapshot.docs.reduce(
        (acc, cur) => {
          const { total } = cur.data();
          return (acc += +total);
        },
        0
      );
      return customersInvoicesAmount + customersServiceAmount + expenseAmount;
    } catch (error) {
      console.log("🚀 ~ fetchInvoiceList ~ error:", error);
    }
    return 0;
  }
  useEffect(() => {
    if (companyId) {
      fetchCustomers();
    }
  }, [companyId]);

  useEffect(() => {
    const filteredCustomers = customersDetails.filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    setPaginationData(
      filteredCustomers.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, customersDetails, searchQuery]);

  const navigator = useNavigate();

  function viewCustomer(customerId) {
    navigator(customerId);
  }

  async function onHandleDeleteCustomer(customerId, name) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Customers?"
      );
      if (!confirmDelete) return;
      const cusRef = doc(db, "customers", customerId);
      await deleteDoc(cusRef);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: cusRef,
        date: serverTimestamp(),
        section: "Customer",
        action: "Delete",
        description: `${name} customer removed`,
      });
      dispatch(deleteCustomerDetails(customerId));
    } catch (error) {
      console.log("🚀 ~ onHandleDeleteCustomer ~ error:", error);
    }
  }

  return (
    <div className="main-container" style={{ height: "94vh" }}>
      <div className="text-2xl font-bold flex items-center space-x-3  mt-8">
        {userDetails.selectedDashboard === "staff" && (
          <AiOutlineHome
            size={24}
            onClick={() => {
              navigate("/staff");
            }}
          />
        )}
        <div>Customer</div>
      </div>
      <div className="flex justify-center items-center">
        <div className="container2">
          <nav className="flex pb-3 px-5">
            <div className="space-x-4 w-full">
              <div
                className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
              >
                <input
                  type="text"
                  placeholder="Search by customer #..."
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
                  + New Customer
                </button>
              )}
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading customers...</div>
          ) : (
            <div style={{ height: "94vh" }}>
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
                    paginationData.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                        onClick={() => viewCustomer(customer.id)}
                      >
                        <td className="px-5 py-3 font-bold">
                          <div className="flex items-center space-x-3">
                            {customer.profileImage ? (
                              <img
                                src={customer.profileImage}
                                alt="Profile"
                                className="mt-2 w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                                {customer.name.charAt(0)}
                              </span>
                            )}
                            <div>
                              <div className="text-gray-800 font-semibold">
                                {customer.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3 font-bold  text-center">
                          {customer.phone || "N/A"}
                        </td>

                        <td className="px-5 py-3 text-start">
                          {customer.email || ""}
                        </td>

                        <td className="px-5 py-3 text-center">
                          {customer?.amount?.toFixed(2) || ""}
                        </td>
                        <td
                          className="px-5 py-3 text-start"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className="text-red-500 flex items-center justify-center"
                            onClick={() =>
                              onHandleDeleteCustomer(customer.id, customer.name)
                            }
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
                        <div className="mb-6">No customers Found</div>
                        <div className="">
                          <button
                            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                            onClick={() => setIsModalOpen(true)}
                          >
                            + Create customers
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
          <CreateCustomer
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCustomer(null);
            }}
            refresh={fetchCustomers}
            customerData={selectedCustomer}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
