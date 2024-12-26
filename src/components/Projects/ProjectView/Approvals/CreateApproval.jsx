import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db, storage } from "../../../../firebase";
import { useSelector } from "react-redux";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function CreateApproval({ isOpen, projectId, onClose, newApprovalAdded }) {
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [filter, setFilter] = useState("Customer");
  const [typeOfFile, setTypeOfFile] = useState("Image");
  const [uploadedFile, setUploadedFile] = useState("");
  const [approvalForm, setApprovalForm] = useState({
    Description: "",
    approvalBelongsTo: "",
    categories: "",
    createdAt: "",
    customerOrVendorRef: "",
    status: "Pending",
    file: {
      image: "",
      pdfUrl: "",
    },
    name: " ",
    phoneNumber: "",
    priority: "High",
    typeOfFile: "Image",
  });

  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const fetchData = async (collectionName, setData) => {
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
    }
  };

  function Reset() {
    setApprovalForm({
      Description: "",
      approvalBelongsTo: "",
      categories: "",
      createdAt: "",
      customerOrVendorRef: "",
      status: "Pending",
      file: {
        image: "",
        pdfUrl: "",
      },
      name: " ",
      phoneNumber: "",
      priority: "High",
      typeOfFile: "Image",
    });
  }
  useEffect(() => {
    if (companyId) {
      fetchData("customers", setCustomers);
      fetchData("vendors", setVendors);
    }
  }, [companyId]);

  async function onCreateApproval() {
    try {
      // const storageRef = ref(storage, `files/${uploadedFile.name}`);
      // await uploadBytes(storageRef, uploadedFile);
      // const fileURL = await getDownloadURL(storageRef);
      // const fileField = typeOfFile === "Image" ? "image" : "pdfUrl";
      const payload = {
        ...approvalForm,
        approvalBelongsTo: filter,
        categories: filter,
        createdAt: Timestamp.fromDate(new Date()),
        typeOfFile: typeOfFile,
      };
      // payload.file[fileField] = fileURL;
      const approvalsRef = collection(db, `projects/${projectId}/approvals`);
      await addDoc(approvalsRef, payload);
      newApprovalAdded();
      alert("successfully Created Approval");
      Reset();
      onClose();
    } catch (e) {
      console.log("🚀 ~ onCreateApproval ~ e:", e);
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
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold ">Create Approval</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <div>
          <label className="text-sm block font-semibold mt-2">
            Approval Name
          </label>
          <input
            type="text"
            className="border p-2 rounded w-full  cursor-pointer"
            placeholder="Enter Approval Name"
            onChange={(e) =>
              setApprovalForm((val) => ({ ...val, name: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="text-sm block font-semibold mt-2">
            Description
          </label>
          <input
            type="text"
            className="border p-2 rounded w-full  cursor-pointer"
            placeholder="Enter Description"
            onChange={(e) =>
              setApprovalForm((val) => ({
                ...val,
                Description: e.target.value,
              }))
            }
          />
        </div>
        <div className="flex space-x-2 mb-4 mt-2">
          {["Customer", "Vendor"].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full ${
                filter === category
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select {filter}</label>
          <select
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Enter Description"
            onChange={(e) => {
              const id = e.target.value;

              setApprovalForm((val) => ({
                ...val,
                customerOrVendorRef: id,
                phoneNumber: (filter === "Customer" ? customers : vendors).find(
                  (ele) => ele.id === id
                ).phone,
              }));
            }}
            required
          >
            <option value="">Select {filter}</option>
            {(filter === "Customer" ? customers : vendors).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm block font-semibold mt-2">
            Choose File
          </label>
          <div className="flex space-x-2 mb-4 mt-2">
            {["Image", "Pdf"].map((category) => (
              <button
                key={category}
                onClick={() => setTypeOfFile(category)}
                className={`px-4 py-2 rounded-full ${
                  typeOfFile === category
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <input
            type="file"
            className="flex h-10 w-full rounded-md border border-input
            bg-white px-3 py-2 text-sm text-gray-400 file:border-0
            file:bg-transparent file:text-gray-600 file:text-sm
            file:font-medium"
            accept={typeOfFile === "Image" ? "image/*" : "application/pdf"}
            onChange={(e) => {
              setUploadedFile(e.target.files[0]);
            }}
          />
          <div>File size should not exceed 5 mb</div>
        </div>

        <div className="mt-4">
          <div>Priority</div>
          <div>
            <select
              className="border p-2 rounded w-full  cursor-pointer"
              onChange={(e) =>
                setApprovalForm((val) => ({
                  ...val,
                  priority: e.target.value,
                }))
              }
            >
              <option value={"High"}>High</option>
              <option value={"Medium"}>Medium</option>
              <option value={"Low"}>Low</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="w-full bg-purple-500 text-white p-2 rounded-md mt-4"
            onClick={onCreateApproval}
          >
            Create Approval
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateApproval;
