import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  deleteCustomerDetails,
  setAllCustomersDetails,
} from "../../store/CustomerSlice";
import CreateCustomer from "./CreateCustomer";

const CustomerList = ({ companyDetails, isStaff }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  console.log("customercompanyDetails", companyDetails);
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
    console.log("!companyId", companyId);
  } else {
    companyId = companyDetails.id;
    console.log("companyId", companyId);
  }
  const customersDetails = useSelector((state) => state.customers).data;
  const dispatch = useDispatch();

  console.log("🚀 ~ CustomerList ~ customersDetails:", customersDetails);
  const fetchCustomers = async () => {
    if (customersDetails.length !== 0) {
      return;
    }
    setLoading(true);
    try {
      const customersRef = collection(db, "customers");
      const companyRef = doc(db, "companies", companyId);
      const q = query(customersRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const customersData = querySnapshot.docs.map((doc) => {
        const { createdAt, companyRef, ...data } = doc.data();
        return {
          id: doc.id,
          createdAt: JSON.stringify(createdAt),
          companyRef: JSON.stringify(companyRef),
          ...data,
        };
      });
      dispatch(setAllCustomersDetails(customersData));
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCustomers();
    }
  }, [companyId]);

  const filteredCustomers = customersDetails.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const navigator = useNavigate();

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer); // Set the selected customer
    // setIsModalOpen(true); // Open the modal
    navigator(customer.id);
  };

  function viewCustomer(customerId) {
    navigator(customerId);
  }

  async function onHandleDeleteCustomer(customerId) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Customers?"
      );
      if (!confirmDelete) return;
      await deleteDoc(doc(db, "customers", customerId));
      dispatch(deleteCustomerDetails(customerId));
      // setCustomers((val) => val.filter((ele) => ele.id !== customerId));
    } catch (error) {
      console.log("🚀 ~ onHandleDeleteCustomer ~ error:", error);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="flex items-center justify-between">
          <div className="flex-grow mx-4 w-80 m-2 relative">
            <input
              type="text"
              placeholder="Search customers by name, phone, etc.."
              className="w-full h-8 p-2 pl-8 border border-gray-300 rounded-md text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600"
              size={16}
            />
          </div>
          <button
            className="bg-blue-700 text-white px-4 py-1 rounded-md ml-4"
            onClick={() => setIsModalOpen(true)}
          >
            + New Customer
          </button>
        </div>
      </div>

      <div
        className="overflow-y-auto bg-white shadow rounded-lg"
        style={{ height: "70vh" }}
      >
        <table className="min-w-full border border-gray-200">
          <thead className="sticky z-10 bg-white p-0" style={{ top: "-1px" }}>
            <tr className="bg-gray-200  border-b">
              <th className="py-3 px-6 text-left font-semibold ">Name</th>
              <th className="py-3 px-6 text-left font-semibold ">
                Contact Info
              </th>
              <th className="py-3 px-6 text-left font-semibold ">Email Id</th>
              {/* <th className="py-3 px-6 text-left font-semibold ">
                Closing Balance
              </th> */}
              <th className="py-3 px-6 text-center font-semibold ">Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b hover:bg-blue-100 cursor-pointer"
                  onClick={() => viewCustomer(customer.id)}
                >
                  <td className="py-3 px-6">
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

                  <td className="py-3 px-6">{customer.phone || "N/A"}</td>

                  <td className="py-3 px-6">{customer.email || ""}</td>
                  {/* 
                  <td className="py-3 px-6">
                    <div className="text-red-500 font-semibold">
                      ₹{" "}
                      {customer.closingBalance
                        ? customer.closingBalance.toFixed(2)
                        : "0.00"}
                    </div>
                  </td> */}
                  <td
                    className="py-3 px-6"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div
                      className="text-red-500 flex items-center justify-center"
                      onClick={() => onHandleDeleteCustomer(customer.id)}
                    >
                      <RiDeleteBin6Line />
                    </div>
                  </td>
                  {/* <td className="py-3 px-6">
                    <div className="text-gray-500 text-sm">
                      <button
                        className="relative group text-green-500 hover:text-green-700 text-xl"
                        onClick={() => handleEditClick(customer)}
                      >
                        <FaRegEye />
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-5 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                          View
                        </div>
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CreateCustomer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        customerData={selectedCustomer}
      />
    </div>
  );
};

export default CustomerList;
