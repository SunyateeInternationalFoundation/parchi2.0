import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";
import { cn, formatDate } from "../../../lib/utils";
import { Calendar } from "../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../UI/popover";
import PaymentsDeductions from "./PaymentsDeductions";

function AddAttendanceSidebar({
  onClose,
  isOpen,
  staffData,
  markedAttendance,
  onUpdateAttendance,
}) {
  const [open, setOpen] = useState(false);
  const userDetails = useSelector((state) => state.users);
  const [activePaymentDeductionsStaff, setActivePaymentDeductionsStaff] =
    useState("");
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [date, setDate] = useState(Timestamp.fromDate(new Date()))
  const [attendanceForm, setAttendanceForm] = useState({
    staffs: [],
  });


  function getAttendanceStaffData(id) {
    return attendanceForm.staffs.find((ele) => ele.id === id);
  }

  function onUpdatedStaffAttendance(value, staff) {
    const removedPreviousStaffAttendance = attendanceForm.staffs.filter(
      (ele) => ele.id !== staff.id
    );
    setAttendanceForm((val) => ({
      ...val,
      staffs: [
        ...removedPreviousStaffAttendance,
        {
          id: staff.id,
          name: staff.name,
          status: value,
          shift: value === "present" ? 1 : 0,
        },
      ],
    }));
  }

  function setDateAsId(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();
    return `${getDate}${getMonth}${getFullYear}`;
  }

  async function AddAttendance(e) {
    e.preventDefault();
    try {
      const attendanceId = setDateAsId(date);
      if (!attendanceId) {
        alert("please Select Date");
        return;
      }
      let present = 0;
      let absent = 0;
      attendanceForm.staffs.forEach((ele) => {
        if (ele.status == "present") {
          present++;
        }
        if (ele.status == "absent") {
          absent++;
        }
      });
      let payload = {
        ...attendanceForm,
        date,
        present,
        absent,
        createdAt: Timestamp.fromDate(new Date()),
      };



      const ref = doc(
        db,
        "companies",
        companyId,
        "staffAttendance",
        attendanceId
      );

      await setDoc(ref, payload);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: ref,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Update",
        description: `Marked Attendance`,
      });
      alert("Successfully Marked Attendance");

      markedAttendance(attendanceId, {
        id: attendanceId,
        ...payload,
        present,
        absent,
      });
      onClose();
    } catch (error) {
      console.log("🚀 ~ AddAttendance ~ error:", error);
    }
  }

  function addPaymentDeductionToStaff(staffId, data) {
    const updatedAttendance = attendanceForm.staffs.map((ele) => {
      if (staffId === ele.id) {
        ele = { ...ele, ...data };
      }
      return ele;
    });
    setAttendanceForm((val) => ({ ...val, staffs: updatedAttendance }));
  }

  async function fetchingAttendance() {
    const selectedDate = new Date(
      date?.seconds * 1000 +
      date?.nanoseconds / 1000000
    )
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const attendanceId = `${day}${month}${year}`;
    const attendanceData = await getDoc(doc(db, "companies", companyId, "staffAttendance", attendanceId))
    if (!attendanceData.exists()) {
      setAttendanceForm({
        staffs: [],
      })
      return
    }
    setAttendanceForm(attendanceData.data());
  }

  useEffect(() => {
    if (!onUpdateAttendance?.id) {
      return;
    }
    setAttendanceForm(onUpdateAttendance);
    setDate(onUpdateAttendance.date)
  }, [onUpdateAttendance?.id]);

  useEffect(() => {
    fetchingAttendance()
  }, [date])

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      onClick={onClose}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform  ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="font-bold text-xl mb-4"> Mark Attendance</h2>
          <button className="text-2xl mb-4" onClick={onClose}>
            <IoMdClose size={24} />
          </button>
        </div>
        <form className="space-y-2" onSubmit={AddAttendance}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div>
              <label className="text-sm block font-semibold mt-2">Date</label>

              <Popover open={open} onOpenChange={setOpen} >
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex justify-between items-center input-tag ",
                      !date?.seconds && "text-muted-foreground"
                    )}
                  >
                    {date?.seconds ? (
                      formatDate(
                        new Date(
                          date?.seconds * 1000 +
                          date?.nanoseconds / 1000000
                        ),
                        "PPP"
                      )
                    ) : (
                      <span className="text-gray-600">Pick a date</span>
                    )}
                    <CalendarIcon className="h-4 w-4 " />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="">
                  <Calendar
                    mode="single"
                    selected={
                      new Date(
                        date?.seconds * 1000 +
                        date?.nanoseconds / 1000000
                      )
                    }
                    onSelect={(val) => {
                      if (val <= new Date()) {
                        setDate(Timestamp.fromDate(new Date(val)));
                        setOpen(false);
                      }
                    }}
                    disabled={{ after: new Date() }}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="overflow-y-auto" style={{ height: "70vh" }}>
              {staffData.length > 0 ? (
                staffData
                  .filter((staff) => {
                    const staffJoiningDate = new Date(
                      staff.dateOfJoining.seconds * 1000
                    );
                    staffJoiningDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00

                    const selectedDate = new Date(
                      date?.seconds * 1000 +
                      date?.nanoseconds / 1000000
                    );
                    selectedDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00

                    return staffJoiningDate <= selectedDate;
                  })
                  .map((staff) => {
                    return (
                      <div key={staff.id} className="border-b-2 py-2">
                        <div
                          className="text-sm block font-semibold mt-2 p-2 flex justify-between items-center cursor-pointer"
                          onClick={() => {
                            const staffAttendanceData = getAttendanceStaffData(
                              staff.id
                            );
                            if (staffAttendanceData?.status !== "present") {
                              alert("select Attendance");
                              return;
                            }
                            setActivePaymentDeductionsStaff({
                              name: staff.name,
                              isDailyWages: staff.isDailyWages,
                              ...staffAttendanceData,
                            });
                          }}
                        >
                          {staff.name} <FaChevronRight />
                        </div>
                        <div className="flex">
                          {["present", "absent", "leave", "holiday"].map(
                            (attendance) => (
                              <div
                                key={attendance}
                                className="flex-grow text-center"
                              >
                                <input
                                  type="radio"
                                  name={staff.id}
                                  id={attendance + staff.id}
                                  value={attendance}
                                  onChange={(e) =>
                                    onUpdatedStaffAttendance(
                                      e.target.value,
                                      staff
                                    )
                                  }
                                  className="hidden"
                                />
                                <label
                                  htmlFor={attendance + staff.id}
                                  className={`inline-block px-5 py-2 cursor-pointer border rounded-lg transition-all ease-in-out text-sm m-1 shadow ${getAttendanceStaffData(staff.id)?.status ===
                                    attendance
                                    ? " border text-white" +
                                    ((attendance === "present" &&
                                      " bg-green-700 ") ||
                                      (attendance === "absent" &&
                                        " bg-red-700 ") ||
                                      (attendance === "leave" &&
                                        " bg-gray-500 ") ||
                                      (attendance === "holiday" &&
                                        " bg-purple-800 "))
                                    : " bg-white text-gray-600 border "
                                    }`}
                                >
                                  {attendance}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div>No Staff Found</div>
              )}
            </div>
          </div>

          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "8vh" }}
          >
            <button type="submit" className="w-full btn-add">
              Mark Attendance
            </button>
          </div>
        </form>
      </div>
      <div>
        <PaymentsDeductions
          onClose={() => setActivePaymentDeductionsStaff("")}
          staff={activePaymentDeductionsStaff}
          addPaymentDeductionToStaff={addPaymentDeductionToStaff}
        />
      </div>
    </div>
  );
}
AddAttendanceSidebar.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  staffData: PropTypes.array,
  markedAttendance: PropTypes.func,
  onUpdateAttendance: PropTypes.object,
};

export default AddAttendanceSidebar;
