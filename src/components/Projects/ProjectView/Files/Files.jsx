import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../../../constants/FormatTimestamp";
import { db } from "../../../../firebase";

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
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  console.log("userDetails", userDetails);
  console.log("companyId", companyId);
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.files;
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
      className="bg-white-500 px-8 py-4 overflow-y-auto"
      style={{ height: "82vh" }}
    >
      <div className="bg-white rounded-lg">
        <div className="flex items-center justify-between p-5">
          <div className="flex space-x-3">
            <h1 className="text-xl font-bold">Files</h1>
          </div>

          {(userDetails.selectedDashboard === "" || role?.access) && (
            <button
              className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
              onClick={() => setIsModalOpen(true)}
            >
              + Add File
            </button>
          )}
        </div>
        <div className=" rounded-lg overflow-y-auto" style={{ height: "80vh" }}>
          <table className="w-full border-collapse text-start">
            <thead className=" bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  File
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Date
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Whom
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Name
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Phone
                </td>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((file) => {
                  const customer = customers.find(
                    (customer) => customer.id === file.customerOrVendorRef
                  );
                  const vendor = vendors.find(
                    (vendor) => vendor.id === file.customerOrVendorRef
                  );

                  const phoneNumber = customer
                    ? customer.phone
                    : vendor
                    ? vendor.phone
                    : "N/A";

                  return (
                    <tr
                      key={file.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                    >
                      <td className="px-8 py-3 text-start flex">
                        <img
                          src={file.fileURL}
                          alt={file.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        {file.name}
                      </td>
                      <td className="px-5 py-3 text-start">
                        <FormatTimestamp timestamp={file.createdAt} />
                      </td>
                      <td className="px-5 py-3 text-start">
                        {customer ? "Customer" : "Vendor"}
                      </td>
                      <td className="px-5 py-3 text-start">
                        {customer ? customer?.name : vendor?.name}
                      </td>
                      <td className="px-5 py-3 text-start">{phoneNumber}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="h-24 text-center py-4 ">
                    No Item Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
