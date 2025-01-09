import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

function Reminder() {
  const [activeTab, setActiveTab] = useState("Reminder");
  const [reminders, setReminders] = useState([]);
  const [formData, setFormData] = useState({
    reminderName: "",
    reminderTime: "",
    priority: "Low",
    isComplete: false,
  });
  const [loading, setLoading] = useState(false);

  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  const companyRef = doc(db, "companies", companyDetails.companyId);

  // Fetch reminders from Firestore
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const reminderRef = collection(db, "reminder");
      const q = query(reminderRef, where("companyRef", "==", companyRef));
      const getReminders = await getDocs(q);
      const remindersData = getReminders.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReminders(remindersData);
    } catch (err) {
      console.error("Error fetching reminders:", err);
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
      alert("Please fill in all fields.");
      return;
    }
    try {
      const payload = {
        ...formData,
        reminderTime: Timestamp.fromDate(new Date(formData.reminderTime)),
        createdAt: Timestamp.fromDate(new Date()),
        companyRef: companyRef,
        companyName: companyDetails.name,
        username: userDetails.name,
        phone: companyDetails.phone || userDetails.phone,
        email: companyDetails.email || userDetails.email,
      };
      const docRef = await addDoc(collection(db, "reminder"), payload);
      setReminders((prevReminders) => [
        ...prevReminders,
        { id: docRef.id, ...payload },
      ]);
      setFormData({
        reminderName: "",
        reminderTime: "",
        priority: "Low",
        isComplete: false,
      });
      alert("successfully added Remainder");
    } catch (err) {
      console.error("Error adding reminder:", err);
    }
  };

  // Update reminder completion status
  const onUpdateReminder = async (id, isComplete) => {
    try {
      await updateDoc(doc(db, "reminder", id), { isComplete });
      setReminders((prevReminders) =>
        prevReminders.map((reminder) =>
          reminder.id === id ? { ...reminder, isComplete } : reminder
        )
      );
    } catch (err) {
      console.error("Error updating reminder:", err);
    }
  };

  // Delete reminder with fade-out animation
  const onDeleteReminder = async (id) => {
    try {
      await deleteDoc(doc(db, "reminder", id));
      setReminders((prevReminders) =>
        prevReminders.filter((reminder) => reminder.id !== id)
      );
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  return (
    <div className="main-container " style={{ height: "92vh" }}>
      <h1 className="text-2xl font-bold pb-3 ">Reminder</h1>
      <div className="container">
        <div className=" p-5 ">
          <nav className="flex space-x-4">
            {["Reminder", "Completed"].map((tab) => (
              <button
                key={tab}
                className={`btn-outline-black ${
                  activeTab === tab && " bg-black text-white "
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        {activeTab === "Reminder" && (
          <div>
            <div className="flex space-x-4 items-center bg-white p-4 rounded-lg">
              <input
                type="text"
                placeholder="Reminder Name"
                className="w-full input-tag"
                value={formData.reminderName}
                onChange={(e) =>
                  setFormData({ ...formData, reminderName: e.target.value })
                }
              />
              <input
                type="datetime-local"
                className="w-full input-tag"
                value={formData.reminderTime}
                onChange={(e) =>
                  setFormData({ ...formData, reminderTime: e.target.value })
                }
              />
              <select
                className="w-full input-tag"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button className="btn-add" onClick={onAddReminder}>
                Add
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <div className="" style={{ height: "82vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    #
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Date
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Name
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    priority
                  </td>
                  <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                    Delete
                  </td>
                </tr>
              </thead>
              <tbody>
                {reminders.length > 0 ? (
                  reminders
                    .filter((item) =>
                      activeTab === "Reminder"
                        ? !item.isComplete
                        : item.isComplete
                    )
                    .map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 text-start "
                      >
                        <td className="px-8 py-3 ">
                          <input
                            type="checkbox"
                            checked={item.isComplete}
                            className="w-5 h-5"
                            onChange={() =>
                              onUpdateReminder(item.id, !item.isComplete)
                            }
                          />
                        </td>
                        <td className="px-5 py-3   text-start">
                          <FormatTimestamp timestamp={item.reminderTime} />
                        </td>
                        <td className="px-5 py-3   text-start">
                          {item.reminderName}
                        </td>
                        <td className="px-5 py-3   text-start">
                          {item.priority}
                        </td>

                        <td className="px-12 py-3 text-end">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => onDeleteReminder(item.id)}
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="h-24 text-center py-4">
                      No Reminder found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reminder;
