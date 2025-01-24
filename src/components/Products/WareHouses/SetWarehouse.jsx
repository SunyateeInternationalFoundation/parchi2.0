import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../firebase";

function SetWarehouse({ isOpen, onClose, onAddWarehouse, companyId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: { address: "", city: "" },
    file: null,
    phoneNumber: "",
    gst: "",
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
            <div className="space-y-1">
              <label className="text-sm text-gray-600">GST Number</label>
              <input
                type="text"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="GST"
              />
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
}

export default SetWarehouse;
