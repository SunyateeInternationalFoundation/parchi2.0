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
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

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
      setTotalPages(Math.ceil(remindersData.length / 10));
      setPaginationData(remindersData.slice(0, 10));

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
  useEffect(() => {
    setPaginationData(reminders.slice(currentPage * 10, currentPage * 10 + 10));
  }, [currentPage, reminders]);

  return (
    <div className="main-container " style={{ height: "92vh" }}>
      <h1 className="text-2xl font-bold  mt-4 py-3">Reminder</h1>
      <div className="container">
        <nav className="flex space-x-4  px-5">
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
        {activeTab === "Reminder" && (
          <div>
            <div className="flex space-x-4 items-center bg-white p-5 rounded-lg">
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

              <Select
                defaultValue={"Low"}
                onValueChange={(val) => {
                  setFormData({ ...formData, priority: val });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=" Select PurchasePriceTaxType" />
                </SelectTrigger>
                <SelectContent className="h-18">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <button className="btn-add" onClick={onAddReminder}>
                Add
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <div className="py-3" style={{ height: "92vh" }}>
            <table className="w-full border-collapse text-start ">
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
                {paginationData.length > 0 ? (
                  paginationData
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
    </div>
  );
}

export default Reminder;
