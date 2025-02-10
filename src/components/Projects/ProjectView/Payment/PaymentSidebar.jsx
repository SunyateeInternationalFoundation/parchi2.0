import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import { cn, formatDate } from "../../../../lib/utils";
import { Calendar } from "../../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../UI/select";

function PaymentSidebar({
  isModalOpen,
  onClose,
  userDataSet,
  refresh,
  projectName,
}) {
  const { id } = useParams();
  const { updateData } = isModalOpen;
  const [filterUser, setFilterUser] = useState("Customer");
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [formData, setFormData] = useState({
    amount: 0,
    bookRef: "",
    category: "",
    companyRef: "",
    date: Timestamp.fromDate(new Date()),
    paymentMode: "",
    projectRef: "",
    remarks: "",
    toWhom: {
      userType: "Customer",
      address: "",
      city: "",
      zipcode: "",
      gstNumber: 0,
      name: "",
      phoneNumber: "",
      userRef: "",
    },
    transactionType: isModalOpen.type,
  });
  const categories = [
    "Food",
    "Advertising",
    "Travel",
    "Education",
    "Health",
    "Insurance",
    "Telephone",
    "Bank fees",
    "Maintenance",
    "Legal & Professional",
    "Utilities",
    "Stationary",
    "Rent",
    "Printing",
    "Raw Material",
    "Licenses",
    "Petty Cash",
    "Furniture",
    "Fixed Assets",
    "Others",
  ];

  function onHandleSelectUser(value) {
    let data = {};
    let userRef = {};
    if (formData.toWhom.userType === "Vendor") {
      data = userDataSet.vendors.find((ele) => ele.id === value);
      userRef = doc(db, "vendors", value);
    } else if (formData.toWhom.userType === "Customer") {
      data = userDataSet.customers.find((ele) => ele.id === value);
      userRef = doc(db, "customers", value);
    } else if (formData.toWhom.userType === "Staff") {
      data = userDataSet.staff.find((ele) => ele.id === value);
      userRef = doc(db, "staff", value);
    }
    const userData = {
      address: data?.address.address || "",
      city: data?.address.city || "",
      zipcode: data?.address.zipcode || "",
      gstNumber: data?.businessDetails?.gst_number || 0,
      name: data.name,
      phoneNumber: data?.phone || 0,
      userRef,
    };
    setFormData((val) => ({
      ...val,
      toWhom: { ...formData.toWhom, ...userData },
    }));
  }

  function ResetForm() {
    setFormData({
      amount: 0,
      bookRef: "",
      category: "",
      companyRef: "",
      date: Timestamp.fromDate(new Date()),
      paymentMode: "",
      projectRef: "",
      remarks: "",
      toWhom: {
        userType: "Customer",
        address: "",
        city: "",
        zipcode: "",
        gstNumber: 0,
        name: "",
        phoneNumber: "",
        userRef: "",
      },
      transactionType: isModalOpen.type,
    });
    setFilterUser("Customer");
  }
  useEffect(() => {
    if (updateData?.id) {
      setFormData(updateData);
      setFilterUser(updateData.toWhom.userType);
    }
  }, [updateData]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const companyRef = doc(db, "companies", companyId);

      const projectRef = doc(db, "projects", id);

      let bookRef;

      const docSnap = await getDoc(projectRef);

      if (docSnap.exists()) {
        bookRef = docSnap.data()?.book?.bookRef || null;
      }

      const payload = {
        ...formData,
        companyRef,
        bookRef,
        projectRef,
        transactionType: isModalOpen.type,
      };
      let expenseLogs = {
        ref: bookRef,
        date: serverTimestamp(),
        section: "Project",
        action: "Create",
        description: `${isModalOpen.type} details created in ${projectName}`,
      };
      if (updateData?.id) {
        const ref = doc(db, "companies", companyId, "expenses", updateData.id);
        await updateDoc(ref, payload);
        expenseLogs.ref = ref;
        expenseLogs.action = "Update";
        expenseLogs.description = `${isModalOpen.type} details updated in ${projectName}`;
      } else {
        const ref = await addDoc(
          collection(db, "companies", companyId, "expenses"),
          payload
        );
        expenseLogs.ref = ref;
      }
      await addDoc(
        collection(db, "companies", companyId, "audit"),
        expenseLogs
      );
      alert(
        `successfully  ${updateData?.id ? "Edit " : "Create "} ${isModalOpen.type
        }`
      );

      ResetForm();
      refresh();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${isModalOpen.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      onClick={() => {
        onClose();
        ResetForm();
      }}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform  ${isModalOpen.isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-sm text-gray-600 ">
            {isModalOpen.type.toUpperCase()}
          </h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={() => {
              onClose();
              ResetForm();
            }}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Date <span className="text-red-500">*</span>
              </label>
              <div>
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
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Amount <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="Number"
                  placeholder="Amount"
                  className="input-tag w-full"
                  required
                  value={formData.amount || ""}
                  onChange={(e) => {
                    setFormData((val) => ({
                      ...val,
                      amount: +e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center space-y-1">
              <div className="text-gray-600">Whom? </div>
              <div className="space-x-3">
                <button
                  type="button"
                  className={
                    "btn-outline-black" +
                    (filterUser === "Customer" ? " bg-black text-white" : "")
                  }
                  onClick={() => {
                    setFilterUser("Customer");
                    setFormData((val) => ({
                      ...val,
                      toWhom: {
                        ...formData.toWhom,
                        userType: "Customer",
                        userRef:
                          val.toWhom.userType == "Customer"
                            ? val.toWhom.userRef
                            : {},
                      },
                    }));
                  }}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={
                    "btn-outline-black " +
                    (filterUser === "Vendor" ? " bg-black text-white" : "")
                  }
                  onClick={() => {
                    setFilterUser("Vendor");
                    setFormData((val) => ({
                      ...val,
                      toWhom: {
                        ...formData.toWhom,
                        userType: "Vendor",
                        userRef:
                          val.toWhom.userType == "Vendor"
                            ? val.toWhom.userRef
                            : {},
                      },
                    }));
                  }}
                >
                  Vendor
                </button>
                <button
                  type="button"
                  className={
                    "btn-outline-black" +
                    (filterUser === "Staff" ? " bg-black text-white" : "")
                  }
                  onClick={() => {
                    setFilterUser("Staff");
                    setFormData((val) => ({
                      ...val,
                      toWhom: {
                        ...formData.toWhom,
                        userType: "Staff",
                        userRef:
                          val.toWhom.userType == "Staff"
                            ? val.toWhom.userRef
                            : {},
                      },
                    }));
                  }}
                >
                  Staff
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                {formData.toWhom.userType}
              </label>
              <div>
                <Select
                  value={formData.toWhom.userRef.id || ""}
                  onValueChange={onHandleSelectUser}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={"Select " + formData.toWhom.userType}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.toWhom.userType === "Customer" &&
                      userDataSet.customers.map((ele) => (
                        <SelectItem value={ele.id} key={ele.id}>
                          {ele.name + " - " + ele.phone}
                        </SelectItem>
                      ))}
                    {formData.toWhom.userType === "Vendor" &&
                      userDataSet.vendors.map((ele) => (
                        <SelectItem value={ele.id} key={ele.id}>
                          {ele.name + " - " + ele.phone}
                        </SelectItem>
                      ))}
                    {formData.toWhom.userType === "Staff" &&
                      userDataSet.staff.map((ele) => (
                        <SelectItem value={ele.id} key={ele.id}>
                          {ele.name + " - " + ele.phone}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Category <span className="text-red-500">*</span>
              </label>
              <div>
                <Select
                  value={formData.category || "Others"}
                  onValueChange={(val) => {
                    setFormData((pre) => ({
                      ...pre,
                      category: val,
                    }));
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((ele, index) => (
                      <SelectItem value={ele} key={index}>
                        {ele}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Remarks</label>
              <div>
                <input
                  type="text"
                  placeholder="Remarks"
                  className="input-tag w-full"
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      remarks: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Receipt</label>
              <div className="grid w-full mb-2 items-center gap-1.5">
                <label
                  htmlFor="file"
                  className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                >
                  <div className="flex  items-center justify-center gap-1">
                    <svg viewBox="0 0 640 512" className="h-8 fill-gray-600">
                      <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                    </svg>
                    <span className="py-1 px-4">Upload Image</span>
                  </div>
                  <input id="file" type="file" className="hidden" />
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Mode</label>
              <Select
                value={formData.paymentMode ?? ""}
                onValueChange={(val) => {
                  setFormData((pre) => ({
                    ...pre,
                    paymentMode: val,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PaymentMode" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Cash",
                    "Emi",
                    "Cheque",
                    "Net Banking",
                    "Credit/Debit Card",
                  ].map((ele, index) => (
                    <SelectItem value={ele} key={index}>
                      {ele}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {updateData?.id ? "Edit" : "Create"} {isModalOpen.type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
PaymentSidebar.propTypes = {
  isModalOpen: PropTypes.object,
  onClose: PropTypes.func,
  userDataSet: PropTypes.object,
  refresh: PropTypes.func,
};

export default PaymentSidebar;
