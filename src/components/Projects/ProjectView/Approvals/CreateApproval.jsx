import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../../../firebase";

function CreateApproval({ isOpen, projectId, onClose, newApprovalAdded }) {
  const userDetails = useSelector((state) => state.users);

  // const companyId =
  //   userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.approvals;
  const [filter, setFilter] = useState("Customer");
  const [typeOfFile, setTypeOfFile] = useState("Image");
  const [uploadedFile, setUploadedFile] = useState("");
  const [approvalForm, setApprovalForm] = useState({
    Description: "",
    approvalBelongsTo: "",
    categories: "",
    createdAt: "",
    customerOrVendorRef: "",
    approverName: "",
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
      approverName: "",
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
              const userData = (
                filter === "Customer" ? customers : vendors
              ).find((ele) => ele.id === id);

              setApprovalForm((val) => ({
                ...val,
                customerOrVendorRef: id,
                approverName: userData.name,
                phoneNumber: userData.phone,
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
          <label
            htmlFor="file"
            className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
          >
            <div className="flex  items-center justify-center gap-1">
              {uploadedFile?.name ? (
                <span className="py-1 px-4">{uploadedFile?.name}</span>
              ) : (
                <>
                  <svg viewBox="0 0 640 512" className="h-8 fill-gray-600">
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
              accept={typeOfFile === "Image" ? "image/*" : "application/pdf"}
              onChange={(e) => {
                setUploadedFile(e.target.files[0]);
              }}
            />
          </label>

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
