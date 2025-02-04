import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
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

function TransferSidebar({
  isSideBarOpen,
  onClose,
  updateData,
  productDetails,
  refresh,
}) {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [warehouse, setWarehouse] = useState([]);
  const [formData, setFormData] = useState({
    date: Timestamp.fromDate(new Date()),
    quantity: 0,
    from: productDetails?.warehouse || "",
    to: "",
    name: "",
  });

  function ResetForm() {
    setFormData({
      date: Timestamp.fromDate(new Date()),
      quantity: 0,
      from: productDetails?.warehouse || "",
      to: "",
    });
  }

  useEffect(() => {
    async function fetchWarehouse() {
      try {
        const warehouseRef = collection(
          db,
          "companies",
          companyId,
          "warehouses"
        );
        const getData = await getDocs(warehouseRef);
        const responseData = getData.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setWarehouse(responseData);
      } catch (err) {
        console.log("🚀 ~ fetchWarehouse ~ err:", err);
      }
    }
    fetchWarehouse();
  }, []);

  useEffect(() => {
    if (updateData?.id) {
      setFormData(updateData);
    }
  }, [updateData]);

  async function onSubmit(e) {
    try {
      e.preventDefault();
      const companyRef = doc(db, "companies", companyId);
      const payload = {
        ...formData,
        companyRef,
        name: productDetails.name,
        who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
      };
      let transferLog = {
        ref: "",
        date: serverTimestamp(),
        section: "Inventory",
        action: "Create",
        description: "",
      };

      let docId = "";
      if (updateData?.id) {
        docId = updateData?.id;
        const tranRef = doc(
          db,
          "companies",
          companyId,
          "products",
          id,
          "transfers",
          updateData.id
        );
        await updateDoc(tranRef, payload);
        transferLog.ref = tranRef;
        transferLog.action = "Update";
        transferLog.description = `${formData.name} transfer updated`;
      } else {
        const newDocRef = await addDoc(
          collection(db, "companies", companyId, "products", id, "transfers"),
          payload
        );
        docId = newDocRef.id;
        transferLog.ref = newDocRef;
        transferLog.action = "Create";
        transferLog.description = `${formData.name} transfer created`;
      }
      await addDoc(
        collection(db, "companies", companyId, "audit"),
        transferLog
      );
      alert(`successfully  ${updateData?.id ? "Edit " : "Create "} `);
      ResetForm({ id: docId, ...payload });
      refresh();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isSideBarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        onClose();
        ResetForm();
      }}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform  ${
          isSideBarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-sm text-gray-600 ">Transfers</h2>
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
              <label className="text-sm text-gray-600 ">Date</label>
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
              <label className="text-sm text-gray-600 ">Quantity</label>
              <div>
                <input
                  type="Number"
                  placeholder="Quantity"
                  className="input-tag w-full"
                  required
                  value={formData.quantity || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (+value > productDetails.stock) {
                      alert("Out of Stock");
                      return;
                    }
                    setFormData((val) => ({
                      ...val,
                      quantity: +value,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">From</label>
              <Select
                value={formData.from ?? ""}
                onValueChange={(val) => {
                  setFormData((pre) => ({
                    ...pre,
                    from: val,
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select From" />
                </SelectTrigger>
                <SelectContent>
                  {warehouse
                    .filter((item) => item.name !== formData.to)
                    .map((ele) => (
                      <SelectItem value={ele.name} key={ele.id}>
                        {ele.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">To</label>
              <Select
                value={formData.to ?? ""}
                onValueChange={(val) => {
                  setFormData((pre) => ({
                    ...pre,
                    to: val,
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select To" />
                </SelectTrigger>
                <SelectContent>
                  {warehouse
                    .filter((item) => item.name !== formData.from)
                    .map((ele, index) => (
                      <SelectItem value={ele.name} key={index}>
                        {ele.name}
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
              {updateData?.id ? "Edit" : "Create"} Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferSidebar;
