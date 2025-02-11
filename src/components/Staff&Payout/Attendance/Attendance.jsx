import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";
import AddAttendanceSidebar from "./AddAttendanceSidebar";

function Attendance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [overallSalary, setOverallSalary] = useState(0);
  const [onUpdateAttendance, setOnUpdateAttendance] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  async function fetchStaffData() {
    setLoading(true);
    try {
      const companyRef = doc(db, "companies", companyId);
      const staffRef = collection(db, "staff");
      const q = query(staffRef, where("companyRef", "==", companyRef));
      const getStaffData = await getDocs(q);
      const staff = getStaffData.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setStaffData(staff);
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStaffAttendance() {
    setLoading(true);

    try {
      const staffAttendanceRef = collection(
        db,
        "companies",
        companyId,
        "staffAttendance"
      );
      const q = query(staffAttendanceRef, orderBy("date", "desc"));
      const staffAttendanceData = await getDocs(q);

      const staffAttendance = staffAttendanceData.docs.map((doc) => {
        const data = doc.data();
        let present = 0;
        let absent = 0;

        for (let att of data.staffs) {
          if (att.status === "present") {
            ++present;
          } else if (att.status === "absent") {
            ++absent;
          }
        }

        return {
          id: doc.id,
          ...data,
          present,
          absent,
        };
      });
      setTotalPages(Math.ceil(staffAttendance.length / 10));
      setPaginationData(staffAttendance.slice(0, 10));
      setStaffAttendance(staffAttendance);
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchStaffData();
    fetchStaffAttendance();
  }, [companyId]);

  useEffect(() => {
    if (staffData.length > 0 && staffAttendance.length > 0) {
      async function fetchCalculation() {
        try {
          let overallSum = 0;

          staffAttendance.forEach((data) => {
            let sum = 0;
            for (let att of data.staffs) {
              const matchingStaff = staffData.find(
                (staff) => staff.id === att.id
              );

              if (matchingStaff) {
                let salary = 0;
                const attendanceDate = new Date(data.date.seconds * 1000);
                const year = attendanceDate.getFullYear();
                const month = attendanceDate.getMonth() + 1;

                const daysInMonth = new Date(year, month, 0).getDate();
                if (matchingStaff.isDailyWages) {
                  salary = +matchingStaff.paymentDetails;
                } else {
                  salary = +matchingStaff.paymentDetails / daysInMonth;
                }

                if (att.shift === 0.5) {
                  sum += salary * 0.5;
                } else if (att.shift === 1) {
                  sum += salary * 1;
                } else if (att.shift === 1.5) {
                  sum += salary * 1.5;
                } else if (att.shift === 2) {
                  sum += salary * 2;
                }

                if (att.adjustments?.overTime) {
                  sum += att.adjustments?.overTime?.amount;
                } else if (att.adjustments?.lateFine) {
                  sum -= att.adjustments?.lateFine?.amount;
                }

                if (att.adjustments?.allowance) {
                  sum += att.adjustments?.allowance?.amount;
                } else if (att.adjustments?.deduction) {
                  sum -= att.adjustments?.deduction?.amount;
                }
              }
            }

            overallSum += sum;
          });

          setOverallSalary(overallSum);
        } catch (error) {
          console.log("🚀 ~ fetchStaffData ~ error:", error);
        }
      }

      fetchCalculation();
    }
  }, [staffData, staffAttendance]);

  function markedAttendance(AttendanceId, data) {
    const removedAlreadyAddAttendance = staffAttendance.filter(
      (ele) => ele.id !== AttendanceId
    );

    removedAlreadyAddAttendance.push(data);

    const sortedData = removedAlreadyAddAttendance.sort((a, b) =>
      b.id.localeCompare(a.id)
    );
    setStaffAttendance(sortedData);
  }

  useEffect(() => {
    const filteredAttendance = staffAttendance.filter((ele) => {
      if (!selectedMonth) {
        return true;
      }
      return ele.id.slice(2) === selectedMonth.split("-").reverse().join("");
    });
    setPaginationData(
      filteredAttendance.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, staffAttendance, selectedMonth]);

  return (
    <div className="main-container overflow-y-auto" style={{ height: "82vh" }}>
      <div className=" mt-4 py-3">
        <h1 className="text-2xl font-bold pb-3 ">Attendance Overview</h1>
        <div className="grid grid-cols-2 gap-8  ">
          <div className="rounded-lg p-5 bg-white shadow  ">
            <div className="text-lg">Total Staff</div>
            <div className="text-3xl text-indigo-600 font-bold p-2">
              {staffData.length}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Total Salary</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              ₹ {overallSalary.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <div className="container2">
        <header className="flex justify-between items-center space-x-3 px-5">
          <div className="flex items-center space-x-5">
            <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="monthFilter"
                className="text-lg font-medium text-gray-700"
              >
                Filter by Month:
              </label>
              <input
                id="monthFilter"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 border border-gray-400 rounded-md text-lg focus:outline-none focus:ring-1 focus:ring-gray-500"
                pattern="\d{4}-\d{2}" // Ensures proper format
              />
            </div>
          </div>

          <button className="btn-add " onClick={() => setIsSidebarOpen(true)}>
            + Add Attendance
          </button>
        </header>
        <div className="">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : paginationData.length > 0 ? (
            <div className="py-3" style={{ minHeight: "92vh" }}>
              <table className="w-full border-collapse text-start">
                <thead className="bg-white">
                  <tr className="border-b">
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Presents
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Absent
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                        onClick={() => {
                          setOnUpdateAttendance(item);
                          setIsSidebarOpen(true);
                        }}
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={item.date} />
                        </td>
                        <td className="px-5 py-3">{item.present}</td>
                        <td className="px-5 py-3">{item.absent}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="h-24 text-center py-4">
                        No Attendance Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center">
              No Attendance Found for the Selected Month
            </div>
          )}
        </div>
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
      {isSidebarOpen && (
        <AddAttendanceSidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            setOnUpdateAttendance("");
          }}
          staffData={staffData}
          markedAttendance={markedAttendance}
          onUpdateAttendance={onUpdateAttendance}
        />
      )}
    </div>
  );
}

export default Attendance;
