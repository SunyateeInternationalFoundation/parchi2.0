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

function DebitNoteList() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(!true);
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
      ?.debitNote;

  const [DebitNoteList, setDebitNoteList] = useState([]);

  const [DebitNoteCount, setDebitNoteCount] = useState({
    total: 0,
    received: 0,
    totalPrice: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchDNList() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "companies", companyId, "debitNote"),
          orderBy("date", "desc")
        );
        const getData = await getDocs(q);
        let receivedCount = 0;
        let totalPrice = 0;
        const data = getData.docs.map((doc) => {
          const res = doc.data();
          if (res.orderStatus === "Received") {
            ++receivedCount;
          }
          totalPrice += res.total;
          return {
            id: doc.id,
            ...DateTimeFormate(res.date),
            debitNoteNo: res.prefix + "-" + res.debitNoteNo,
            vendorName: res.vendorDetails.name,
            vendorPhone: res.vendorDetails.phone,
            total: res.total,
            orderStatus: res.orderStatus,
            createdBy: res.createdBy.who,
            mode: res.mode,
          };
        });
        setTotalPages(Math.ceil(data.length / 10));
        setPaginationData(data.slice(0, 10));
        setDebitNoteList(data);
        setDebitNoteCount({
          total: data.length,
          received: receivedCount,
          totalPrice: totalPrice,
        });
      } catch (error) {
        console.log("🚀 ~ fetchDebitNoteList ~ error:", error);
      }
      setLoading(false);
    }
    fetchDNList();
  }, []);

  async function onStatusUpdate(value, debitNoteId) {
    try {
      const docRef = doc(db, "companies", companyId, "debitNote", debitNoteId);
      const data = DebitNoteList.find((d) => d.id === debitNoteId);

      await updateDoc(docRef, { orderStatus: value });
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: docRef,
        date: serverTimestamp(),
        section: "DebitNote",
        action: "Update",
        description: `${data.debitNoteNo} status updated by ${data.createdBy}`,
      });
      const UpdatedData = DebitNoteList.map((ele) => {
        if (ele.id === debitNoteId) {
          ele.orderStatus = value;
        }
        return ele;
      });
      setDebitNoteList(UpdatedData);
      alert("Successfully Status Updated");
    } catch (error) {
      console.log("🚀 ~ onStatusUpdate ~ error:", error);
    }
  }
  useEffect(() => {
    const filteredDebitNote = DebitNoteList.filter((debitNote) => {
      const { vendorName, vendorPhone, debitNoteNo, orderStatus } = debitNote;
      const matchesSearch =
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debitNoteNo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        vendorPhone.toString().toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || orderStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setPaginationData(
      filteredDebitNote.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, DebitNoteList, searchTerm, filterStatus]);
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
      title: "debitNote No",
      type: "text",
      data: "debitNoteNo",
      className: " font-bold",
      editor: false,
      readOnly: true,
      width: 90,
    },
    {
      title: "Vendor",
      type: "text",
      data: "vendorName",
      editor: false,
      readOnly: true,
      width: 90,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const vendorPhone = paginationData[cellProperties.row]?.vendorPhone;
        const combinedValue = `${value} <br/><span style="color: gray; font-size:14px">Ph.No ${vendorPhone}</span>`;
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
      data: "orderStatus",
      width: 90,
      className: "updateStatus",
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const select = document.createElement("select");
        const options = ["Pending", "Received"];
        options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.text = option;
          select.appendChild(opt);
        });
        select.value = value;
        select.className =
          "px-3 py-1 rounded-md cursor-pointer " +
          (value === "Received" ? "bg-green-100" : "bg-red-100");
        select.onchange = async (e) => {
          const newStatus = e.target.value;
          await onStatusUpdate(
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
          <div>DebitNote Overview</div>
        </div>
        <div className="grid grid-cols-4 gap-8">
          <div className="rounded-lg p-5  bg-white shadow  ">
            <div className="text-lg">All Debit Notes</div>
            <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold p-2">
              {DebitNoteCount.total}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Received DebitNote</div>
            <div className="text-3xl text-green-600 font-bold p-2">
              {DebitNoteCount.received}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Pending DebitNote</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              {DebitNoteCount.total - DebitNoteCount.received}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg">Total Paid DebitNote Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {DebitNoteCount.totalPrice}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="flex mb-4 items-center px-5">
          <div className="space-x-4 w-full flex items-center">
            <div
              className="flex items-center space-x-4  border
      px-5  py-3 rounded-md w-full"
            >
              <input
                type="text"
                placeholder="Search by DebitNote #..."
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <Link
                className="bg-[#442799] text-white text-center px-5 py-3 font-semibold rounded-md"
                to="create-debitNote"
              >
                + Create DebitNote
              </Link>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6" style={{ height: "92vh" }}>
            Loading debitNote...
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
                  <div className="my-6 text-center">No DebitNote Found</div>
                  <div className="w-full flex justify-center">
                    {(userDetails.selectedDashboard === "" || role?.create) && (
                      <Link
                        className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                        to="create-debitNote"
                      >
                        + Create DebitNote
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

export default DebitNoteList;
