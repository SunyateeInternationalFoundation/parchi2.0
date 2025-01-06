import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose, IoMdTrash } from "react-icons/io";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

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

  async function OnDeleteWarehouse(e, warehouseId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this warehouse?"
      );
      if (!confirm) return;

      await deleteDoc(
        doc(
          db,
          "companies",
          companyDetails.companyId,
          "warehouses",
          warehouseId
        )
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
    <div className="p-4">
      <div className="bg-white rounded-lg">
        <div className="flex justify-end px-5 py-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
          >
            + Create Warehouse
          </button>
        </div>
        <div
          className=" rounded-lg   overflow-y-auto"
          style={{ height: "65vh" }}
        >
          <table className="w-full border-collapse text-start  ">
            <thead className=" bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  Date
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Name
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Phone
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Address
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Delete
                </td>
              </tr>
            </thead>
            <tbody>
              {warehouses.length > 0 ? (
                warehouses.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="border-b-2 border-gray-200 "
                  >
                    <td className="px-8 py-3 text-start ">
                      <FormatTimestamp timestamp={warehouse.createdAt} />
                    </td>
                    <td className="px-5 py-3 text-start">{warehouse.name}</td>
                    <td className="px-5 py-3 text-start">
                      {warehouse.phone || ""}
                    </td>
                    <td className="px-5 py-3 text-start">
                      {warehouse.location?.address || ""}
                    </td>
                    <td
                      className="px-5 py-3 text-start text-red-700 text-2xl"
                      onClick={(e) => {
                        e.preventDefault();
                        OnDeleteWarehouse(e, warehouse.id);
                      }}
                    >
                      <IoMdTrash />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="h-24 text-center py-4 ">
                    No Item Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
