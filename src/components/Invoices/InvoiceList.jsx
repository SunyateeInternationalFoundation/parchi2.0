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

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [invoicePaginationData, setInvoicePaginationData] = useState([]);
  const userDetails = useSelector((state) => state.users);
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
      ?.invoice;
  const navigate = useNavigate();


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const invoiceDoc = doc(db, "companies", companyId, "invoices", invoiceId);
      const data = invoices.find((d) => d.id === invoiceId);
      const notificationPayload = {
        date: Timestamp.fromDate(new Date()),
        from: data.companyPhone,
        to: data.customerPhone,
        subject: "Invoice",
        description: `Your invoice ${data.invoiceNo} status has been updated to ${newStatus}.`,
        companyName: data.companyName,
        ref: invoiceDoc,
        seen: false,
      }

      await updateDoc(invoiceDoc, { paymentStatus: newStatus });
      await addDoc(collection(db, "customers", data.customerId, "notifications"), notificationPayload)
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: invoiceDoc,
        date: serverTimestamp(),
        section: "Invoice",
        action: "Update",
        description: `${data.invoiceNo} status updated by ${data.createdBy}`,
      });


      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === invoiceId
            ? { ...invoice, paymentStatus: newStatus }
            : invoice
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const paidAmount = invoices
    .filter((invoice) => invoice.paymentStatus === "Paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const pendingAmount = invoices
    .filter((invoice) => invoice.paymentStatus === "Pending")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const columns = [
    {
      title: "Date",
      data: "date",
      editor: false,
      readOnly: true,
      width: 90,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const time = invoicePaginationData[cellProperties.row]?.time;
        const combinedValue = `${value} <br/><span style="color: gray; font-size:14px">${time}</small>`;
        td.innerHTML = combinedValue;
        td.style.paddingLeft = "30px";
        return td;
      },
    },

    {
      title: "Invoice No",
      type: "text",
      data: "invoiceNo",
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
      width: 90,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const customerPhone =
          invoicePaginationData[cellProperties.row]?.customerPhone;
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
      data: "paymentStatus",
      width: 90,
      className: "updateStatus",
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const select = document.createElement("select");
        const options = ["Pending", "Paid", "UnPaid"];
        options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.text = option;
          select.appendChild(opt);
        });
        select.value = value;
        select.className =
          "px-3 py-1 rounded-md cursor-pointer " +
          (value === "Paid"
            ? "bg-green-100"
            : value === "Pending"
              ? "bg-yellow-100"
              : "bg-red-100");
        select.onchange = async (e) => {
          const newStatus = e.target.value;
          await handleStatusChange(
            invoicePaginationData[cellProperties.row]?.id,
            newStatus
          );
        };
        td.innerHTML = "";
        td.appendChild(select);
        td.style.color = "black";
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
      width: 70,
    },
    {
      title: "Created By",
      type: "text",
      data: "createdBy",
      editor: false,
      readOnly: true,
      width: 80,
    },
  ];

  useEffect(() => {
    const filteredInvoices = invoices.filter((invoice) => {
      const { customerName, customerPhone, invoiceNo, paymentStatus } = invoice;
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoiceNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customerPhone
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });

    setInvoicePaginationData(
      filteredInvoices.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, invoices, searchTerm, filterStatus]);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const invoiceRef = collection(db, "companies", companyId, "invoices");

        const q = query(invoiceRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const invoicesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...DateTimeFormate(data.date),
            invoiceNo: data.prefix + "-" + data.invoiceNo,
            customerName: data.customerDetails.name,
            customerPhone: data.customerDetails.phone,
            customerId: data.customerDetails.customerRef.id,
            companyPhone: data.createdBy.phoneNo,
            companyName: data.createdBy.name,
            companyId: data.createdBy.companyRef.id,
            total: data.total,
            paymentStatus: data.paymentStatus,
            createdBy: data.createdBy.who,
            mode: data.mode,
          };
        });
        setTotalPages(Math.ceil(invoicesData.length / 10));
        setInvoicePaginationData(invoicesData.slice(0, 10));
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [companyId]);

  return (
    <div className="main-container" style={{ height: "94vh" }}>
      <div className=" mt-4 py-3">
        <div className="text-2xl font-bold pb-3 flex items-center space-x-3">
          {userDetails.selectedDashboard === "staff" && (
            <AiOutlineHome
              size={24}
              onClick={() => {
                navigate("/staff");
              }}
            />
          )}
          <div>Invoice Overview</div>
        </div>
        <div className="grid grid-cols-4 gap-8  ">
          <div className="rounded-lg p-5 bg-white shadow  ">
            <div className="text-lg">Total Amount</div>
            <div className="text-3xl text-indigo-600 font-bold p-2">
              ₹ {totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Paid Amount</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {" "}
              ₹ {paidAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Pending Amount</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              ₹ {pendingAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg"> UnPaid Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {(totalAmount - paidAmount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="container2">
          <nav className="flex mb-4 items-center px-5">
            <div className="space-x-4 w-full flex items-center">
              <div
                className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
              >
                <input
                  type="text"
                  placeholder="Search by invoice #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="UnPaid">UnPaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full text-end ">
              {(userDetails.selectedDashboard === "" || role?.create) && (
                <Link
                  className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                  to="create-invoice"
                >
                  + Create Invoice
                </Link>
              )}
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6" style={{ height: "94vh" }}>
              Loading invoices...
            </div>
          ) : (
            <div
              style={{ minHeight: "94vh", width: "100%" }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                {invoicePaginationData.length > 0 ? (
                  <Handsontable
                    columns={columns}
                    data={invoicePaginationData}
                  />
                ) : (
                  <div className="my-10">
                    <div className="w-full flex justify-center">
                      <img src={addItem} alt="add Item" className="w-24 h-24" />
                    </div>
                    <div className="my-6 text-center">No Invoice Found</div>
                    <div className="w-full flex justify-center">
                      {(userDetails.selectedDashboard === "" ||
                        role?.create) && (
                          <Link
                            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                            to="create-invoice"
                          >
                            + Create Invoice
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
    </div>
  );
};

export default InvoiceList;
