import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { db, storage } from "../../firebase";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSelector } from "react-redux";

const Warehouse = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesCount, setWarehousesCount] = useState({
    total: 0,
  });

  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchWarehouse = async () => {
    const warehousesRef = collection(
      db,
      "companies",
      companyDetails.companyId,
      "warehouses"
    );
    const snapshot = await getDocs(warehousesRef);

    const warehousesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setWarehouses(warehousesData);
    setWarehousesCount({
      total: warehousesData.length,
    });
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const handleAddWarehouse = (newWarehouse) => {
    setWarehouses((prev) => [...prev, newWarehouse]);
    setWarehousesCount((prev) => ({
      total: prev.total + 1,
    }));
  };
  return (
    <div className="p-4">
      <div className="flex justify-between mb-2">
        <div className="flex flex-col space-y-2">
          <span className="text-xl font-bold  text-blue">
            {warehousesCount.total}
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 transition"
        >
          + Create Warehouse
        </button>
      </div>
      <h1 className="text-xl font-bold  text-gray-700">Total Warehouses</h1>
      <div className="space-y-4 mt-6">
        {warehouses.map((warehouse) => (
          <WarehouseCard
            key={warehouse.id}
            warehouse={warehouse}
            setWarehouses={setWarehouses}
            setWarehousesCount={setWarehousesCount}
            companyId={companyDetails.companyId}
          />
        ))}
      </div>

      <AddWarehouseModal
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        onAddWarehouse={handleAddWarehouse}
        companyId={companyDetails.companyId}
      />
    </div>
  );
};

const WarehouseCard = ({
  warehouse,
  setWarehouses,
  setWarehousesCount,
  companyId,
}) => {
  async function OnDeleteWarehouse(e, warehouseId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this warehouse?"
      );
      if (!confirm) return;

      await deleteDoc(
        doc(db, "companies", companyId, "warehouses", warehouseId)
      );

      setWarehouses((prev) => {
        const updatedWarehouses = prev.filter(
          (ware) => ware.id !== warehouseId
        );

        setWarehousesCount({ total: updatedWarehouses.length });

        return updatedWarehouses;
      });
    } catch (error) {
      console.error("Error deleting warehouse:", error);
    }
  }
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{warehouse.name}</h2>
          <h2 className="text-xl font-semibold">
            {warehouse.location?.address || ""}
          </h2>
        </div>

        <button
          onClick={(e) => OnDeleteWarehouse(e, warehouse.id)}
          className="text-white bg-red-500 h-6 w-6 font-bold text-center rounded-full flex items-center justify-center"
        >
          <div className="w-3 h-1 bg-white"></div>
        </button>
      </div>
    </div>
  );
};

const AddWarehouseModal = ({ isOpen, onClose, onAddWarehouse, companyId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: { address: "", city: "" },
    file: null,
    phoneNumber: "",
  });

  const handlePhoneNumberChange = (event) => {
    const inputValue = event.target.value;
    const isValidPhoneNumber = /^\d{0,10}$/.test(inputValue);

    if (isValidPhoneNumber) {
      setFormData((val) => ({ ...val, phone: event.target.value }));
    }
  };

  async function onCreateWarehouse(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { name, location, file, phone } = formData;

      if (!name.trim()) {
        alert("Warehouse name is required");
        setIsLoading(false);
        return;
      }
      // const storageRef = ref(storage, `warehouses/${Date.now()}_${file.name}`);
      // await uploadBytes(storageRef, file);
      // const fileUrl = await getDownloadURL(storageRef);

      const warehouseData = {
        name,
        location: {
          address: location.address,
          city: location.city,
        },
        phone,
        // fileUrl,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const warehouseRef = await addDoc(
        collection(db, "companies", companyId, "warehouses"),
        warehouseData
      );

      onAddWarehouse({ id: warehouseRef.id, ...warehouseData });
      alert("Warehouse successfully created!");
      setFormData({
        name: "",
        location: { address: "", city: "" },
        file: null,
        phone: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating warehouse:", error);
      alert("Failed to create warehouse. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "address" || name === "city") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
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
        <h2 className="text-xl font-semibold mb-5 ">Warehouse Details</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>

        <form className="space-y-1.5" onSubmit={onCreateWarehouse}>
          <div>
            <div className="grid w-full mb-2 items-center gap-1.5">
              <label className="text-sm block font-semibold ">
                Upload Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
              />
            </div>
          </div>
          <hr></hr>
          <div>
            <label className="text-sm block font-semibold">
              Warehouse Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Warehouse Name"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">City</label>
            <input
              type="text"
              name="city"
              value={formData.location.city}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="City"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">Address</label>
            <input
              type="text"
              name="address"
              value={formData.location.address}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Address"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold ">Phone</label>
            <div className="flex items-center mb-4">
              <span className="px-3 py-2 bg-gray-200 border border-r-0 rounded-l-md text-gray-700">
                +91
              </span>
              <input
                type="text"
                maxLength="10"
                value={formData.phone}
                onChange={(e) => handlePhoneNumberChange(e)}
                placeholder="Contact Number"
                className="px-4 py-2 border w-full focus:outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded-md mt-4 ${
              isLoading ? "bg-gray-400" : "bg-purple-500 text-white"
            }`}
          >
            {isLoading ? "Adding..." : "Add Warehouse"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Warehouse;
