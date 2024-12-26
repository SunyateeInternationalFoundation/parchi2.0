import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import { FaSearch, FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateVendor from "./CreateVendor";

const VendorList = ({ companyDetails, isStaff }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }

  const fetchVendors = async () => {
    setLoading(true);
    const companyRef = doc(db, "companies", companyId);
    try {
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const vendorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVendors(vendorsData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (companyId) {
      fetchVendors();
    }
  }, [companyId]);

  const filteredVendors = vendors.filter((vendor) =>
    `${vendor.name} ${vendor.phone} ${vendor.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (vendor) => {
    setSelectedVendor(vendor); // Set the selected customer
    setIsModalOpen(true); // Open the modal
  };
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
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Vendors</h2>
        <div className="flex items-center justify-between">
          <div className="flex-grow mx-4 w-80 m-2 relative">
            <input
              type="text"
              placeholder="Search vendors by name, phone, etc.."
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
            className="bg-blue-500 text-white px-4 py-1 rounded-md ml-4"
            onClick={() => setIsModalOpen(true)}
          >
            + New Vendor
          </button>
        </div>
      </div>

      <div
        className="overflow-y-auto bg-white shadow rounded-lg"
        style={{ height: "70vh" }}
      >
        <table className="min-w-full border border-gray-200">
          <thead className="sticky z-10 bg-white p-0" style={{ top: "-1px" }}>
            <tr className="bg-gray-200 border-b">
              <th className="py-3 px-6 text-left font-semibold text-gray-600">
                Name
              </th>
              <th className="py-3 px-6 text-left font-semibold text-gray-600">
                Contact Info
              </th>
              <th className="py-3 px-6 text-left font-semibold text-gray-600">
                Email
              </th>
              {/* <th className="py-3 px-6 text-left font-semibold text-gray-600">
                Closing Balance
              </th> */}
              <th className="py-3 px-6 text-center font-semibold text-gray-600 ">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-blue-100 border-b cursor-pointer"
                  onClick={() => viewVendor(vendor.id)}
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-3">
                      {vendor.profileImage ? (
                        <img
                          src={vendor.profileImage}
                          alt="Profile"
                          className="mt-2 w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <>
                          <span className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                            {vendor.name.charAt(0)}
                          </span>
                        </>
                      )}

                      <div>
                        <div className="text-gray-800 font-semibold">
                          {vendor.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-6">{vendor.phone || "N/A"}</td>
                  <td className="py-3 px-6">{vendor.email || "N/A"}</td>

                  {/* <td className="py-3 px-6">
                    <div className="text-red-500 font-semibold">
                      ₹{" "}
                      {vendor.closingBalance
                        ? vendor.closingBalance.toFixed(2)
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
                      onClick={() => onHandleDeleteVendor(vendor.id)}
                    >
                      <RiDeleteBin6Line />
                    </div>
                  </td>

                  {/* <td className="py-3 px-6">
                    <div className="text-gray-500 text-sm">
                      <button
                        className="relative group text-xl text-green-500 hover:text-green-700"
                        onClick={() => handleEditClick(vendor)}
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
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  );
};

export default VendorList;
