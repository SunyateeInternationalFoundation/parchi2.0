import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db, storage } from "../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

const Assets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetCount, setAssetCount] = useState({
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const fetchAsset = async () => {
    setLoading(true);
    try {
      const companyRef = doc(
        db,
        "companies",
        userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId
      );

      const assetRef = collection(db, "assets");

      const q = query(assetRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const assetData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetData);
      setAssetCount({
        total: assetData.length,
      });
      setTotalPages(Math.ceil(assetData.length / 10)); // Set total pages based on the data length
      setPaginationData(assetData.slice(0, 10)); // Set initial pagination data
    } catch (error) {
      console.error("Error fetching Assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, []);

  useEffect(() => {
    // Update pagination data when assets or currentPage changes
    setPaginationData(assets.slice(currentPage * 10, currentPage * 10 + 10));
    setTotalPages(Math.ceil(assets.length / 10)); // Update total pages based on assets length
  }, [assets, currentPage]);

  const handleAddAsset = (newAsset) => {
    setAssets((prev) => [...prev, newAsset]);
    setAssetCount((prev) => ({
      total: prev.total + 1,
    }));
  };

  async function OnDeleteAsset(assetId) {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this asset?"
      );
      if (!confirm) return;

      await deleteDoc(doc(db, "assets", assetId));

      setAssets((prev) => {
        const updatedAsset = prev.filter((des) => des.id !== assetId);

        setAssetCount({ total: updatedAsset.length });

        return updatedAsset;
      });
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  }

  return (
    <div className="main-container" style={{ width: "100%", height: "82vh" }}>
      <div className="container">
        <header className="flex items-center justify-between px-5">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">Assets</h1>
            <div className="input-div-icon">
              <input
                type="text"
                placeholder="Search by asset..."
                className=" w-full "
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <IoSearch />
            </div>
          </div>

          <button
            className="btn-add"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            + Create Asset
          </button>
        </header>

        {/* <div className="space-y-1">
          <div className="text-4xl text-blue-700 font-bold">
            {assetCount.total}
          </div>
          <div className="space-y-1">Total Assets</div>
        </div> */}

        <div className="space-y-1">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="overflow-y-auto py-3" style={{ height: "76vh" }}>
              <table className="w-full border-collapse text-start">
                <thead className="bg-white">
                  <tr className="border-b">
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Id
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Name
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      value
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Assign Staff
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                      Delete
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((asset) => (
                      <tr
                        key={asset.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={asset.createdAt} />
                        </td>
                        <td className="px-5 py-3 text-start">
                          {asset.assetId}
                        </td>
                        <td className="px-5 py-3 text-start">
                          {asset.assetName}
                        </td>
                        <td className="px-5 py-3 text-start">{asset.value}</td>
                        <td className="px-5 py-3 text-start">
                          {asset.assignedTo}
                        </td>
                        <td
                          className="px-12 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className="text-red-500 flex items-center justify-end"
                            onClick={() => OnDeleteAsset(asset.id)}
                          >
                            <RiDeleteBin6Line />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="h-24 text-center py-4">
                        No Asset Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
      {isModalOpen && (
        <AddAssetModal
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          onAddAsset={handleAddAsset}
          companyId={companyDetails.companyId}
        />
      )}
    </div>
  );
};

const AddAssetModal = ({ onClose, onAddAsset, isOpen, companyId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [formData, setFormData] = useState({
    assetName: "",
    assetId: "",
    assignedTo: "",
    image: null,
    value: "",
  });
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const staffRef = collection(db, "staff");
        const companyRef = doc(db, "companies", companyId);

        const q = query(staffRef, where("companyRef", "==", companyRef));
        const staffSnapshot = await getDocs(q);
        const staffList = staffSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStaffData(staffList);
      } catch (error) {
        console.error("Error fetching staff details:", error);
      }
    };
    fetchStaffDetails();
  }, [companyDetails.companyId]);

  const handleAddAsset = async (e) => {
    e.preventDefault();

    const { assetName, assetId, assignedTo, value, image } = formData;

    if (!assetName.trim()) {
      alert("Asset name is required");
      return;
    }

    setIsLoading(true);

    try {
      let fileUrl = "";
      if (image) {
        const storageRef = ref(storage, `assets/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        fileUrl = await getDownloadURL(storageRef);
      }

      const newAsset = {
        assetName,
        assetId,
        assignedTo,
        image: fileUrl,
        value,
      };

      const companyRef = doc(db, "companies", companyDetails.companyId);

      const payload = {
        ...newAsset,
        companyRef: companyRef,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, "assets"), payload);

      onAddAsset({ id: docRef.id, ...payload });
      onClose();
    } catch (error) {
      console.error("Error adding asset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files[0],
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-sm text-gray-600 ">Asset Details</h2>
          <button
            onClick={onClose}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={handleAddAsset}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <div className="grid w-full mb-2 items-center gap-1.5">
                <div className="text-sm text-gray-600 ">Upload Image</div>
                <label
                  htmlFor="file"
                  className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                >
                  <div className="flex  items-center justify-center gap-1">
                    {formData?.image?.name ? (
                      <span className="py-1 px-4">{formData?.image?.name}</span>
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
              <label className="text-sm text-gray-600">Asset Name</label>
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="Asset Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Asset Id</label>
              <input
                type="text"
                name="assetId"
                value={formData.assetId}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="Asset Id"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Value of Assets</label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full input-tag"
                placeholder="Value of Asset"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Assign Staff</label>

              <Select
                value={formData.assignedTo || ""}
                onValueChange={(val) => {
                  setFormData((pre) => ({
                    ...pre,
                    assignedTo: val,
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {staffData.map((staff) => (
                    <SelectItem value={staff.name} key={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {isLoading ? "Adding..." : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Assets;
