import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

const Files = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [formData, setFormData] = useState({
    name: "",
    customerOrVendorRef: "",
    file: null,
    phoneNumber: "",
  });

  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const { id } = useParams();
  const projectId = id;

  useEffect(() => {
    fetchFiles();
  }, []);
  const fetchData = async (collectionName, setData) => {
    setLoading(true);
    try {
      const ref = collection(db, collectionName);
      const companyRef = doc(db, "companies", companyId);
      const q = query(ref, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(data);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchData("customers", setCustomers);
      fetchData("vendors", setVendors);
    }
  }, [companyId]);

  async function fetchFiles() {
    try {
      const filesRef = collection(db, "projects", projectId, "files");
      const querySnapshot = await getDocs(filesRef);
      const filesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }

  // Handle File Upload
  async function handleAddFile(e) {
    e.preventDefault();

    try {
      // if (!formData.file) {
      //   alert("Please upload a file!");
      //   return;
      // }

      // const storageRef = ref(storage, `files/${formData.file.name}`);
      // await uploadBytes(storageRef, formData.file);
      // const fileURL = await getDownloadURL(storageRef);

      const filesRef = collection(db, "projects", projectId, "files");
      await addDoc(filesRef, {
        name: formData.name,
        customerOrVendorRef: formData.customerOrVendorRef,
        // fileURL,
        phoneNumber: formData.phoneNumber,
        createdAt: serverTimestamp(),
      });

      setFormData({
        name: "",
        customerOrVendorRef: "",
        file: null,
        phoneNumber: "",
      });
      setIsModalOpen(false);
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);

    if (tab === "customers") {
      const selectedCustomer = customers.find(
        (customer) => customer.id === formData.customerOrVendorRef
      );
      if (selectedCustomer) {
        setFormData((prevData) => ({
          ...prevData,
          phoneNumber: selectedCustomer.phone,
        }));
      }
    } else if (tab === "vendors") {
      const selectedVendor = vendors.find(
        (vendor) => vendor.id === formData.customerOrVendorRef
      );
      if (selectedVendor) {
        setFormData((prevData) => ({
          ...prevData,
          phoneNumber: selectedVendor.phone,
        }));
      }
    }
  };

  const handleSelectionChange = (e) => {
    const selectedId = e.target.value;
    const selectedItem = (activeTab === "customers" ? customers : vendors).find(
      (item) => item.id === selectedId
    );

    setFormData({
      ...formData,
      customerOrVendorRef: selectedId,
      phoneNumber: selectedItem ? selectedItem.phone : "",
    });
  };

  return (
    <div
      className="bg-white-500  p-4 overflow-y-auto"
      style={{ height: "92vh" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <Link
            className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
            to={"./../"}
          >
            <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          <h1 className="text-xl font-bold">Files</h1>
        </div>
        <button
          className="bg-blue-500 text-white text-2xl text-center px-3 pb-1 rounded hover:bg-blue-600 transition"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>

      <div className="rounded-lg p-6 space-y-4">
        {files.map((file) => {
          const customer = customers.find(
            (customer) => customer.id === file.customerOrVendorRef
          );
          const vendor = vendors.find(
            (vendor) => vendor.id === file.customerOrVendorRef
          );

          const name = customer
            ? `Customer - ${customer.name}`
            : vendor
            ? `Vendor - ${vendor.name}`
            : "N/A";
          const phoneNumber = customer
            ? customer.phone
            : vendor
            ? vendor.phone
            : "N/A";
          const createdAt = file.createdAt?.toDate().toLocaleDateString();

          return (
            <div
              key={file.id}
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
            >
              {/* File Preview */}
              <div className="flex items-center space-x-4">
                <img
                  src={file.fileURL}
                  alt={file.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div>
                  <h2 className="text-gray-800 font-semibold">{file.name}</h2>
                  <p className="text-gray-600 text-sm">{createdAt}</p>
                </div>
              </div>

              {/* File Details */}
              <div className="text-right">
                <p className="text-gray-800 font-medium">{name}</p>
                <p className="text-gray-600 text-sm">{phoneNumber}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-96 p-3 pt-2  overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-600 text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              <IoMdClose size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Files to Project</h2>
            <form onSubmit={handleAddFile}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">File Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter file name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-around mb-4">
                <button
                  onClick={() => handleTabClick("customers")}
                  className={`px-4 py-1 rounded-full ${
                    activeTab === "customers"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  Customers
                </button>
                <button
                  onClick={() => handleTabClick("vendors")}
                  className={`px-4 py-1 rounded-full ${
                    activeTab === "vendors"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  Vendors
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Select {activeTab.slice(0, -1)}
                </label>
                <select
                  className="w-full border border-gray-300 rounded p-2"
                  value={formData.customerOrVendorRef}
                  onChange={handleSelectionChange}
                  required
                >
                  <option value="">Select {activeTab.slice(0, -1)}</option>
                  {(activeTab === "customers" ? customers : vendors).map(
                    (item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Upload File</label>
                <input
                  type="file"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
                  // onChange={(e) =>
                  //   setFormData({ ...formData, file: e.target.files[0] })
                  // }
                  
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white rounded p-2 w-full"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload File"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
