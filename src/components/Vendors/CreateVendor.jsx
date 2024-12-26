import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useSelector } from "react-redux";
import { FaUserEdit } from "react-icons/fa";

const CreateVendor = ({ isOpen, onClose, onVendorAdded }) => {
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [isUploading, setIsUploading] = useState(false);

  const [fileName, setFileName] = useState("No file chosen");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    profileImage: "",
    address: "",
    city: "",
    zipCode: "",
    gstNumber: "",
    panNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setFileName(file.name);
      try {
        const storageRef = ref(storage, `profileImages/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setFormData((prevData) => ({
          ...prevData,
          profileImage: downloadURL,
        }));
        setIsUploading(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "vendors"), {
        ...formData,
        companyRef: doc(db, "companies", companyId),
        createdAt: serverTimestamp(),
      });
      setFileName("No file chosen");
      onClose();
      onVendorAdded();
    } catch (error) {
      console.error("Error saving vendor:", error);
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
        className={`bg-white w-[370px] p-6 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">New Vendor</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <IoMdClose size={24} />
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className=" font-semibold">Image</label>
            <input
              type="file"
              name="name"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
            />
          </div>
          <div>
            <label className=" font-semibold">*Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Name"
              required
            />
          </div>
          <div>
            <label className=" font-semibold">*Phone</label>
            <div className="flex items-center">
              <span className="px-2 py-2 border border-gray-300 rounded-l-md">
                +91
              </span>
              <input
                type="text"
                maxLength="10"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-r-md"
                placeholder="Phone"
                required
              />
            </div>
          </div>
          <div>
            <label className=" font-semibold">Email ID</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Email ID"
            />
          </div>

          <div>
            <label className=" font-semibold">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Street Address"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Pin Code"
              className="w-1/2 border border-gray-300 p-2 rounded-md"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-1/2 border border-gray-300 p-2 rounded-md"
            />
          </div>

          <div>
            <label className=" font-semibold">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="GST Number"
            />
          </div>
          <div>
            <label className=" font-semibold">PAN Number</label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="PAN Number"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 text-white p-2 rounded-md mt-4"
          >
            Add Vendor
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVendor;
