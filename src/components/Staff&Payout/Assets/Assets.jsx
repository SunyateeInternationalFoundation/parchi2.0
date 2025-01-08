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
    } catch (error) {
      console.error("Error fetching Assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [companyDetails.companyId]);

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

      setAsset((prev) => {
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
        <header className="flex items-center justify-between p-5">
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

        {/* <div>
          <div className="text-4xl text-blue-700 font-bold">
            {assetCount.total}
          </div>
          <div>Total Assets</div>
        </div> */}

        <div>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "76vh" }}>
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
                  {assets.length > 0 ? (
                    assets.map((asset) => (
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
        {/* <div>
          {loading ? (
            <div className="text-center py-6">Loading Assets...</div>
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                setAsset={setAssets}
                setAssetCount={setAssetCount}
                companyId={companyDetails.companyId}
              />
            ))
          ) : (
            <div className="text-center border-2 shadow cursor-pointer rounded-lg p-3 mt-3">
              No Asset
            </div>
          )}
        </div> */}

        {isModalOpen && (
          <AddAssetModal
            onClose={() => setIsModalOpen(false)}
            isOpen={isModalOpen}
            onAddAsset={handleAddAsset}
            companyId={companyDetails.companyId}
          />
        )}
      </div>
    </div>
  );
};

// const AssetCard = ({ asset, setAsset, setAssetCount, companyId }) => {
//   return (
//     <div className="bg-white p-4 rounded shadow">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold"></h2>
//         <button
//           onClick={(e) => }
//           className="text-white bg-red-500 h-6 w-6 font-bold text-center rounded-full flex items-center justify-center"
//         >
//           <div className="w-3 h-1 bg-white"></div>
//         </button>
//       </div>
//     </div>
//   );
// };

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
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5 ">Asset Details</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>

        <form className="space-y-1.5" onSubmit={handleAddAsset}>
          <div>
            <div className="grid w-full mb-2 items-center gap-1.5">
              <label className="text-sm block font-semibold ">
                Upload Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
              />
            </div>
          </div>
          <hr />
          <div>
            <label className="text-sm block font-semibold">Asset Name</label>
            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Asset Name"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">Asset Id</label>
            <input
              type="text"
              name="assetId"
              value={formData.assetId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Asset Id"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">
              Value of Assets
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Value of Asset"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">Assign Staff</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="" disabled>
                No Assets
              </option>
              {staffData.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded-md mt-4 ${
              isLoading ? "bg-gray-400" : "bg-purple-500 text-white"
            }`}
          >
            {isLoading ? "Adding..." : "Add Asset"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assets;
