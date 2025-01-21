import PropTypes from "prop-types";

function DateTimeFormate(timestamp) {
  if (!timestamp?.seconds) {
    return;
  }
  const milliseconds =
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  const date = new Date(milliseconds);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" }); // 'Jan', 'Feb', etc.
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  const payload = {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes} ${ampm}`,
  };
  return payload;
}

DateTimeFormate.propTypes = {
  timestamp: PropTypes.shape({
    seconds: PropTypes.number.isRequired,
    nanoseconds: PropTypes.number.isRequired,
  }).isRequired,
};

export default DateTimeFormate;
