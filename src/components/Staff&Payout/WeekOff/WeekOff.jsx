import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";
import { db } from "../../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { updateCompanyDetails } from "../../../store/UserSlice";

const WeekOff = () => {
  const [selectedWeekDays, setSelectedWeekDays] = useState([]);
  const [previousWeekDays, setPreviousWeekDays] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("Staff Level");
  const [isCalendarMonth, setIsCalendarMonth] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [tempStaff, setTempStaff] = useState({});
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
      await updateDoc(doc(db, "staff", staff.id), { weekOff: staff.weekOff });
      setTempStaff((val) => ({ ...val, [staff.id]: staff.weekOff }));
    } catch (error) {
      console.log("🚀 ~ onSubmitWeekOff ~ error:", error);
    }
  }

  async function onSubmitCompanyWeekOff() {
    try {
      const payload = { weekOff: selectedWeekDays };
      updateDoc(doc(db, "companies", companyDetails.companyId), payload);
      dispatch(
        updateCompanyDetails({ ...companyDetails, weekOff: selectedWeekDays })
      );
      setPreviousWeekDays(selectedWeekDays);
    } catch (error) {
      console.log("🚀 ~ onSubmitCompanyWeekDay ~ error:", error);
    }
  }

  function isDataUpdated(array1, array2) {
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
      await updateDoc(doc(db, "companies", companyDetails.companyId), {
        isCalendarMonth: value,
      });
      setIsCalendarMonth(value);
      dispatch(
        updateCompanyDetails({ ...companyDetails, isCalendarMonth: value })
      );
    } catch (error) {
      console.log("🚀 ~ onChangeIsCalendarMonth ~ error:", error);
    }
  }
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center my-2">
        <div className="flex items-center">
          <Link
            to={"./../"}
            className="flex items-center text-gray-700 py-1 px-4 rounded-full hover: transition duration-200"
          >
            <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold">Week Off Preferences</h1>
        </div>
      </header>

      <div className="flex gap-4">
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

      <div className="flex gap-4 my-3">
        {["Staff Level", "Business Level"].map((level) => (
          <button
            key={level}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedLevel === level
                ? "bg-green-500 text-white"
                : "bg-gray-200"
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
            {staffList.map((staff) => (
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
                      setSelectedWeekDays((val) => [...val, day.toLowerCase()]);
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
  );
};

export default WeekOff;
