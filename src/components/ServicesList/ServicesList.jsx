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
    <div className="main-container" style={{ height: "92vh" }}>
      <div className="container">
        <div className="flex justify-between items-center px-5">
          <h1 className="text-2xl font-bold">Services List</h1>
          <button
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
            onClick={() => setIsSideBarOpen(true)}
          >
            + Create Service
          </button>
        </div>
        {loading ? (
          <p>Loading services...</p>
        ) : services.length > 0 ? (
          <div className="overflow-y-auto" style={{ height: "72vh" }}>
            <table className="w-full ">
              <thead className="sticky z-10" style={{ top: "0" }}>
                <tr className="border-b">
                  <th className="px-8 py-1 text-gray-400  text-left font-semibold">
                    Service Name
                  </th>
                  <th className="px-5 py-1 text-gray-400  text-left font-semibold">
                    Description
                  </th>
                  <th className="px-5 py-1 text-gray-400  text-center font-semibold">
                    Price
                  </th>
                  <th className="px-5 py-1 text-gray-400  text-center font-semibold">
                    Discount
                  </th>
                  <th className="px-5 py-1 text-gray-400  text-center font-semibold">
                    Tax
                  </th>
                  <th className="px-8 py-1 text-gray-400  text-end font-semibold ">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-blue-100 border-b cursor-pointer"
                    onClick={() => handleEditService(service)}
                  >
                    <td className="px-8 py-3">{service.serviceName}</td>
                    <td className="px-5 py-3">{service.description}</td>
                    <td className="px-5 py-3 text-center">
                      ₹{service.sellingPrice}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {service.discount}
                      {service.discountType === "Percentage" ? "%" : "/-"}
                    </td>
                    <td className="px-5 py-3 text-center">{service.tax}%</td>
                    <td
                      className="py-3 px-12 text-end"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        className="text-red-500"
                        onClick={() => onHandleDeleteService(service.id)}
                      >
                        <RiDeleteBin6Line />
                      </button>
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
      <CreateServiceList
        isOpen={isSideBarOpen}
        onClose={() => {
          setIsSideBarOpen(false);
          setSelectedService(null);
        }}
        refresh={fetchServices}
        service={selectedService}
      />
    </div>
  );
};

export default ServicesList;
