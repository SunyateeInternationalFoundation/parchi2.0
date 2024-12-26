import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

function QuickAddSideBar({ isOpen, onClose, isMaterialAdd }) {
  const { id } = useParams();
  const projectId = id;
  const [formData, setFormData] = useState({
    itemName: "",
    itemPricePerPiece: 0,
    quantity: 0,
    description: "",
    barcode: 0,
  });

  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  function ResetFormData() {
    setFormData({
      itemName: "",
      itemPricePerPiece: 0,
      quantity: 0,
      description: "",
    });
  }

  async function onSubmit() {
    try {
      const projectRef = doc(db, "projects", projectId);
      const amount = +formData.quantity * +formData.itemPricePerPiece;
      const userRef = doc(db, "users", userDetails.userId);
      const companyRef = doc(db, "companies", companyId);

      const payloadInventory = {
        itemName: formData.itemName,
        barcode: formData.barcode,
        stock: 0,
        usedQuantity: +formData.quantity,
        sellingPrice: +formData.itemPricePerPiece,
        sellingPriceTaxType: true,
        discount: 0,
        purchasePrice: +formData.itemPricePerPiece,
        tax: 0,
        description: formData.description,
        createdAt: Timestamp.fromDate(new Date()),
        userRef,
        companyRef,
      };

      const payloadMaterial = {
        createdAt: Timestamp.fromDate(new Date()),
        description: formData.description,
        itemPricePerPiece: formData.itemPricePerPiece,
        itemName: formData.itemName,
        projectRef: projectRef,
        quantity: formData.quantity,
        remainingQuantity: formData.quantity,
        barcode: formData.barcode,
      };

      await addDoc(
        collection(db, "projects", projectId, "materials"),
        payloadMaterial
      );
      const productDocRef = doc(
        db,
        "companies",
        companyId,
        "products",
        formData.barcode
      );
      const docSnapshot = await getDoc(productDocRef);
      if (docSnapshot.exists()) {
        alert(
          "A product with this barcode already exists.Kindly use a unique barcode."
        );
        return;
      }
      await setDoc(productDocRef, payloadInventory);

      alert("Successfully added material and inventory!");
      isMaterialAdd();
      ResetFormData();
      onClose();
    } catch (error) {
      console.error("Error adding material and inventory:", error);
      alert("Failed to add material and inventory. Please try again.");
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
        className={`bg-white w-96 p-3 pt-2  transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5">Add Items</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <div className="space-y-3">
          <div>
            <label className="text-sm block font-semibold mt-2">
              Item Name
            </label>
            <input
              type="text"
              name="ItemName"
              className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
              placeholder="Item Name"
              required
              onChange={(e) =>
                setFormData((val) => ({ ...val, itemName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-sm block font-semibold mt-2">
              Description
            </label>
            <input
              type="text"
              name="ItemName"
              className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
              placeholder="Description"
              required
              onChange={(e) =>
                setFormData((val) => ({ ...val, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-sm block font-semibold mt-2">Barcode</label>
            <input
              type="text"
              name="barcode"
              className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
              placeholder="Barcode"
              required
              onChange={(e) =>
                setFormData((val) => ({ ...val, barcode: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <div>
              <label className="text-sm block font-semibold">Price</label>
              <input
                type="number"
                name="ItemName"
                className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
                placeholder="Price"
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    itemPricePerPiece: +e.target.value,
                  }))
                }
              />
            </div>
            <div className="text-lg pt-6 font-bold">X</div>
            <div>
              <label className="text-sm block font-semibold">Quantity</label>
              <input
                type="number"
                name="ItemName"
                className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
                placeholder="Quantity"
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    quantity: +e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="w-full bg-blue-700 text-white p-2 rounded-md mt-4"
            onClick={onSubmit}
          >
            + Add Material
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickAddSideBar;
