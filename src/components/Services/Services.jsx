import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
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
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import DateTimeFormate from "../../constants/DateTimeFormate";
import { db } from "../../firebase";
import Handsontable from "../UI/Handsontable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

function Services() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
      ?.subscription;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const getDataRef = collection(db, "companies", companyId, "services");
        const q = query(getDataRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const serviceData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...DateTimeFormate(data.date),
            serviceNo: data.prefix + "-" + data.serviceNo,
            customerName: data.customerDetails.name,
            customerPhone: data.customerDetails.phone,
            customerId: data.customerDetails.customerRef.id,
            companyPhone: data.createdBy.phoneNo,
            companyName: data.createdBy.name,
            total: data.total,
            status: data.status,
            mode: data.mode,
            createdBy: data.createdBy.who,
            startDate: DateTimeFormate(data.membershipStartDate),
            expireDate: DateTimeFormate(data.membershipEndDate),
          };
        });
        setServices(serviceData);
        setTotalPages(Math.ceil(serviceData.length / 10));
        setPaginationData(serviceData.slice(0, 10));
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
      const data = services.find((d) => d.id === id);

      const notificationPayload = {
        date: Timestamp.fromDate(new Date()),
        from: data.companyPhone,
        to: data.customerPhone,
        subject: "Subscription",
        description: `Your Subscription ${data.serviceNo} status has been updated to ${newStatus}.`,
        companyName: data.companyName,
        ref: serviceDoc,
        seen: false,
      }
      await updateDoc(serviceDoc, { status: newStatus });
      await addDoc(collection(db, "customers", data.customerId, "notifications"), notificationPayload)
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: serviceDoc,
        date: serverTimestamp(),
        section: "Subscription",
        action: "Update",
        description: `${data.serviceNo} status updated by ${data.createdBy}`,
      });
      setServices((pre) =>
        pre.map((service) =>
          service.id === id ? { ...service, status: newStatus } : service
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  const totalAmount = services.reduce((sum, invoice) => sum + invoice.total, 0);

  useEffect(() => {
    const filteredServices = services.filter((service) => {
      const { customerName, customerPhone, status, serviceNo } = service;
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customerPhone
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "All" || status === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredServices.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, services, searchTerm, filterStatus]);

  let columns = [
    {
      title: "Date",
      data: "date",
      editor: false,
      readOnly: true,
      width: 100,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const time = paginationData[cellProperties.row]?.time;
        const combinedValue = `${value} <br/><span style="color: gray; font-size:14px">${time}</small>`;
        td.innerHTML = combinedValue;
        td.style.paddingLeft = "30px";
        return td;
      },
    },
    {
      title: "Service No",
      type: "text",
      data: "serviceNo",
      className: " font-bold",
      editor: false,
      readOnly: true,
      width: 90,
    },
    {
      title: "Customer",
      type: "text",
      data: "customerName",
      editor: false,
      readOnly: true,
      width: 100,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const customerPhone = paginationData[cellProperties.row]?.customerPhone;
        const combinedValue = `${value} <br/><span style="color: gray; font-size:14px">Ph.No ${customerPhone}</span>`;
        td.innerHTML = combinedValue;
        return td;
      },
    },
    {
      title: "Amount",
      type: "numeric",
      data: "total",
      numericFormat: {
        pattern: "₹ 0,0.0 ",
        culture: "en-IN",
      },
      className: "htLeft font-bold",
      editor: false,
      readOnly: true,
      width: 80,
    },
    {
      title: "Status",
      type: "text",
      editor: false,
      data: "status",
      width: 90,
      className: "updateStatus",
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const select = document.createElement("select");
        const options = ["Active", "InActive"];
        options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.text = option;
          select.appendChild(opt);
        });
        select.value = value;
        select.className =
          "px-3 py-1 rounded-md cursor-pointer " +
          (value === "Active" ? "bg-green-100" : "bg-red-100");
        select.onchange = async (e) => {
          const newStatus = e.target.value;
          await onUpdateStatus(
            paginationData[cellProperties.row]?.id,
            newStatus
          );
        };
        td.innerHTML = "";
        td.appendChild(select);
        td.style.color = "black";
        td.style.paddingLeft = "8px";
        td.className = "updateStatus";
        return td;
      },
    },
    {
      title: "Mode",
      type: "text",
      data: "mode",
      editor: false,
      readOnly: true,
      width: 80,
    },
    {
      title: "Created By",
      type: "text",
      data: "createdBy",
      editor: false,
      readOnly: true,
      width: 90,
    },
    {
      title: "Start Date",
      data: "startDate",
      editor: false,
      readOnly: true,
      width: 100,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const time = paginationData[cellProperties.row]?.startDate?.time;
        const combinedValue = `${value.date} <br/><span style="color: gray; font-size:14px">${time}</small>`;
        td.innerHTML = combinedValue;
        return td;
      },
    },
    {
      title: "Expire Date",
      type: "text",
      data: "expireDate",
      editor: false,
      readOnly: true,
      width: 100,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const time = paginationData[cellProperties.row]?.expireDate?.time;
        const currentDate = new Date();
        const expireDate = new Date(value.date);
        const timeDiff = expireDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const color = daysDiff <= 7 ? "orange" : "gray";
        const combinedValue = `<div style="color: ${color};">${value.date} <br/><span  font-size:14px">${time}</small></div>`;
        td.innerHTML = combinedValue;

        return td;
      },
    },
  ];
  if (userDetails.selectedDashboard === "" || role?.create) {
    columns.push({
      title: "Renewal",
      type: "text",
      editor: false,
      width: 90,
      data: "id",
      className: "updateStatus",
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const button = document.createElement("button");
        td.innerHTML = "";
        td.className = "updateStatus";
        td.style.paddingLeft = "8px";
        button.innerText = "Renewal";
        button.className =
          "px-3 py-1 rounded-md bg-blue-500 text-white cursor-pointer";
        button.onclick = () => {
          navigate(value + "/renewal-subscription");
        };
        td.appendChild(button);
        return td;
      },
    });
  }
  return (
    <div className="main-container " style={{ height: "94vh" }}>
      <div className="mt-4 py-3">
        <div className="text-2xl font-bold pb-3 flex items-center space-x-3">
          {userDetails.selectedDashboard === "staff" && (
            <AiOutlineHome
              size={24}
              onClick={() => {
                navigate("/staff");
              }}
            />
          )}
          <div>Subscriptions Overview</div>
        </div>
        <div className="grid grid-cols-4 gap-8 ">
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Total Amount</div>
            <div className="text-3xl text-indigo-600 font-bold p-2">
              ₹ {totalAmount}
            </div>
          </div>
          {/* <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Paid Amount</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {" "}
              ₹ {paidAmount}
            </div>
          </div> */}
          {/* <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Pending Amount</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              ₹ {pendingAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> UnPaid Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {totalAmount - paidAmount}
            </div>
          </div> */}
        </div>
      </div>
      <div className="container2">
        <nav className="flex items-center mb-4 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
            >
              <input
                type="text"
                placeholder="Search by service #..."
                className=" w-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearch />
            </div>

            <div className="w-1/2">
              <Select
                value={filterStatus || "All"}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Select Filter"} />
                </SelectTrigger>
                <SelectContent className=" h-26">
                  <SelectItem value="All"> All </SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <Link
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                to="create-subscription"
              >
                + Create Service
              </Link>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6" style={{ height: "94vh" }}>
            Loading subscriptions...
          </div>
        ) : (
          <div
            style={{ minHeight: "94vh", width: "100%" }}
            className="overflow-hidden"
          >
            <div className="py-2">
              {paginationData.length > 0 ? (
                <Handsontable columns={columns} data={paginationData} />
              ) : (
                <div className="my-10">
                  <div className="w-full flex justify-center">
                    <img src={addItem} alt="add Item" className="w-24 h-24" />
                  </div>
                  <div className="my-6 text-center">No services Found</div>
                  <div className="w-full flex justify-center">
                    {(userDetails.selectedDashboard === "" || role?.create) && (
                      <Link
                        className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                        to="create-subscription"
                      >
                        + Create service
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
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
    </div>
  );
}

export default Services;
