import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../firebase";
import { cn, formatDate } from "../../../lib/utils";
import { Calendar } from "../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../UI/popover";

function SetHoliday({ isOpen, onClose, onAddHoliday, companyId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
  });

  async function onCreateHoliday(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { name } = formData;

      if (!name.trim()) {
        alert("Holiday name is required");
        setIsLoading(false);
        return;
      }

      const payload = {
        ...formData,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const holidayRef = await addDoc(
        collection(db, "companies", companyId, "holidays"),
        payload
      );
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: holidayRef,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Create",
        description: `${name} holiday created`,
      });
      onAddHoliday({ id: holidayRef.id, ...payload });
      alert("Holiday successfully created!");
      setFormData({
        name: "",
        date: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating Holiday:", error);
      alert("Failed to create Holiday. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-xl font-semibold mb-5 ">Holiday Details</h2>
          <button
            onClick={onClose}
            className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onCreateHoliday}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Holiday Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, name: e.target.value }))
                }
                className="input-tag w-full"
                placeholder="Holiday Name"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm block font-semibold mt-2">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex justify-between items-center input-tag ",
                      !formData.date?.seconds && "text-muted-foreground"
                    )}
                  >
                    {formData.date?.seconds ? (
                      formatDate(
                        new Date(
                          formData.date?.seconds * 1000 +
                            formData.date?.nanoseconds / 1000000
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
                        formData.date?.seconds * 1000 +
                          formData.date?.nanoseconds / 1000000
                      )
                    }
                    onSelect={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        date: Timestamp.fromDate(new Date(val)),
                      }));
                    }}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {isLoading ? "Adding..." : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetHoliday;
