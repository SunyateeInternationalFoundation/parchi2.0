import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../../firebase";
import { updateCompanyDetails } from "../../../store/UserSlice";

const WeekOff = () => {
  const [selectedWeekDays, setSelectedWeekDays] = useState([]);
  const [previousWeekDays, setPreviousWeekDays] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("Staff Level");
  const [isCalendarMonth, setIsCalendarMonth] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [tempStaff, setTempStaff] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const companyRef = doc(db, "companies", companyDetails.companyId);
        const staffQuery = query(
          collection(db, "staff"),
          where("companyRef", "==", companyRef)
        );
        const staffSnapshot = await getDocs(staffQuery);
        const tempData = {};
        const staffData = staffSnapshot.docs.map((doc) => {
          const data = doc.data();
          if (!tempData[doc.id]) {
            tempData[doc.id] = [];
          }
          if (data?.weekOff) {
            tempData[doc.id].push(...data.weekOff);
          }
          return {
            id: doc.id,
            ...data,
            isExpend: false,
          };
        });
        setTempStaff(tempData);
        setStaffList(staffData);
        setTotalPages(Math.ceil(staffData.length / 10));
        setPaginationData(staffData.slice(0, 10));
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };

    fetchStaffData();
    setSelectedWeekDays(companyDetails?.weekOff || []);
    setPreviousWeekDays(companyDetails?.weekOff || []);
    setIsCalendarMonth(companyDetails?.isCalendarMonth ?? true);
  }, [companyDetails.companyId]);

  async function onSubmitWeekOff(staff) {
    try {
      const ref = doc(db, "staff", staff.id);
      await updateDoc(ref, { weekOff: staff.weekOff });
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        {
          ref: ref,
          date: serverTimestamp(),
          section: "Staff&Payout",
          action: "Update",
          description: "staff weekoff updated",
        }
      );
      setTempStaff((val) => ({ ...val, [staff.id]: staff.weekOff }));
    } catch (error) {
      console.log("🚀 ~ onSubmitWeekOff ~ error:", error);
    }
  }

  async function onSubmitCompanyWeekOff() {
    try {
      const payload = { weekOff: selectedWeekDays };
      const ref = doc(db, "companies", companyDetails.companyId);
      await updateDoc(ref, payload);
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        {
          ref: ref,
          date: serverTimestamp(),
          section: "Staff&Payout",
          action: "Update",
          description: "company weekoff updated",
        }
      );
      dispatch(
        updateCompanyDetails({ ...companyDetails, weekOff: selectedWeekDays })
      );
      setPreviousWeekDays(selectedWeekDays);
    } catch (error) {
      console.log("🚀 ~ onSubmitCompanyWeekDay ~ error:", error);
    }
  }

  function isDataUpdated(array1, array2) {
    if (array1?.length === undefined || array2?.length === undefined) {
      return false;
    }
    if (array1?.length !== array2?.length) {
      return true;
    }
    for (const day of array2) {
      if (!array1.includes(day)) {
        return true;
      }
    }
    return false;
  }

  async function onChangeIsCalendarMonth(value) {
    try {
      const ref = doc(db, "companies", companyDetails.companyId);
      await updateDoc(ref, {
        isCalendarMonth: value,
      });
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        {
          ref: ref,
          date: serverTimestamp(),
          section: "Staff&Payout",
          action: "Update",
          description: " calender updated",
        }
      );
      setIsCalendarMonth(value);
      dispatch(
        updateCompanyDetails({ ...companyDetails, isCalendarMonth: value })
      );
    } catch (error) {
      console.log("🚀 ~ onChangeIsCalendarMonth ~ error:", error);
    }
  }

  useEffect(() => {
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    setPaginationData(staffList.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(staffList.length / 10));
  }, [currentPage, staffList]);

  return (
    <div className="main-container" style={{ height: "80vh" }}>
      <header className="flex justify-between items-center my-2">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Week Off Preferences</h1>
        </div>
      </header>

      <div className="flex gap-4 pb-5">
        <button
          className={
            "flex-1 p-4 border  border-gray-300 rounded-lg shadow hover:bg-blue-100 " +
            (isCalendarMonth ? " bg-blue-400" : " bg-white")
          }
          onClick={() => onChangeIsCalendarMonth(true)}
        >
          <h3 className="text-lg font-medium mt-2 mb-4">Calendar Month</h3>
          <p className="text-sm text-gray-600">
            Ex. March-31 days, April -30 days etc (per day salary = salary / No.
            of days in month)
          </p>
        </button>
        <button
          className={
            "flex-1 p-4 border  border-gray-300 rounded-lg shadow hover:bg-blue-100 " +
            (!isCalendarMonth ? " bg-blue-400" : " bg-white")
          }
          onClick={() => onChangeIsCalendarMonth(false)}
        >
          <h3 className="text-lg font-medium mt-2 mb-4">Exclude Week Offs</h3>
          <p className="text-sm text-gray-600">
            Ex. Monthly with 31 days and 4 weekly - offs will have 27 payable
            days (per day salary = salary/Payable days)
          </p>
        </button>
      </div>
      <div className="container2 p-5">
        <div className="flex gap-4 mb-3">
          {["Staff Level", "Business Level"].map((level) => (
            <button
              key={level}
              className={`btn-outline-black ${
                selectedLevel === level
                  ? " bg-black text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setSelectedLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>

        {selectedLevel === "Staff Level" && (
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold mb-4">Staff Members</h3>
            </div>
            <div className="space-y-2">
              {paginationData.map((staff) => (
                <div
                  key={staff.id}
                  className="px-3 bg-white border rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
                >
                  <div className="py-3 h-16 flex items-center justify-between space-x-3">
                    <div
                      className="w-full"
                      onClick={() => {
                        const updateData = staffList.map((ele) => {
                          if (ele.id === staff.id) {
                            ele.isExpend = !staff.isExpend;
                          }
                          return ele;
                        });
                        setStaffList(updateData);
                      }}
                    >
                      {staff.name}
                    </div>
                    {isDataUpdated(staff?.weekOff, tempStaff[staff.id]) && (
                      <div className="space-x-3 w-60">
                        <button
                          className="px-4 py-1 rounded-lg bg-blue-500 text-white"
                          onClick={() => onSubmitWeekOff(staff)}
                        >
                          Save
                        </button>
                        <button
                          className="px-4 py-1 rounded-lg  bg-gray-400 text-white"
                          onClick={() => {
                            setStaffList(
                              staffList.map((ele) => {
                                if (ele.id === staff.id) {
                                  ele.weekOff = [...tempStaff[ele.id]];
                                }
                                return ele;
                              })
                            );
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    {staff.isExpend && (
                      <div className="space-x-2 flex justify-between border-t-2 py-2">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className={
                              "flex w-full items-center justify-center p-3 bg-white border-2 rounded-lg shadow hover:bg-gray-100"
                            }
                          >
                            <input
                              type="checkbox"
                              checked={
                                staff?.weekOff?.includes(day.toLowerCase()) ||
                                false
                              }
                              onChange={(e) => {
                                const updatedData = staffList.map((ele) => {
                                  if (ele.id === staff.id) {
                                    if (!ele.weekOff) {
                                      ele.weekOff = [];
                                    }
                                    if (e.target.checked) {
                                      ele.weekOff.push(day.toLowerCase());
                                    } else {
                                      ele.weekOff = ele.weekOff.filter(
                                        (ele) => ele !== day.toLowerCase()
                                      );
                                    }
                                  }
                                  return ele;
                                });
                                setStaffList(updatedData);
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="ml-2">{day}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
        )}

        {selectedLevel === "Business Level" && (
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold mb-4">
                Select Company's Week Offs
              </h3>
              {isDataUpdated(selectedWeekDays, previousWeekDays) && (
                <div className="space-x-3">
                  <button
                    className="px-4 py-1 rounded-lg bg-blue-500 text-white"
                    onClick={onSubmitCompanyWeekOff}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-1 rounded-lg  bg-gray-400 text-white"
                    onClick={() => {
                      setSelectedWeekDays(previousWeekDays);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="space-x-2 flex justify-between">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="flex w-full items-center p-3 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedWeekDays.includes(day.toLowerCase())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedWeekDays((val) => [
                          ...val,
                          day.toLowerCase(),
                        ]);
                      } else {
                        setSelectedWeekDays(
                          selectedWeekDays.filter(
                            (ele) => ele !== day.toLowerCase()
                          )
                        );
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm">{day}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekOff;
