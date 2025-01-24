import { doc, Timestamp } from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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

function StockSidebar({ isModalOpen, onClose, userDataSet, refresh }) {
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

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getFullYear}-${getMonth}-${getDate}`;
  }

  function onHandleSelectUser(e) {
    const { value } = e.target;
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

  async function onSubmit() {
    return;
    // try {
    //   const companyRef = doc(db, "companies", companyId);

    //   const projectRef = doc(db, "projects", id);

    //   let bookRef;

    //   const docSnap = await getDoc(projectRef);

    //   if (docSnap.exists()) {
    //     bookRef = docSnap.data()?.book?.bookRef || null;
    //   }

    //   const payload = {
    //     ...formData,
    //     companyRef,
    //     bookRef,
    //     projectRef,
    //     transactionType: isModalOpen.type,
    //   };
    //   if (updateData?.id) {
    //     await updateDoc(
    //       doc(db, "companies", companyId, "expenses", updateData.id),
    //       payload
    //     );
    //   } else {
    //     await addDoc(
    //       collection(db, "companies", companyId, "expenses"),
    //       payload
    //     );
    //   }
    //   alert(
    //     `successfully  ${updateData?.id ? "Edit " : "Create "} ${
    //       isModalOpen.type
    //     }`
    //   );

    //   ResetForm();
    //   refresh();
    //   onClose();
    // } catch (error) {
    //   console.log("🚀 ~ onSubmit ~ error:", error);
    // }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isModalOpen.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        onClose();
        ResetForm();
      }}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform  ${
          isModalOpen.isOpen ? "translate-x-0" : "translate-x-full"
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
                Quantity <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="Number"
                  placeholder="Amount"
                  className="input-tag w-full"
                  required
                  value={formData.stock || ""}
                  onChange={(e) => {
                    setFormData((val) => ({
                      ...val,
                      stock: +e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
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
                Purchase Price <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="Number"
                  placeholder="Purchase Price"
                  className="input-tag w-full"
                  required
                  value={formData.purchasePrice || ""}
                  onChange={(e) => {
                    setFormData((val) => ({
                      ...val,
                      purchasePrice: +e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="Number"
                  placeholder=" Selling Price"
                  className="input-tag w-full"
                  required
                  value={formData.sellingPrice || ""}
                  onChange={(e) => {
                    setFormData((val) => ({
                      ...val,
                      sellingPrice: +e.target.value,
                    }));
                  }}
                />
              </div>
            </div>

            {/* <div className="space-y-1">
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
            </div> */}

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
              Create {isModalOpen.type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
StockSidebar.propTypes = {
  isModalOpen: PropTypes.object,
  onClose: PropTypes.func,
  userDataSet: PropTypes.object,
  refresh: PropTypes.func,
};

export default StockSidebar;
