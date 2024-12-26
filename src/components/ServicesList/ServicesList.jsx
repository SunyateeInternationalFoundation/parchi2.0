import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import CreateServiceList from "./CreateServiceList";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";

const ServicesList = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchServices = async () => {
    try {
      setLoading(true);
      const companyRef = doc(db, "companies", companyDetails.companyId);
      const q = query(
        collection(db, "services"),
        where("companyRef", "==", companyRef)
      );
      const querySnapshot = await getDocs(q);
      const fetchedServices = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(fetchedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsSideBarOpen(true);
  };

  async function onHandleDeleteService(serviceId) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Service?"
      );
      if (!confirmDelete) return;
      await deleteDoc(doc(db, "services", serviceId));
      setServices((val) => val.filter((ele) => ele.id !== serviceId));
    } catch (error) {
      console.log("🚀 ~ onHandleDeleteService ~ error:", error);
    }
  }
  return (
    <div className="p-4 overflow-y-auto" style={{ height: "92vh" }}>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Services List</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setIsSideBarOpen(true)}
        >
          + Create Service
        </button>
      </div>
      <CreateServiceList
        isOpen={isSideBarOpen}
        onClose={() => {
          setIsSideBarOpen(false);
          setSelectedService(null);
        }}
        refresh={fetchServices}
        service={selectedService}
      />
      {loading ? (
        <p>Loading services...</p>
      ) : services.length > 0 ? (
        <div
          className="overflow-y-auto bg-white shadow rounded-lg"
          style={{ height: "70vh" }}
        >
          <table className="min-w-full border border-gray-200">
            <thead className="sticky z-10 bg-white" style={{ top: "0" }}>
              <tr className="bg-gray-100 border-b">
                <th scope="col" className="py-3 px-6 text-left font-semibold">
                  Service Name
                </th>
                <th scope="col" className="py-3 px-6 text-left font-semibold">
                  Description
                </th>
                <th scope="col" className="py-3 px-6 text-left font-semibold">
                  Price
                </th>
                <th scope="col" className="py-3 px-6 text-left font-semibold">
                  Discount
                </th>
                <th scope="col" className="py-3 px-6 text-left font-semibold">
                  Tax
                </th>
                <th className="py-3 px-6 text-center font-semibold ">Delete</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-gray-200">
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-blue-100 border-b cursor-pointer"
                  onClick={() => handleEditService(service)}
                >
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {service.serviceName}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {service.description}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    ₹{service.pricing.sellingPrice.amount}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {service.pricing.discount.amount}
                    {service.pricing.discount.type == "Percentage" ? "%" : "/-"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {service.pricing.gstTax}%
                  </td>
                  <td
                    className="py-3 px-6"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div
                      className="text-red-500 flex items-center justify-center"
                      onClick={() => onHandleDeleteService(service.id)}
                    >
                      <RiDeleteBin6Line />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No services found.</p>
      )}
    </div>
  );
};

export default ServicesList;
