import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

const CreateServiceList = ({ isOpen, onClose, refresh, service }) => {
  const userDetails = useSelector((state) => state.users);
  const [formData, setFormData] = useState({
    serviceName: "",
    barcode: "",
    sellingPrice: 0,
    sellingPriceTaxType: true,
    discount: 0,
    discountType: true,
    description: "",
    tax: 0,
    monthDuration: "1", // New field for month duration
  });

  function ResetForm() {
    setFormData({
      serviceName: "",
      barcode: "",
      sellingPrice: 0,
      sellingPriceTaxType: true,
      discount: 0,
      discountType: true,
      description: "",
      tax: 0,
      monthDuration: "1", // Reset month duration
    });
  }

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      ResetForm();
    }
  }, [service]);

  const onCreateService = async (e) => {
    e.preventDefault();
    try {
      const companyRef = doc(
        db,
        "companies",
        userDetails.companies[userDetails.selectedCompanyIndex].companyId
      );

      const payload = {
        ...formData,
        companyRef,
      };
      let serviceRef;
      let payloadLog = {
        ref: serviceRef,
        date: serverTimestamp(),
        section: "Subscription Plan",
        action: "Create",
        description: `${formData.serviceName} created`,
      };
      if (service) {
        serviceRef = doc(db, "services", service.id);
        await updateDoc(serviceRef, payload);
        payloadLog.ref = serviceRef;
        payloadLog.action = "Update";
        payloadLog.description = `${formData.serviceName} updated`;
        alert("Successfully updated the service");
      } else {
        serviceRef = await addDoc(collection(db, "services"), { ...payload, createdAt: serverTimestamp() });
        payloadLog.ref = serviceRef;
        alert("Successfully created the service");
      }
      await addDoc(
        collection(
          db,
          "companies",
          userDetails.companies[userDetails.selectedCompanyIndex].companyId,
          "audit"
        ),
        payloadLog
      );
      ResetForm();
      refresh();
      onClose();
    } catch (error) {
      console.error("Error creating or updating product:", error);
    }
  };

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
            {service ? "Edit" : "New"} Service
          </h2>
          <button
            onClick={onClose}
            className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form className="space-y-2" onSubmit={onCreateService}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Service Details</label>
              <input
                type="text"
                name="serviceName"
                className="w-full input-tag"
                placeholder="Service Name"
                value={formData.serviceName}
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    serviceName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                type="text area"
                name="description"
                className="w-full  input-tag"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Service Price</label>
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  value={+formData.sellingPrice || ""}
                  name="pricing.sellingPrice"
                  className="w-full input-tag"
                  placeholder="Service Price"
                  required
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      sellingPrice: +e.target.value,
                    }))
                  }
                />
                <Select
                  defaultValue={formData.sellingPriceTaxType ? "true" : "false"}
                  onValueChange={(val) => {
                    setFormData((pre) => ({
                      ...pre,
                      sellingPriceTaxType: val == "true" ? true : false,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=" Select SellingPriceTaxType" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Incl Tax</SelectItem>
                    <SelectItem value="false">Excl Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="text-sm text-gray-600">Discount</label>

              <div className="flex items-center justify-center">
                <input
                  type="number"
                  name="discount"
                  className="w-full input-tag"
                  placeholder="Discount"
                  value={formData.discount || ""}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      discount: +e.target.value || 0,
                    }))
                  }
                />

                <Select
                  value={formData.discountType ? "true" : "false"}
                  onValueChange={(val) => {
                    setFormData((pre) => ({
                      ...pre,
                      discountType: val == "true" ? true : false,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=" Select DiscountType" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">%</SelectItem>
                    <SelectItem value="false">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">GST Tax</label>
              <Select
                value={String(formData.tax) || "0"}
                onValueChange={(val) => {
                  setFormData((pre) => ({
                    ...pre,
                    tax: +val,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=" Select GST Tax" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"0"}>0 %</SelectItem>
                  <SelectItem value={"5"}>5 %</SelectItem>
                  <SelectItem value={"12"}>12 %</SelectItem>
                  <SelectItem value={"18"}>18 %</SelectItem>
                  <SelectItem value={"28"}>28 %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Month Duration</label>
              <Select
                value={String(formData.monthDuration) || "1"}
                onValueChange={(val) => {
                  setFormData((pre) => ({
                    ...pre,
                    monthDuration: +val,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Month Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"1"}>1 Month</SelectItem>
                  <SelectItem value={"3"}>3 Months</SelectItem>
                  <SelectItem value={"6"}>6 Months</SelectItem>
                  <SelectItem value={"12"}>12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="grid w-full mb-2 items-center gap-1.5">
                <label className="text-sm text-gray-600 ">Barcode</label>
                <input
                  className="w-full input-tag"
                  type="text"
                  placeholder="Barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      barcode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "8vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {service ? "Update" : "Add New"} Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
CreateServiceList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  service: PropTypes.object,
};

export default CreateServiceList;
