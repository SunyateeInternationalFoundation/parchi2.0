import {
  addDoc,
  collection,
  Timestamp,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../firebase";
import { formatDate } from "../../../lib/utils";
import { Calendar } from "../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

function SidebarLoans({
  isOpen,
  onClose,
  onAddLoan,
  companyId,
  loanDataToEdit,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [formData, setFormData] = useState({
    staff: "",
    date: null, // Will hold the selected date
    amount: "",
    financialOption: "Loans", // Default value
    paymentSchedule: "Month", // Default value
  });

  const [calendarOpen, setCalendarOpen] = useState(false);

  // If there's data passed to edit, populate the form with that data
  useEffect(() => {
    if (loanDataToEdit) {
      setFormData({
        staff: loanDataToEdit.staff || "", // Ensure this matches the value used in dropdown options
        date: loanDataToEdit.date,
        amount: loanDataToEdit.amount,
        financialOption: loanDataToEdit.financialOption,
        paymentSchedule: loanDataToEdit.paymentSchedule,
      });
    } else {
      // Set default date when no data to edit
      setFormData((prev) => ({
        ...prev,
        date: Timestamp.fromDate(new Date()), // Default to current date
        staff: "", // Reset staff to default if no loan data to edit
      }));
    }
  }, [loanDataToEdit]); // Run only when loanDataToEdit changes

  useEffect(() => {
    // Fetch staff data when the component mounts
    async function fetchStaffData() {
      try {
        const companyRef = doc(db, "companies", companyId);
        const q = query(
          collection(db, "staff"),
          where("companyRef", "==", companyRef)
        );
        const getData = await getDocs(q);
        setStaffData(
          getData.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    }
    fetchStaffData();
  }, [companyId]);

  const onSaveLoan = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true);

    try {
      // Validate the required fields
      if (!formData.staff || !formData.amount || !formData.financialOption) {
        alert("Please fill all required fields");
        setIsLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        ...formData,
        createdAt: Timestamp.fromDate(new Date()), // Store creation timestamp
      };

      if (loanDataToEdit) {
        // Update existing loan record
        const loanRef = doc(
          db,
          "companies",
          companyId,
          "loans",
          loanDataToEdit.id
        );
        await updateDoc(loanRef, payload); // Update the loan in the database
        alert("Loan successfully updated!");
      } else {
        // Add new loan record
        const loanRef = await addDoc(
          collection(db, "companies", companyId, "loans"),
          payload
        );
        onAddLoan({ id: loanRef.id, ...payload }); // Pass the new loan data back
        alert("Loan successfully added!");
      }

      // Reset form data after successful operation
      setFormData({
        staff: "",
        date: Timestamp.fromDate(new Date()), // Reset to today's date
        amount: "",
        financialOption: "Loans", // Reset to default
        paymentSchedule: "Month", // Reset to default
      });

      onClose(); // Close the sidebar after saving
    } catch (error) {
      console.error("Error adding/updating loan:", error);
      alert("Failed to add/update loan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white shadow-lg transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            {loanDataToEdit ? "Edit Loan" : "Add Loan"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            <IoMdClose />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSaveLoan}
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Staff Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Staff</label>
            <Select
              value={formData.staff}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, staff: value }))
              }
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select Staff" />
              </SelectTrigger>
              <SelectContent>
                {staffData.map((staff) => (
                  <SelectItem key={staff.id} value={staff.name}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Financial Option */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Financial Option
            </label>
            <div className="flex justify-between space-x-3">
              {["Loans", "Deductions", "Advance"].map((option) => (
                <label
                  key={option}
                  className={`px-5 py-2 border rounded-lg cursor-pointer text-center flex-1 transition-all ${
                    formData.financialOption === option
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="financialOption"
                    value={option}
                    className="hidden"
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        financialOption: option,
                      }))
                    }
                    checked={formData.financialOption === option}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex justify-between items-center border px-4 py-2 rounded-lg bg-white">
                  {formData.date?.seconds ? (
                    formatDate(
                      new Date(
                        formData.date.seconds * 1000 +
                          formData.date.nanoseconds / 1000000
                      ),
                      "PPP"
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={
                    formData.date
                      ? new Date(
                          formData.date.seconds * 1000 +
                            formData.date.nanoseconds / 1000000
                        )
                      : new Date() // Default to today's date if no date is selected
                  }
                  onSelect={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      date: Timestamp.fromDate(new Date(val)),
                    }));
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  required
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none border-gray-300"
            />
          </div>

          {/* Payment Schedule */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Payment Schedule
            </label>
            <div className="flex justify-between space-x-3">
              {["Month", "Week", "At a Time"].map((option) => (
                <label
                  key={option}
                  className={`px-5 py-2 border rounded-lg cursor-pointer text-center flex-1 transition-all ${
                    formData.paymentSchedule === option
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentSchedule"
                    value={option}
                    className="hidden"
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentSchedule: option,
                      }))
                    }
                    checked={formData.paymentSchedule === option}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </form>

        {/* Bottom Button */}
        <div className="border-t bg-white p-6 fixed bottom-0 w-full shadow-lg">
          <button
            type="button" // Use 'button' instead of 'submit' to prevent form submission behavior
            onClick={onSaveLoan}
            className="w-full btn-add"
          >
            {
              isLoading
                ? "Saving..."
                : loanDataToEdit
                ? "Save Changes" // Display Save Changes if editing an existing loan
                : "Add Loan" // Display Add Loan if adding a new loan
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default SidebarLoans;
