import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
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
import CreateServiceList from "./CreateServiceList";

const ServicesList = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const navigate = useNavigate();
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
      setTotalPages(Math.ceil(fetchedServices.length / 10));
      setPaginationData(fetchedServices.slice(0, 10));

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
  useEffect(() => {
    setPaginationData(services.slice(currentPage * 10, currentPage * 10 + 10));
  }, [currentPage, services]);

  return (
    <div className="main-container" style={{ height: "92vh" }}>
      <div className="text-2xl font-bold pb-3 flex items-center space-x-3">
        {userDetails.selectedDashboard === "staff" && (
          <AiOutlineHome
            size={24}
            onClick={() => {
              navigate("/staff");
            }}
          />
        )}
        <div>Subscriptions Plans </div>
      </div>
      <div className="container">
        <div className="flex justify-between items-center px-5">
          <h1 className="text-2xl font-bold">Plan List</h1>
          <button
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
            onClick={() => setIsSideBarOpen(true)}
          >
            + Create Plan
          </button>
        </div>
        {loading ? (
          <div className="text-center" style={{ height: "62hv" }}>
            Loading plan...
          </div>
        ) : (
          <div className="overflow-hidden" style={{ minHeight: "80vh" }}>
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
                {paginationData.length > 0 ? (
                  paginationData.map((service) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="h-96 text-center py-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={addItem}
                          alt="add Item"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="mb-6">No Service Found</div>
                      <div className="">
                        <button
                          className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                          onClick={() => setIsSideBarOpen(true)}
                        >
                          + Create Service
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
