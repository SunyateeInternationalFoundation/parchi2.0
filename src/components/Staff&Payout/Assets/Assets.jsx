import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { db, storage } from "../../../firebase";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

  const handleAddasset = (newAsset) => {
    setAssets((prev) => [...prev, newAsset]);
    setAssetCount((prev) => ({
      total: prev.total + 1,
    }));
  };
  return (
    <div className="w-full" style={{ width: "100%", height: "92vh" }}>
      <div
        className="px-8 pb-8 pt-5 bg-gray-100"
        style={{ width: "100%", height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <div className="flex space-x-3">
            <Link
              className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
              to={"./../"}
            >
              <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>

            <h1 className="text-2xl font-bold">Assets</h1>
          </div>

          <button
            className="bg-blue-500 text-white py-1 px-2 rounded "
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            + Create Asset
          </button>
        </header>
        <div className="flex items-center bg-white space-x-4 mb-4 border p-2 rounded">
          <input
            type="text"
            placeholder="Search by asset..."
            className=" w-full focus:outline-none"
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <IoSearch />
        </div>
        <div>
          <div className="text-4xl text-blue-700 font-bold">
            {assetCount.total}
          </div>
          <div>Total Assets</div>
        </div>
        <div>
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
        </div>

        {isModalOpen && (
          <AddAssetModal
            onClose={() => setIsModalOpen(false)}
            isOpen={isModalOpen}
            onAddasset={handleAddasset}
            companyId={companyDetails.companyId}
          />
        )}
      </div>
    </div>
  );
};

const AssetCard = ({ asset, setAsset, setAssetCount, companyId }) => {
  async function OnDeleteAsset(e, assetId) {
    e.stopPropagation();
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
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{asset.asset_name}</h2>
        <button
          onClick={(e) => OnDeleteAsset(e, asset.id)}
          className="text-white bg-red-500 h-6 w-6 font-bold text-center rounded-full flex items-center justify-center"
        >
          <div className="w-3 h-1 bg-white"></div>
        </button>
      </div>
    </div>
  );
};

const AddAssetModal = ({ onClose, onAddasset, isOpen, companyId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [formData, setFormData] = useState({
    asset_name: "",
    asset_id: "",
    assignedTo: "",
    photograph_of_asset: null,
    value_of_asset: "",
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

    const {
      asset_name,
      asset_id,
      assignedTo,
      value_of_asset,
      photograph_of_asset,
    } = formData;

    if (!asset_name.trim()) {
      alert("Asset name is required");
      return;
    }

    setIsLoading(true);

    try {
      let fileUrl = "";
      if (photograph_of_asset) {
        const storageRef = ref(
          storage,
          `assets/${Date.now()}_${photograph_of_asset.name}`
        );
        await uploadBytes(storageRef, photograph_of_asset);
        fileUrl = await getDownloadURL(storageRef);
      }

      const newAsset = {
        asset_name,
        asset_id,
        assignedTo,
        photograph_of_asset: fileUrl,
        value_of_asset,
      };

      const companyRef = doc(db, "companies", companyDetails.companyId);

      const payload = {
        ...newAsset,
        companyRef: companyRef,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, "assets"), payload);

      onAddasset({ id: docRef.id, ...payload });
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
        photograph_of_asset: e.target.files[0],
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
              name="asset_name"
              value={formData.asset_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Asset Name"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">Asset Id</label>
            <input
              type="text"
              name="asset_id"
              value={formData.asset_id}
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
              name="value_of_asset"
              value={formData.value_of_asset}
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
