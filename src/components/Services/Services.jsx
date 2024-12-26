import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line, RiEditFill } from "react-icons/ri";

function Services({ companyDetails, isStaff }) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userDetails = useSelector((state) => state.users);
  const navigator = useNavigate();
  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }

  const filteredServices = services.filter((service) => {
    const { customerDetails, status, serviceNo } = service;
    const customerName = customerDetails?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerDetails?.phoneNumber
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "All" || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const getData = await getDocs(
          collection(db, "companies", companyId, "services")
        );

        const serviceData = getData.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: DateFormate(data.date),
          };
        });
        setServices(serviceData);
      } catch (err) {
        console.log("🚀 ~ fetchServices ~ err:", err);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  async function onUpdateStatus(id, newStatus) {
    try {
      const serviceDoc = doc(db, "companies", companyId, "services", id);
      await updateDoc(serviceDoc, { status: newStatus });
      setServices((pre) =>
        pre.map((service) =>
          service.id === id ? { ...service, status: newStatus } : service
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }
  const onDeleteService = async (id) => {
    try {
      if (!id) {
        return;
      }

      const ServiceDocRef = doc(db, "companies", companyId, "services", id);

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this service?"
      );
      if (!confirmDelete) return;
      await deleteDoc(ServiceDocRef);

      setServices((val) => val.filter((ele) => ele.id !== id));
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete the service. Check the console for details.");
    }
  };
  return (
    <div>
      <div className="w-full">
        <div
          className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
          style={{ width: "100%", height: "92vh" }}
        >
          <header className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">Services</h1>
            <Link
              className="bg-blue-500 text-white py-1 px-2 rounded"
              to="create-service"
            >
              + Create Service
            </Link>
          </header>

          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <nav className="flex space-x-4 mb-4">
              <button
                onClick={() => setFilterStatus("All")}
                className={`font-semibold ${
                  filterStatus === "All" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setFilterStatus("Active")}
                className={`${
                  filterStatus === "Active"
                    ? "text-blue-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("InActive")}
                className={`${
                  filterStatus === "InActive"
                    ? "text-blue-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                InActive
              </button>
            </nav>
            <div className="flex items-center space-x-4 mb-4 border p-2 rounded">
              <input
                type="text"
                placeholder="Search by, customer name, phone number, service number#..."
                className=" w-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearch />
            </div>

            {loading ? (
              <div className="text-center py-6">Loading Services...</div>
            ) : (
              <div className="h-96 overflow-y-auto">
                <table className="w-full border-collapse text-center h-2/4 ">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <th className="p-4">Customers</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Service No</th>
                      <th className="p-4">Date (mm/dd/yyyy)</th>
                      <th className="p-4">Due Date (mm/dd/yyyy)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <tr key={service.id} className="border-b">
                          <td className="p-4">
                            {service.customerDetails.name}
                          </td>
                          <td className="p-4">
                            {service.customerDetails.phoneNumber}
                          </td>
                          <td className="p-4">{service.total.toFixed(2)}</td>
                          <td className="p-4">{service.serviceNo}</td>
                          <td className="p-4">
                            {service.membershipStartDate &&
                              service.membershipStartDate
                                .toDate()
                                .toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            {service.membershipEndDate &&
                              service.membershipEndDate
                                .toDate()
                                .toLocaleDateString()}
                          </td>
                          <td className="p-4 space-x-4">
                            <select
                              defaultValue={service.status}
                              className={`border p-1 rounded ${
                                service.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                              onChange={(e) => {
                                onUpdateStatus(service.id, e.target.value);
                              }}
                            >
                              <option value="Active">Active</option>
                              <option value="InActive">InActive</option>
                            </select>
                          </td>
                          <td className="py-3 space-x-2">
                            <button
                              className="relative group text-green-500 hover:text-green-700 text-xl"
                              onClick={() => {
                                navigator(service.id + "/edit-service");
                              }}
                            >
                              <RiEditFill />
                              <div className="absolute left-1/2 transform -translate-x-1/2 top-5 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                                Edit
                              </div>
                            </button>
                            <button
                              className="relative group text-red-500 hover:text-red-700 text-xl"
                              onClick={() => {
                                onDeleteService(service.id);
                              }}
                            >
                              <RiDeleteBin6Line />

                              <div className="absolute left-1/2 transform -translate-x-1/2 top-5 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                                Delete
                              </div>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No services found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
