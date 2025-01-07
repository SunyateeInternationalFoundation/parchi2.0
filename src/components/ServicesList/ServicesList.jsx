import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { db } from "../../firebase";
import CreateServiceList from "./CreateServiceList";

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
    <div className="p-5 overflow-y-auto" style={{ height: "92vh" }}>
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center  px-5 py-3">
          <h1 className="text-2xl font-bold">Services List</h1>
          <button
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
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
          <div className="overflow-y-auto bg-white" style={{ height: "74vh" }}>
            <table className="w-full ">
              <thead className="sticky z-10 bg-white" style={{ top: "0" }}>
                <tr className="border-b">
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
                  <th className="py-3 px-6 text-center font-semibold ">
                    Delete
                  </th>
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
                      ₹{service.sellingPrice}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">
                      {service.discount}
                      {service.discountType === "Percentage" ? "%" : "/-"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">
                      {service.tax}%
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
    </div>
  );
};

export default ServicesList;
