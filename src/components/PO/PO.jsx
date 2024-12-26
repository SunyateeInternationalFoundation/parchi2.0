import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

function PO({ companyDetails, isStaff }) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(!true);
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }

  const selectedDashboardUser = userDetails.selectedDashboard;
  const navigate = useNavigate();
  const [POList, setPOList] = useState([]);

  const [POCount, setPOCount] = useState({
    total: 0,
    received: 0,
    totalPrice: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPO = POList.filter((po) => {
    const { vendorDetails, no, orderStatus } = po;
    const vendorName = vendorDetails?.name || "";
    const matchesSearch =
      vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      no?.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || orderStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    async function fetchPoList() {
      setLoading(true);
      try {
        const getData = await getDocs(
          collection(db, "companies", companyId, "po")
        );
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
            ...res,
          };
        });
        setPOList(data);
        setPOCount({
          total: data.length,
          received: receivedCount,
          totalPrice: totalPrice,
        });
      } catch (error) {
        console.log("🚀 ~ fetchPoList ~ error:", error);
      }
      setLoading(false);
    }
    fetchPoList();
  }, []);

  async function onStatusUpdate(value, poId) {
    try {
      const docRef = doc(db, "companies", companyId, "po", poId);
      await updateDoc(docRef, { orderStatus: value });
      const UpdatedData = POList.map((ele) => {
        if (ele.id === poId) {
          ele.orderStatus = value;
        }
        return ele;
      });
      setPOList(UpdatedData);
      alert("Successfully Status Updated");
    } catch (error) {
      console.log("🚀 ~ onStatusUpdate ~ error:", error);
    }
  }

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 h-48">
          <h1 className="text-2xl font-bold py-3 px-10 ">PO Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">All PO's</div>
              <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold">
                ₹ {POCount.total}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg">Received PO</div>
              <div className="text-3xl text-green-600 font-bold">
                {" "}
                ₹ {POCount.received}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg">Pending PO</div>
              <div className="text-3xl text-orange-600 font-bold">
                {" "}
                ₹ {POCount.total - POCount.received}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg">Total Paid PO Amount</div>
              <div className="text-3xl text-red-600 font-bold">
                ₹ {POCount.totalPrice}
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
                  placeholder="Search by PO #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              <Link
                className="bg-blue-500 text-white py-2 px-2 rounded-lg"
                to="create-po"
              >
                + Create PO
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading po...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        PO No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Vendor
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
                    {filteredPO.length > 0 ? (
                      filteredPO.map((po) => (
                        <tr
                          key={po.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(po.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">{po.poNo}</td>

                          <td className="px-5 py-3 text-start">
                            {po.vendorDetails?.name} <br />
                            <span className="text-gray-500">
                              Ph.No {po.vendorDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              po.date.seconds * 1000 +
                                po.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3  text-center">{`₹ ${po.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                po.orderStatus !== "Pending"
                                  ? "bg-green-200 "
                                  : "bg-red-200 "
                              }`}
                            >
                              <select
                                value={po.orderStatus}
                                onChange={(e) => {
                                  onStatusUpdate(e.target.value, po.id);
                                }}
                                className={` ${
                                  po.orderStatus !== "Pending"
                                    ? "bg-green-200 "
                                    : "bg-red-200 "
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Received">Received</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3">{po.mode || "Online"}</td>

                          <td className="px-5 py-3">
                            {po?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No po found
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

export default PO;
