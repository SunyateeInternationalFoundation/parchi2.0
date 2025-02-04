import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
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

const POS = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
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
      ?.pos;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPos = async () => {
      setLoading(true);
      try {
        const posRef = collection(db, "companies", companyId, "pos");
        const q = query(posRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const posData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...DateTimeFormate(data.date),
            posNo: data.prefix + "-" + data.posNo,
            customerName: data.customerDetails.name,
            customerPhone: data.customerDetails.phone,
            total: data.total,
            paymentStatus: data.paymentStatus,
            createdBy: data.createdBy.who,
            mode: data.mode,
          };
        });
        setTotalPages(Math.ceil(posData.length / 10));
        setPaginationData(posData.slice(0, 10));
        setPos(posData);
      } catch (error) {
        console.error("Error fetching pos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPos();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (posId, newStatus) => {
    try {
      const posDoc = doc(db, "companies", companyId, "pos", posId);
      const data = pos.find((d) => d.id === posId);

      await updateDoc(posDoc, { paymentStatus: newStatus });
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: posDoc,
        date: serverTimestamp(),
        section: "POS",
        action: "Update",
        description: `${data.posNo} status updated by ${data.createdBy}`,
      });
      setPos((prevPos) =>
        prevPos.map((pos) =>
          pos.id === posId ? { ...pos, paymentStatus: newStatus } : pos
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const totalAmount = pos.reduce((sum, pos) => sum + pos.total, 0);

  const paidAmount = pos
    .filter((pos) => pos.paymentStatus === "Paid")
    .reduce((sum, pos) => sum + pos.total, 0);
  const pendingAmount = pos
    .filter((pos) => pos.paymentStatus === "Pending")
    .reduce((sum, pos) => sum + pos.total, 0);

  useEffect(() => {
    const filteredPos = pos.filter((dc) => {
      const { customerName, customerPhone, posNo, paymentStatus } = dc;

      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        posNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerPhone
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredPos.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, pos, searchTerm, filterStatus]);
  const columns = [
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
      title: "POS No",
      type: "text",
      data: "posNo",
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
      width: 90,
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
            paginationData[cellProperties.row]?.id,
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
      width: 90,
    },
    {
      title: "Created By",
      type: "text",
      data: "createdBy",
      editor: false,
      readOnly: true,
      width: 90,
    },
  ];
  return (
    <div className="main-container" style={{ height: "92vh" }}>
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
          <div>POS Overview</div>
        </div>
        <div className="grid grid-cols-4 gap-8">
          <div className="rounded-lg p-5  bg-white shadow  ">
            <div className="text-lg">Total Amount</div>
            <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold p-2">
              ₹ {totalAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Paid Amount</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {" "}
              ₹ {paidAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Pending Amount</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              ₹ {pendingAmount}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg">UnPaid Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {totalAmount - paidAmount}
            </div>
          </div>
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
                placeholder="Search by customer name, phone number, pos number#..."
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
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                to="create-pos"
              >
                Create POS
              </Link>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6" style={{ height: "92vh" }}>
            Loading pos...
          </div>
        ) : (
          <div
            style={{ minHeight: "92vh", width: "100%" }}
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
                  <div className="my-6 text-center">No POS Found</div>
                  <div className="w-full flex justify-center">
                    {(userDetails.selectedDashboard === "" || role?.create) && (
                      <Link
                        className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                        to="create-pos"
                      >
                        + Create POS
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
};

export default POS;
