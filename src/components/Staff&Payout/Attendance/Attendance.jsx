import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
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

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  useEffect(() => {
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

        setStaffAttendance(staffAttendance);
      } catch (error) {
        console.log("🚀 ~ fetchStaffData ~ error:", error);
      } finally {
        setLoading(false);
      }
    }

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

  function DateFormate(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();
    return `${getDate}/${getMonth}/${getFullYear}`;
  }

  function markedAttendance(AttendanceId, data) {
    const removedAlreadyAddAttendance = staffAttendance.filter((ele) => {
      if (ele.id === AttendanceId) {
        return false;
      }
      if (onUpdateAttendance.id && ele.id !== onUpdateAttendance.id) {
        return false;
      }

      return true;
    });
    removedAlreadyAddAttendance.push(data);

    const sortedData = removedAlreadyAddAttendance.sort((a, b) =>
      b.id.localeCompare(a.id)
    );
    setStaffAttendance(sortedData);
  }

  const filteredAttendance = staffAttendance.filter((ele) => {
    if (!selectedMonth) {
      return true;
    }
    return ele.id.slice(2) === selectedMonth.split("-").reverse().join("");
  });

  return (
    <div className="main-container" style={{ height: "82vh" }}>
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
      <div className="container">
        <header className="flex justify-between items-center space-x-3 p-5">
          <div className="flex space-x-3 item-center">
            <h1 className="text-2xl font-bold">Attendance</h1>
            <div className="">
              <label htmlFor="monthFilter">Filter by Month:</label>
              <input
                id="monthFilter"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className=" p-1 border rounded-lg"
              />
            </div>
          </div>
          <button className="btn-add " onClick={() => setIsSidebarOpen(true)}>
            + Add Attendance
          </button>
        </header>
        <div>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : filteredAttendance.length > 0 ? (
            <div className="overflow-y-auto" style={{ height: "60vh" }}>
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
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((item) => (
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
