import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase";

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
        createdAt: payloadInventory.createdAt,
        description: formData.description,
        itemPricePerPiece: formData.itemPricePerPiece,
        itemName: formData.itemName,
        projectRef: projectRef,
        quantity: formData.quantity,
        remainingQuantity: formData.quantity,
        barcode: formData.barcode,
      };
      let productRef = "";
      if (formData.barcode) {
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
        productRef = await setDoc(productDocRef, payloadInventory);
      } else {
        const productDocRef = collection(
          db,
          "companies",
          companyId,
          "products"
        );
        productRef = await addDoc(productDocRef, payloadInventory);
      }

      const ref = await addDoc(
        collection(db, "projects", projectId, "materials"),
        payloadMaterial
      );
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: ref,
        date: serverTimestamp(),
        section: "Project",
        action: "Create",
        description: `${formData.itemName} created from Quick add in project`,
      });
      const productPayloadLogs = {
        date: payloadInventory.createdAt,
        status: "add",
        quantity: formData.quantity,
        from: "Project",
        ref: doc(db, "projects", projectId),
      };
      await addDoc(
        collection(db, "companies", companyId, "products", productRef, "logs"),
        productPayloadLogs
      );

      await addDoc(
        collection(db, "companies", companyId, "products", productRef, "logs"),
        { ...productPayloadLogs, status: "use" }
      );
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
          <h2 className="text-sm text-gray-600 ">Quick Add</h2>
          <button
            onClick={onClose}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Item Name</label>
              <input
                type="text"
                name="ItemName"
                className="w-full input-tag"
                placeholder="Item Name"
                required
                onChange={(e) =>
                  setFormData((val) => ({ ...val, itemName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                type="text"
                name="ItemName"
                className="w-full input-tag"
                placeholder="Description"
                required
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Barcode</label>
              <input
                type="text"
                name="barcode"
                className="w-full input-tag"
                placeholder="Barcode"
                required
                onChange={(e) =>
                  setFormData((val) => ({ ...val, barcode: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Price</label>
                <input
                  type="number"
                  name="ItemName"
                  className="w-full input-tag"
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
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Quantity</label>
                <input
                  type="number"
                  name="ItemName"
                  className="w-full input-tag"
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
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              + Add Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
QuickAddSideBar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isMaterialAdd: PropTypes.func,
};

export default QuickAddSideBar;
