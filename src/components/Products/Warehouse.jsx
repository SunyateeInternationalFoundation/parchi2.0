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
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase";

const Warehouse = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerms, setSearchTerms] = useState("");
  const [warehousesCount, setWarehousesCount] = useState({
    total: 0,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
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

  useEffect(() => {
    const filterWarehouses = warehouses.filter((warehouse) => {
      if (!searchTerms) {
        return true;
      }
      return warehouse.name.toLowerCase().includes(searchTerms.toLowerCase());
    });
    setPaginationData(
      filterWarehouses.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, warehouses, searchTerms]);

  return (
    <div className="main-container overflow-y-auto" style={{ height: "81vh" }}>
      <div className="container">
        <div className="flex justify-between items-center px-5 ">
          <div
            className="flex items-center space-x-4  border
                         px-5  py-3 rounded-md w-1/2"
          >
            <input
              type="text"
              placeholder="Search..."
              className=" w-full focus:outline-none"
              onChange={(e) => setSearchTerms(e.target.value)}
            />
            <IoSearch />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
          >
            + Create Warehouse
          </button>
        </div>
        <div
          className=" rounded-lg py-3 overflow-hidden"
          style={{ minHeight: "92vh" }}
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
              {paginationData.length > 0 ? (
                paginationData.map((warehouse) => (
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
        <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage + 1} of {totalPages || 1} row(s) selected.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage(0)}
                disabled={currentPage <= 0}
              >
                <div className="flex justify-center">
                  <LuChevronsLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage((val) => val - 1)}
                disabled={currentPage <= 0}
              >
                <div className="flex justify-center">
                  <LuChevronLeft className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage((val) => val + 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                <div className="flex justify-center">
                  <LuChevronRight className="text-sm" />
                </div>
              </button>
              <button
                className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage + 1 >= totalPages}
              >
                <div className="flex justify-center">
                  <LuChevronsRight />
                </div>
              </button>
            </div>
          </div>
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
        className={`bg-white  pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className=" text-sm text-gray-600 ">Warehouse Details</h2>
          <button
            onClick={onClose}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onCreateWarehouse}>
          <div className="space-y-2 p-5" style={{ height: "84vh" }}>
            <div className="space-y-1">
              <div className="grid w-full mb-2 items-center gap-1.5">
                <div className="text-sm text-gray-600">Upload Image</div>

                <label
                  htmlFor="file"
                  className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                >
                  <div className="flex  items-center justify-center gap-1">
                    {formData?.file?.name ? (
                      <span className="py-1 px-4">{formData?.file?.name}</span>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 640 512"
                          className="h-8 fill-gray-600"
                        >
                          <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                        </svg>
                        <span className="py-1 px-4">Upload Image</span>
                      </>
                    )}
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Warehouse Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="Warehouse Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">City</label>
              <input
                type="text"
                name="city"
                value={formData.location.city}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="City"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Address</label>
              <input
                type="text"
                name="address"
                value={formData.location.address}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="Address"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Phone</label>
              <div className="flex items-center mb-4">
                <span className="px-5 py-3  border border-r-0 rounded-l-md text-gray-700">
                  +91
                </span>
                <input
                  type="text"
                  maxLength="10"
                  value={formData.phone}
                  onChange={(e) => handlePhoneNumberChange(e)}
                  placeholder="Contact Number"
                  className="px-5 py-3 border w-full focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {isLoading ? "Adding..." : "Add Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Warehouse;
