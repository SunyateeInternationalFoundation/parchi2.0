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
import PropTypes from "prop-types";
import { serverTimestamp, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../UI/select";

function InventoryAddSideBar({ projectId, isOpen, onClose, isMaterialAdd }) {
  const [itemList, setItemList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId;

  useEffect(() => {
    const fetchInventoryItems = async () => {
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
      const ref = await addDoc(materialRef, payload);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: ref,
        date: serverTimestamp(),
        section: "Project",
        action: "Create",
        description: `${selectedItem.name} created from inventory in project`,
      });
      await updateDoc(inventoryRef, {
        stock: newStockQuantity,
      });
      const productPayloadLogs = {
        date: payload.createdAt,
        status: "use",
        quantity: quantity,
        from: "Project",
        ref: doc(db, "projects", projectId),
      };
      await addDoc(
        collection(
          db,
          "companies",
          companyId,
          "products",
          selectedItem.id,
          "logs"
        ),
        productPayloadLogs
      );
      alert("Material added successfully!");
      isMaterialAdd();
      setSelectedItem(null);
      setQuantity("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error adding material or updating inventory:", error);
      alert("Failed to add material. Please try again.");
    }
  };
  function onSelectItem(id) {
    const data = itemList.find((ele) => ele.id === id);
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
          <h2 className="text-sm text-gray-600 ">Add Material</h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleAddMaterial}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Select Product</label>
              <Select onValueChange={onSelectItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PaymentMode" />
                </SelectTrigger>
                <SelectContent>
                  {itemList.map((item) => (
                    <SelectItem
                      value={item.id}
                      key={item.id}
                      disabled={item.stock === 0}
                    >
                      {item.name} - {item.stock} Quantity - ₹{item.sellingPrice}{" "}
                      Pc
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 " htmlFor="quantity">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity || ""}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full input-tag"
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 " htmlFor="description">
                Description
              </label>
              <textarea
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full input-tag"
                placeholder="Enter description"
              />
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              Add Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
InventoryAddSideBar.propTypes = {
  projectId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isMaterialAdd: PropTypes.func.isRequired,
};

export default InventoryAddSideBar;
