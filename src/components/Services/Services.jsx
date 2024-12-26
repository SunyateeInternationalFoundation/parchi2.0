import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";

function Services({ companyDetails }) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userDetails = useSelector((state) => state.users);
  const navigate = useNavigate();
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

  const totalAmount = filteredServices.reduce(
    (sum, invoice) => sum + invoice.total,
    0
  );

  const paidAmount = filteredServices
    .filter((service) => service.status === "Paid")
    .reduce((sum, service) => sum + service.total, 0);
  const pendingAmount = filteredServices
    .filter((service) => service.status === "Pending")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 h-48">
          <h1 className="text-2xl font-bold py-3 px-10 ">Service Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-indigo-600 font-bold">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg"> Paid Amount</div>
              <div className="text-3xl text-emerald-600 font-bold">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg"> Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg"> UnPaid Amount</div>
              <div className="text-3xl text-red-600 font-bold">
                ₹ {totalAmount - paidAmount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  py-8 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by service #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All</option>
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              <Link
                className="bg-blue-500 text-white py-2 px-2 rounded-lg"
                to="create-service"
              >
                + Create Service
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading services...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Service No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Customer
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold  text-center">
                        Amount
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-center ">
                        Status
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Mode
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Created By
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <tr
                          key={service.id}
                          className="border-b border-gray-200 text-center cursor-pointer  text-start"
                          onClick={() => {
                            navigate(service.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">
                            {service.serviceNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {service.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {service.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              service.date.seconds * 1000 +
                                service.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold  text-center">{`₹ ${service.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                service.status === "Active"
                                  ? "bg-green-100 "
                                  : "bg-red-100"
                              }`}
                            >
                              <select
                                value={service.status}
                                className={
                                  service.status === "Active"
                                    ? "bg-green-100 "
                                    : "bg-red-100"
                                }
                                onChange={(e) => {
                                  onUpdateStatus(service.id, e.target.value);
                                }}
                              >
                                <option value="Active">Active</option>
                                <option value="InActive">InActive</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {service.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {service?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No services found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
                <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
                  0 of 10 row(s) selected.
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronsLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronRight className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
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
}
Services.propTypes = {
  companyDetails: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
};

export default Services;