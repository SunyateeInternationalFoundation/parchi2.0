import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";
import { cn, formatDate } from "../../../lib/utils";
import { Calendar } from "../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

function CreateStaff({ isOpen, onClose, staffAdded, staffData }) {
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    companyRef: "",
    dateOfJoining: Timestamp.fromDate(new Date()),
    designation: "",
    emailId: "",
    idNo: "",
    isDailyWages: false,
    name: "",
    panNumber: "",
    paymentDetails: 0,
    phone: "",
    branch: "",
  });
  const [designations, setDesignations] = useState([]);
  const [phoneExists, setPhoneExists] = useState(false);
  const [idExists, setIdExists] = useState(false);
  const [branches, setBranches] = useState([]);

  const handlePhoneNumberChange = async (event) => {
    try {
      const inputValue = event.target.value;
      const isValidPhoneNumber = /^\d{0,10}$/.test(inputValue);

      if (isValidPhoneNumber) {
        setFormData((val) => ({ ...val, phone: event.target.value }));

        const staffRef = collection(db, "staff");
        const q = query(staffRef, where("phone", "==", inputValue));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setPhoneExists(true);
        } else {
          setPhoneExists(false);
        }
      }
    } catch (err) {
      console.log("Error in handle Phone number:", err);
    }
  };

  const handleIdNumberChange = async (event) => {
    const inputValue = event.target.value;
    setFormData((val) => ({ ...val, idNo: inputValue }));

    const staffRef = collection(db, "staff");
    const q = query(staffRef, where("idNo", "==", inputValue));
    const querySnapshot = await getDocs(q);

    setIdExists(!querySnapshot.empty);
  };

  const fetchDesignation = async () => {
    try {
      const companyRef = doc(db, "companies", companyId);

      const designationRef = collection(db, "designations");

      const q = query(designationRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const designationData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDesignations(designationData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchBranch = async () => {
    try {
      const companyRef = doc(db, "companies", companyId);

      const designationRef = collection(db, "branches");

      const q = query(designationRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const branchData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  useEffect(() => {
    fetchDesignation();
    fetchBranch();
  }, []);

  useEffect(() => {
    if (staffData?.id) {
      setFormData(staffData);
    }
  }, [staffData, branches, designations]);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      if (staffData?.id) {
        const staffsRef = doc(db, "staff", staffData.id);
        const { id, ...rest } = formData;
        await updateDoc(staffsRef, rest);
      } else {
        const companyRef = doc(db, "companies", companyId);
        const payload = { ...formData, companyRef, status: "Active" };
        await addDoc(collection(db, "staff"), payload);
        alert("Successfully Created Staff");
      }

      staffAdded();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  }
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
          <h2 className="text-xl font-semibold ">
            {staffData?.id ? "Edit" : "Create"}
            Staff
          </h2>
          <button
            onClick={onClose}
            className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="grid w-full mb-2 items-center gap-1.5">
              <div className="text-sm text-gray-600 ">Profile Image</div>
              <label
                htmlFor="file"
                className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
              >
                <div className="flex  items-center justify-center gap-1">
                  <>
                    <svg viewBox="0 0 640 512" className="h-8 fill-gray-600">
                      <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                    </svg>
                    <span className="py-1 px-4">Upload Image</span>
                  </>
                </div>
                <input id="file" type="file" className="hidden" />
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Name"
                className="w-full input-tag"
                placeholder="Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Phone<span className="text-red-500">*</span>
                {/* {phoneExists && (
                <span className="ml-2 text-red-500 text-xs">
                  "Phone number is already in use.*"
                </span>
              )} */}
              </label>
              <div className="flex items-center mb-4">
                <span className="border px-5 py-3  rounded-l-md">+91</span>
                <input
                  type="text"
                  maxLength="10"
                  value={formData.phone}
                  onChange={(e) => handlePhoneNumberChange(e)}
                  placeholder="Enter your mobile number"
                  className="border px-5 py-3 w-full rounded-r-md"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">
                ID No.
                {idExists && (
                  <span className="ml-2 text-red-500 text-xs">
                    "Already ID No. exist"
                  </span>
                )}
              </label>
              <input
                type="text"
                name="idNo"
                value={formData.idNo}
                className="w-full input-tag"
                placeholder="ID No."
                onChange={handleIdNumberChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Joining Date<span className="text-red-500">*</span>
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex justify-between items-center input-tag ",
                      !formData.dateOfJoining?.seconds &&
                      "text-muted-foreground"
                    )}
                  >
                    {formData.dateOfJoining?.seconds ? (
                      formatDate(
                        new Date(
                          formData.dateOfJoining?.seconds * 1000 +
                          formData.dateOfJoining?.nanoseconds / 1000000
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
                        formData.dateOfJoining?.seconds * 1000 +
                        formData.dateOfJoining?.nanoseconds / 1000000
                      )
                    }
                    onSelect={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        dateOfJoining: Timestamp.fromDate(new Date(val)),
                      }));
                    }}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Email</label>
              <input
                type="email"
                name="Email"
                className="w-full input-tag"
                placeholder="Email"
                value={formData.emailId}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, emailId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Address</label>
              <input
                type="text"
                name="Address"
                className="w-full input-tag"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, address: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                name="City"
                className="w-full input-tag"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, city: e.target.value }))
                }
              />
              <input
                type="text"
                name="PinCode"
                className="w-full input-tag"
                placeholder="PinCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, zipCode: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Branch</label>

              <Select
                value={formData?.branch || ""}
                onValueChange={(value) => {
                  setFormData((pre) => ({
                    ...pre,
                    branch: value,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length > 0 &&
                    branches.map((branch) => (
                      <SelectItem
                        key={branch.branchName}
                        value={branch.branchName}
                      >
                        {branch.branchName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Designation</label>

              <Select
                value={formData?.designation || ""}
                onValueChange={(value) => {
                  setFormData((pre) => ({
                    ...pre,
                    designation: value,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={"Select Designation"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {designations.length > 0 &&
                    designations.map((designation) => (
                      <SelectItem
                        key={designation.designationName}
                        value={designation.designationName}
                      >
                        {designation.designationName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">PAN</label>
              <input
                type="text"
                name="PAN"
                value={formData.panNumber}
                className="w-full input-tag"
                placeholder="PAN"
                onChange={(e) =>
                  setFormData((val) => ({ ...val, panNumber: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="space-y-1">Daily Wage?</div>
              <div className="space-y-1">
                <label className="relative inline-block w-14 h-7">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isDailyWages}
                    onChange={(e) =>
                      setFormData((val) => ({
                        ...val,
                        isDailyWages: e.target.checked,
                      }))
                    }
                  />
                  <span className="absolute cursor-pointer inset-0 bg-[#9fccfa] rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] peer-focus:ring-2 peer-focus:ring-[#0974f1] peer-checked:bg-[#0974f1]"></span>
                  <span className="absolute top-0 left-0  h-7 w-7 bg-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center peer-checked:translate-x-[1.6em]"></span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Payment Details</label>
              <input
                type="text"
                name="paymentDetails"
                className="w-full input-tag"
                placeholder="paymentDetails"
                value={formData.paymentDetails}
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    paymentDetails: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {staffData?.id ? "Edit" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStaff;
