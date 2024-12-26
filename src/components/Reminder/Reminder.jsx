import React, { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";

function Reminder() {
  const [activeTab, setActiveTab] = useState("Reminder");
  const [reminders, setReminders] = useState([]);
  const [formData, setFormData] = useState({
    reminderName: "",
    reminderTime: "",
    priority: "Low",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState([]);
  const [sortOption, setSortOption] = useState("time"); // Sorting by time or name

  const userDetails = useSelector((state) => state.users);
  const userRef = doc(db, "users", userDetails.userId);

  // Fetch reminders from Firestore
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const reminderRef = collection(db, "reminder");
      const q = query(reminderRef, where("userRef", "==", userRef));
      const getReminders = await getDocs(q);
      const remindersData = getReminders.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReminders(remindersData);
      setError("");
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError("Failed to fetch reminders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Add new reminder
  const onAddReminder = async () => {
    if (!formData.reminderName || !formData.reminderTime) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const payload = {
        ...formData,
        reminderTime: Timestamp.fromDate(new Date(formData.reminderTime)),
        createdAt: Timestamp.fromDate(new Date()),
        userRef: userRef.path,
        incomplete: true,
      };
      const docRef = await addDoc(collection(db, "reminder"), payload);
      setReminders((prevReminders) => [
        ...prevReminders,
        { id: docRef.id, ...payload },
      ]);
      setFormData({ reminderName: "", reminderTime: "", priority: "Low" });
      setError("");
    } catch (err) {
      console.error("Error adding reminder:", err);
      setError("Failed to add reminder. Please try again.");
    }
  };

  // Update reminder completion status
  const onUpdateReminder = async (id, incomplete) => {
    try {
      await updateDoc(doc(db, "reminder", id), { incomplete });
      setReminders((prevReminders) =>
        prevReminders.map((reminder) =>
          reminder.id === id ? { ...reminder, incomplete } : reminder
        )
      );
      setError("");
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError("Failed to update reminder. Please try again.");
    }
  };

  // Delete reminder with fade-out animation
  const onDeleteReminder = (id) => {
    setDeleting((prev) => [...prev, id]);
    setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "reminder", id));
        setReminders((prevReminders) =>
          prevReminders.filter((reminder) => reminder.id !== id)
        );
        setDeleting((prev) => prev.filter((itemId) => itemId !== id));
      } catch (err) {
        console.error("Error deleting reminder:", err);
        setError("Failed to delete reminder. Please try again.");
      }
    }, 300);
  };

  // Sort reminders
  const sortedReminders = reminders.sort((a, b) => {
    if (sortOption === "time") {
      return a.reminderTime - b.reminderTime;
    }
    return a.reminderName.localeCompare(b.reminderName);
  });

  // Calculate progress
  const completedCount = reminders.filter((item) => !item.incomplete).length;
  const totalCount = reminders.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full p-4">
      <style>
        {`
          .reminder-item {
            transition: opacity 0.3s ease, transform 0.3s ease;
            opacity: 1;
            transform: translateY(0);
          }

          .reminder-item.deleting {
            opacity: 0;
            transform: translateY(-10px);
          }
        `}
      </style>

      <nav className="flex space-x-4 mt-3 mb-3">
        {["Reminder", "Completed"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-1 ${
              activeTab === tab ? "bg-blue-700 text-white rounded-full" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex justify-between items-center mb-4">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="time">Sort by Time</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {activeTab === "Reminder" && (
        <div>
          <h1 className="text-2xl font-bold mb-5">Add Reminder</h1>
          <div className="flex space-x-4 items-center bg-white p-4 rounded-lg">
            <input
              type="text"
              placeholder="Reminder Name"
              className="w-full border-2 p-2 rounded-lg"
              value={formData.reminderName}
              onChange={(e) =>
                setFormData({ ...formData, reminderName: e.target.value })
              }
            />
            <input
              type="datetime-local"
              className="w-full border-2 p-2 rounded-lg"
              value={formData.reminderTime}
              onChange={(e) =>
                setFormData({ ...formData, reminderTime: e.target.value })
              }
            />
            <select
              className="w-full border-2 p-2 rounded-lg"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onAddReminder}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading reminders...</p>
      ) : (
        <div className="mt-4">
          <ul className="mt-2">
            {sortedReminders
              .filter((item) =>
                activeTab === "Reminder" ? item.incomplete : !item.incomplete
              )
              .map((item) => (
                <li
                  key={item.id}
                  className={`reminder-item flex justify-between items-center p-2 bg-white rounded-lg mt-2 ${
                    deleting.includes(item.id) ? "deleting" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={!item.incomplete}
                      onChange={() =>
                        onUpdateReminder(item.id, !item.incomplete)
                      }
                    />
                    <div>
                      <p
                        className={`${
                          item.incomplete ? "" : "line-through"
                        } font-bold`}
                      >
                        {item.reminderName}{" "}
                        <span className="text-sm italic text-gray-500">
                          ({item.priority})
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDeleteReminder(item.id)}
                  >
                    <RiDeleteBin6Line />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Reminder;
