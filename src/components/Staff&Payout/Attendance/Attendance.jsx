import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";
import AddAttendanceSidebar from "./AddAttendanceSidebar";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useSelector } from "react-redux";

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
    <div
      className="px-5 pb-5 bg-gray-100 overflow-y-auto"
      style={{ height: "92vh" }}
    >
      <header className="flex justify-between items-center space-x-3  my-2">
        <div className="flex space-x-3">
          <Link
            className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
            to={"./../"}
          >
            <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold">Attendance</h1>
        </div>
        <button
          className="bg-blue-500 text-white py-1 px-2 rounded"
          onClick={() => setIsSidebarOpen(true)}
        >
          + Add Attendance
        </button>
      </header>
      <div className="bg-white flex justify-between p-3 rounded-lg">
        <div>
          <div>Total Staff</div>
          <div>{staffData.length}</div>
        </div>
        <div>
          <div>Overall Salary</div>
          <div>₹ {overallSalary.toFixed(2)}</div>
        </div>
      </div>
      <div className="py-3 text-right">
        <label htmlFor="monthFilter">Filter by Month:</label>
        <input
          id="monthFilter"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="ml-2 p-1 border rounded-lg"
        />
      </div>
      <div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : filteredAttendance.length > 0 ? (
          <div className="overflow-y-auto" style={{ height: "60vh" }}>
            {filteredAttendance.map((ele) => (
              <div
                className=" bg-white p-3 rounded-lg mb-3 cursor-pointer border hover:shadow"
                key={ele.id}
                onClick={() => {
                  setOnUpdateAttendance(ele);
                  setIsSidebarOpen(true);
                }}
              >
                <div>{DateFormate(ele.date)}</div>
                <div className="flex justify-between items-center">
                  <div>
                    Total Presents{" "}
                    <span className="text-green-500">{ele.present}</span>
                  </div>
                  <div>
                    Total Absent{" "}
                    <span className="text-red-500">{ele.absent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            No Attendance Found for the Selected Month
          </div>
        )}
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
