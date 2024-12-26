import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux";

const CreateServiceList = ({ isOpen, onClose, refresh, service }) => {
  const userDetails = useSelector((state) => state.users);
  const [formData, setFormData] = useState({
    serviceName: "",
    barcode: "",
    pricing: {
      sellingPrice: {
        taxAmount: 0,
        includingTax: true,
        amount: 0,
        taxSlab: 0,
      },
      discount: {
        amount: 0,
        type: "Percentage",
        fieldValue: 0,
      },
      gstTax: 0,
    },
    description: "",
    tax: {
      taxSlab: 0,
      taxAmount: 0,
    },
    monthDuration: "1", // New field for month duration
  });

  function ResetForm() {
    setFormData({
      serviceName: "",
      barcode: "",
      pricing: {
        sellingPrice: {
          taxAmount: 0,
          includingTax: true,
          amount: 0,
          taxSlab: 0,
        },
        discount: {
          amount: 0,
          type: "Percentage",
          fieldValue: 0,
        },
        gstTax: 0,
      },
      description: "",
      tax: {
        taxSlab: 0,
        taxAmount: 0,
      },
      monthDuration: "1", // Reset month duration
    });
  }

  useEffect(() => {
    if (service) {
      setFormData({
        serviceName: service.serviceName,
        barcode: service.barcode,
        pricing: {
          sellingPrice: service.pricing.sellingPrice,
          discount: service.pricing.discount,
          gstTax: service.pricing.gstTax,
        },
        description: service.description,
        tax: service.tax,
        monthDuration: service.monthDuration || "1", // Populate existing duration or default
      });
    } else {
      ResetForm();
    }
  }, [service]);

  const onCreateService = async (e) => {
    e.preventDefault();
    try {
      let fieldValue = formData.pricing.discount.amount;

      if (formData.pricing.discount.type === "Percentage") {
        fieldValue =
          (formData.pricing.sellingPrice.amount / 100) *
          formData.pricing.discount.amount;
      }

      const amount = formData.pricing.sellingPrice.amount - fieldValue;
      let sellingPriceTaxAmount =
        amount * (formData.pricing.sellingPrice.taxSlab / 100);
      const companyRef = doc(
        db,
        "companies",
        userDetails.companies[userDetails.selectedCompanyIndex].companyId
      );

      if (!formData.pricing.sellingPrice.includingTax) {
        sellingPriceTaxAmount =
          amount * (formData.pricing.sellingPrice.taxSlab / 100);
      }

      const payload = {
        ...formData,
        pricing: {
          ...formData.pricing,
          discount: {
            ...formData.pricing.discount,
            fieldValue,
          },
          sellingPrice: {
            ...formData.pricing.sellingPrice,
            fieldValue,
            taxAmount: sellingPriceTaxAmount,
          },
        },
        tax: {
          taxSlab: formData.pricing.gstTax,
          taxAmount: sellingPriceTaxAmount,
        },
        companyRef,
      };

      if (service) {
        await updateDoc(doc(db, "services", service.id), payload);
        alert("Successfully updated the service");
      } else {
        await addDoc(collection(db, "services"), payload);
        alert("Successfully created the service");
      }

      ResetForm();
      refresh();
      onClose();
    } catch (error) {
      console.error("Error creating or updating product:", error);
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
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
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

        <form className="space-y-1.5" onSubmit={onCreateService}>
          <div>
            <label className="text-sm block font-semibold mt-2">
              Service Details
            </label>
            <input
              type="text"
              name="serviceName"
              className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
              placeholder="Service Name"
              value={formData.serviceName}
              required
              onChange={(e) =>
                setFormData((val) => ({ ...val, serviceName: e.target.value }))
              }
            />
          </div>
          <div>
            <input
              type="text"
              name="description"
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((val) => ({ ...val, description: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm block font-semibold">Service Price</label>

            <div className="flex items-center justify-center">
              <input
                type="number"
                value={+formData.pricing?.sellingPrice?.amount || ""}
                name="pricing.sellingPrice.amount"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
                placeholder="Service Price"
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    pricing: {
                      ...val.pricing,
                      sellingPrice: {
                        ...val.pricing.sellingPrice,
                        amount: +e.target.value,
                      },
                    },
                  }))
                }
              />
              <select
                className="w-full  border border-gray-300 p-2 rounded-r-lg"
                name="pricing.sellingPrice.includingTax"
                value={formData.pricing.sellingPrice.includingTax}
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    pricing: {
                      ...val.pricing,
                      sellingPrice: {
                        ...val.pricing.sellingPrice,
                        includingTax: e.target.value === "true" ? true : false,
                      },
                    },
                  }))
                }
              >
                <option value="true">Incl Tax</option>
                <option value="false">Excl Tax</option>
              </select>
            </div>
            <label className="text-sm block font-semibold">Discount</label>

            <div className="flex items-center justify-center ">
              <input
                type="number"
                name="discount"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
                placeholder="Discount"
                value={formData.pricing.discount.amount || ""}
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    pricing: {
                      ...val.pricing,
                      discount: {
                        ...val.pricing.discount,
                        amount: +e.target.value || 0,
                      },
                    },
                  }))
                }
              />
              <select
                className="w-full border border-gray-300 p-2 rounded-r-lg"
                defaultValue={formData.pricing.discount.type}
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    pricing: {
                      ...val.pricing,
                      discount: {
                        ...val.pricing.discount,
                        type: e.target.value,
                      },
                    },
                  }))
                }
              >
                <option value="Percentage">%</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm block font-semibold">GST Tax</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg"
              value={formData.pricing.gstTax}
              onChange={(e) =>
                setFormData((val) => ({
                  ...val,
                  pricing: {
                    ...val.pricing,
                    gstTax: +e.target.value,
                    sellingPrice: {
                      ...val.pricing.sellingPrice,
                      taxSlab: +e.target.value,
                    },
                  },
                }))
              }
            >
              <option value={0}>0 %</option>
              <option value={5}>5 %</option>
              <option value={12}>12 %</option>
              <option value={18}>18 %</option>
              <option value={28}>28 %</option>
            </select>
          </div>
          <div>
            <label className="text-sm block font-semibold">
              Month Duration
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg"
              value={formData.monthDuration}
              onChange={(e) =>
                setFormData((val) => ({
                  ...val,
                  monthDuration: +e.target.value,
                }))
              }
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>
          <div>
            <div className="grid w-full mb-2 items-center gap-1.5">
              <label className="text-sm block font-semibold ">Barcode</label>
              <input
                className="w-full border border-gray-300 p-2 rounded-l-lg"
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
          <hr></hr>

          <button
            type="submit"
            className="w-full bg-purple-500 text-white p-2 rounded-md mt-4"
          >
            {service ? "Update" : "Add New"} Service
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceList;
