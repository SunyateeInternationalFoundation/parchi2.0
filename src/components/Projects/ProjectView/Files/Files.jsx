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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../UI/select";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

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

  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

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
      setTotalPages(Math.ceil(filesData.length / 10)); 
      setPaginationData(filesData.slice(0, 10)); 
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }

  useEffect(() => {
   
    setPaginationData(files.slice(currentPage * 10, currentPage * 10 + 10));
    setTotalPages(Math.ceil(files.length / 10));
  }, [files, currentPage]);

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

  const handleSelectionChange = (selectedId) => {
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
              {paginationData.length > 0 ? (
                paginationData.map((file) => {
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
                  <td colSpan="5" className="h-24 text-center py-4 ">
                    No file Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage + 1} of {totalPages || 1} page(s)
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
      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white  pt-2 transform transition-transform "
            style={{ maxHeight: "100vh", width: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex justify-between items-center border-b px-5 py-3"
              style={{ height: "6vh" }}
            >
              <h2 className="text-sm text-gray-600 ">Add Files to Project</h2>
              <button
                className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <IoMdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleAddFile}>
              <div
                className="space-y-2 px-5 overflow-y-auto"
                style={{ height: "84vh" }}
              >
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">File Name</label>
                  <input
                    type="text"
                    className="w-full input-tag"
                    placeholder="Enter file name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex space-x-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleTabClick("customers")}
                    className={`btn-outline-black ${
                      activeTab === "customers" && "bg-black text-white"
                    }`}
                  >
                    Customers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabClick("vendors")}
                    className={`btn-outline-black ${
                      activeTab === "vendors" && "bg-black text-white"
                    }`}
                  >
                    Vendors
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">
                    Select {activeTab.slice(0, -1)}
                  </label>

                  <Select
                    value={formData.customerOrVendorRef}
                    onValueChange={handleSelectionChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${activeTab.slice(0, -1)}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeTab === "customers" ? customers : vendors).map(
                        (item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid space-y-1">
                  <label className="text-sm text-gray-600">Upload File</label>

                  <label
                    htmlFor="file"
                    className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                  >
                    <div className="flex  items-center justify-center gap-1">
                      {formData?.file?.name ? (
                        <span className="py-1 px-4">
                          {formData?.file?.name}
                        </span>
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
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                    />
                  </label>
                </div>
              </div>

              <div
                className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
                style={{ height: "6vh" }}
              >
                <button type="submit" className="w-full btn-add">
                  {loading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
