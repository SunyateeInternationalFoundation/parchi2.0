import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Attendance({ attendanceData }) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [calender, setCalender] = useState([]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Render the days of the month
  useEffect(() => {
    const renderDays = () => {
      const cells = [];
      let dayCounter = 1;

      for (let week = 0; week < 6; week++) {
        const row = [];

        for (let day = 0; day < 7; day++) {
          if (week === 0 && day < firstDay) {
            row.push(<div key={`empty-${day}`} className="h-16 border"></div>);
          } else if (dayCounter <= daysInMonth) {
            const date = `${String(dayCounter).padStart(2, "0")}${String(
              currentMonth + 1
            ).padStart(2, "0")}${currentYear}`;
            const dayStatus =
              attendanceData.find((ele) => ele.attendanceId == date) || null;

            row.push(
              <div className=" border">
                <div
                  key={dayCounter}
                  className={`h-16 p-2  items-center justify-center ${
                    dayStatus?.status === "present"
                      ? "bg-green-200 text-green-800"
                      : dayStatus?.status === "absent"
                      ? "bg-red-200 text-red-800"
                      : dayStatus?.status === "leave"
                      ? "bg-red-200 text-red-800"
                      : dayStatus?.status === "holiday"
                      ? "bg-yellow-200 text-red-800"
                      : ""
                  }`}
                >
                  <div className="flex space-x-5">
                    <div className="text-black">{dayCounter}</div>
                    <div className="text-sm uppercase font-bold">
                      {dayStatus?.status}
                    </div>
                  </div>
                  {dayStatus?.status && (
                    <div>
                      <div className="text-sm">Shift: {dayStatus?.shift}</div>
                    </div>
                  )}
                </div>
              </div>
            );
            dayCounter++;
          } else {
            row.push(
              <div
                key={`empty-${day + week * 7}`}
                className="h-16 border"
              ></div>
            );
          }
        }
        cells.push(
          <div key={`week-${week}`} className="grid grid-cols-7 gap-0">
            {row}
          </div>
        );
      }
      setCalender(cells);
    };
    renderDays();
  }, [attendanceData, currentMonth, currentYear]);

  return (
    <div className="p-8">
      <div className="p-8 bg-white rounded-lg ">
        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() =>
              setCurrentMonth((prev) =>
                prev === 0 ? (setCurrentYear(currentYear - 1), 11) : prev - 1
              )
            }
          >
            <FaChevronLeft />
          </button>
          <h1 className="text-2xl font-bold text-center my-4">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </h1>
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() =>
              setCurrentMonth((prev) =>
                prev === 11 ? (setCurrentYear(currentYear + 1), 0) : prev + 1
              )
            }
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 text-center font-bold border-b">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          {calender}
        </div>
      </div>
    </div>
  );
}

Attendance.propTypes = {
  attendanceData: PropTypes.array,
};

export default Attendance;
