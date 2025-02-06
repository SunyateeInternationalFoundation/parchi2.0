import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db, storage } from "../../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../UI/select";

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

  async function onCreateApproval(e) {
    e.preventDefault();
    try {
      const storageRef = ref(storage, `files/${uploadedFile.name}`);
      await uploadBytes(storageRef, uploadedFile);
      const fileURL = await getDownloadURL(storageRef);
      const fileField = typeOfFile === "Image" ? "image" : "pdfUrl";
      const payload = {
        ...approvalForm,
        approvalBelongsTo: filter,
        categories: filter,
        createdAt: Timestamp.fromDate(new Date()),
        typeOfFile: typeOfFile,
        who: userDetails.selectedDashboard === "staff" ? "Staff" : "Owner",
      };
      payload.file[fileField] = fileURL;
      const approvalsRef = collection(db, `projects/${projectId}/approvals`);
      const refer = await addDoc(approvalsRef, payload);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: refer,
        date: serverTimestamp(),
        section: "Project",
        action: "Create",
        description: `${approvalForm.name} approval created in project`,
      });
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
          <h2 className=" text-sm text-gray-600 ">Create Approval</h2>
          <button
            onClick={onClose}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onCreateApproval}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Approval Name</label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Enter Approval Name"
                onChange={(e) =>
                  setApprovalForm((val) => ({ ...val, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Description</label>
              <input
                type="text"
                className="input-tag w-full"
                placeholder="Enter Description"
                onChange={(e) =>
                  setApprovalForm((val) => ({
                    ...val,
                    Description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex space-x-2 space-y-1">
              {["Customer", "Vendor"].map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`btn-outline-black ${
                    filter === category && "bg-black text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Select {filter}</label>
              <Select
                onValueChange={(id) => {
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
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filter}`} />
                </SelectTrigger>
                <SelectContent>
                  {(filter === "Customer" ? customers : vendors).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Choose File</label>
              <div className="flex space-x-2 space-y-1">
                {["Image", "Pdf"].map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setTypeOfFile(category)}
                    className={`btn-outline-black ${
                      typeOfFile === category && "bg-black text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="space-y-1 grid">
                <label
                  htmlFor="file"
                  className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                >
                  <div className="flex  items-center justify-center gap-1">
                    {uploadedFile?.name ? (
                      <span className="py-1 px-4">{uploadedFile?.name}</span>
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
                    accept={
                      typeOfFile === "Image" ? "image/*" : "application/pdf"
                    }
                    onChange={(e) => {
                      setUploadedFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
              <div className="text-sm text-gray-600">
                File size should not exceed 5 mb
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Priority</label>
              <div className="space-y-1">
                <Select
                  onValueChange={(value) => {
                    setApprovalForm((pre) => ({
                      ...pre,
                      priority: value,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select Priority`} />
                  </SelectTrigger>
                  <SelectContent className="h-18">
                    <SelectItem value={"High"}>High</SelectItem>
                    <SelectItem value={"Medium"}>Medium</SelectItem>
                    <SelectItem value={"Low"}>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="w-full border-t bg-white sticky bottom-0 px-5 py-3">
            <button type="submit" className="w-full btn-add">
              Create Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateApproval;
