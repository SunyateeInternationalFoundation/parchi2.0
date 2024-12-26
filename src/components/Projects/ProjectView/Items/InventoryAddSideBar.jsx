import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";

function InventoryAddSideBar({ projectId, isOpen, onClose, isMaterialAdd }) {
  const [itemList, setItemList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [showDropdownItem, setShowDropdownItem] = useState(false);

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId;

  useEffect(() => {
    const fetchInventoryItems = async () => {
      setLoadingItems(true);
      try {
        const companyRef = doc(db, "companies", companyId);
        const inventoryRef = collection(db, "companies", companyId, "products");
        const q = query(inventoryRef, where("companyRef", "==", companyRef));
        const querySnapshot = await getDocs(q);

        const inventoryItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItemList(inventoryItems);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    if (companyId) {
      fetchInventoryItems();
    }
  }, [companyId]);

  const handleAddMaterial = async () => {
    if (!selectedItem || !quantity) {
      alert("Please select an item, and enter a quantity!");
      return;
    }

    if (+quantity <= 0) {
      alert("Please enter a valid quantity!");
      return;
    }

    try {
      setLoadingItems(true);

      const inventoryRef = doc(
        db,
        "companies",
        companyId,
        "products",
        selectedItem.id
      );
      const currentStockQuantity = selectedItem.quantity;

      if (currentStockQuantity < +quantity) {
        alert(
          `Insufficient stock! You only have ${currentStockQuantity} units available, but you tried to add ${+quantity}. Please adjust the quantity.`
        );
        return;
      }
      const newStockQuantity = currentStockQuantity - +quantity;

      if (newStockQuantity < 0) {
        alert("Insufficient inventory stock!");
        setLoadingItems(false);
        return;
      }
      const projectRef = doc(db, "projects", projectId);
      const payload = {
        createdAt: Timestamp.fromDate(new Date()),
        description: description,
        itemPricePerPiece: selectedItem.price,
        name: selectedItem.name,
        projectRef,
        quantity: +quantity,
        remainingQuantity: +quantity,
      };
      const materialRef = collection(projectRef, "materials");
      await addDoc(materialRef, payload);
      await updateDoc(inventoryRef, {
        quantity: newStockQuantity,
      });

      alert("Material added successfully!");
      isMaterialAdd();
      setSelectedItem(null);
      setQuantity("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error adding material or updating inventory:", error);
      alert("Failed to add material. Please try again.");
    } finally {
      setLoadingItems(false);
    }
  };
  function onSelectItem(e) {
    const data = itemList.find((ele) => ele.id === e.target.value);
    setSelectedItem({
      id: data.id,
      name: data.name,
      quantity: data.stock,
      price: data.sellingPrice,
    });
  }
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
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <h1 className="text-xl font-bold text-gray-800 mb-4">Add Material</h1>
        <div className="space-y-4">
          <div>
            <select
              className="mt-1 p-2 block w-full  border rounded-md shadow-sm focus:ring-blue-500  sm:text-sm"
              onChange={onSelectItem}
              defaultValue=""
            >
              <option value="" disabled>
                Select Item
              </option>
              {itemList.map((item) => (
                <option
                  value={item.id}
                  key={item.id}
                  disabled={item.stock === 0}
                >
                  {item.name} - {item.stock} Quantity - ₹{item.sellingPrice} Pc
                </option>
              ))}
            </select>
          </div>
          {/* <div className="relative">
            <label
              className="block text-sm font-medium text-gray-700 "
              htmlFor="select-item"
            >
              Select Item
            </label>
            <div
              className="mt-1 block w-full  rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm relative"
              onClick={() => setShowDropdownItem(!showDropdownItem)}
            >
              <div className="p-2 cursor-pointer">
                {selectedItem
                  ? `${selectedItem.name} - ${selectedItem.quantity} units - ₹ ${selectedItem.price}`
                  : "Select Item"}
              </div>
            </div>
            {showDropdownItem && (
              <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {loadingItems ? (
                  <div className="p-4 text-gray-500 text-center">
                    Loading...
                  </div>
                ) : itemList.length > 0 ? (
                  itemList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 hover:bg-blue-100 cursor-pointer "
                      onClick={() => {
                        setSelectedItem({
                          id: item.id,
                          name: item.name,
                          quantity: item.stock?.quantity,
                          price: item.pricing?.sellingPrice?.amount,
                        });
                        setShowDropdownItem(false);
                      }}
                    >
                      {item.name} - {item.stock?.quantity} units - ₹
                      {item.pricing?.sellingPrice?.amount}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">
                    No Items Found
                  </div>
                )}
              </div>
            )}
          </div> */}

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="quantity"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity || ""}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 p-2 block w-full  border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="description"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 block w-full  border rounded-md shadow"
              placeholder="Enter description"
            />
          </div>

          <div className="mt-6">
            <button
              onClick={handleAddMaterial}
              className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Add Material
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryAddSideBar;
