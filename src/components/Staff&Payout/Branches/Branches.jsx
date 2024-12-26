import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../firebase";
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

const Branches = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [branchesCount, setBranchesCount] = useState({
    total: 0,
  });

  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const companyRef = doc(
        db,
        "companies",
        userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId
      );

      const branchesRef = collection(db, "branches");

      const q = query(branchesRef, where("companyRef", "==", companyRef));

      const querySnapshot = await getDocs(q);

      const branchesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBranches(branchesData);
      setBranchesCount({
        total: branchesData.length,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, [companyId]);

  const handleAddBranch = (newBranch) => {
    setBranches((prev) => [...prev, newBranch]);
    setBranchesCount((prev) => ({
      total: prev.total + 1,
    }));
  };

  const filteredBranches = branches.filter((b) =>
    b.branchName.toLowerCase().includes(searchInput.toLowerCase())
  );
  async function OnDeleteBranch(e, branchId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this Branch?"
      );
      if (!confirm) return;

      await deleteDoc(doc(db, "branches", branchId));

      setBranches((prev) => {
        const updatedBranches = prev.filter((branch) => branch.id !== branchId);

        setBranchesCount({ total: updatedBranches.length });

        return updatedBranches;
      });
    } catch (error) {
      console.error("Error deleting Branch:", error);
    }
  }
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
            </Link>

            <h1 className="text-2xl font-bold">Branches</h1>
          </div>

          <button
            className="bg-blue-500 text-white py-1 px-2 rounded "
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            + Create Branch
          </button>
        </header>
        <div className="flex items-center bg-white space-x-4 mb-4 border p-2 rounded">
          <input
            type="text"
            placeholder="Search by Branch Name..."
            className=" w-full focus:outline-none"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
          <IoSearch />
        </div>
        <div>
          <div className="text-4xl text-blue-700 font-bold">
            {branchesCount.total}
          </div>
          <div>Total Branches</div>
        </div>
        <div>
          {loading ? (
            <div className="text-center py-6">Loading Branches...</div>
          ) : filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => (
              <div className="mt-4" key={branch.id}>
                <div className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {branch.branchName}
                    </h2>
                    <button
                      onClick={(e) => OnDeleteBranch(e, branch.id)}
                      className="text-white bg-red-500 h-6 w-6 font-bold text-center rounded-full flex items-center justify-center"
                    >
                      <div className="w-3 h-1 bg-white"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center border-2 shadow cursor-pointer rounded-lg p-3 mt-3">
              No Branches
            </div>
          )}
        </div>

        {isModalOpen && (
          <AddBranchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddBranch={handleAddBranch}
            companyId={companyId}
          />
        )}
      </div>
    </div>
  );
};

const AddBranchModal = ({ isOpen, onClose, onAddBranch, companyId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    branchName: "",
    address: {
      address: "",
      city: "",
      zip_code: "",
    },
  });

  async function onCreateBranch(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { branchName } = formData;

      if (!branchName.trim()) {
        alert("Branch name is required");
        setIsLoading(false);
        return;
      }

      const companyRef = await doc(db, "companies", companyId);
      const payload = {
        ...formData,
        companyRef: companyRef,
        createdAt: Timestamp.fromDate(new Date()),
      };
      const branchRef = await addDoc(collection(db, "branches"), payload);
      onAddBranch({ id: branchRef.id, ...payload });
      alert("Branch successfully created!");
      setFormData({
        branchName: "",
        address: {
          address: "",
          city: "",
          zip_code: "",
        },
      });
      onClose();
    } catch (error) {
      console.error("Error creating Branch:", error);
      alert("Failed to create Branch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "address" || name === "city" || name === "zip_code") {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5 ">Branch Details</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>

        <form className="space-y-1.5" onSubmit={onCreateBranch}>
          <div>
            <label className="text-sm block font-semibold">Branch Name</label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Branch Name"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">City</label>
            <input
              type="text"
              name="city"
              value={formData.address.city}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="City"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address.address}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Address"
            />
          </div>
          <div>
            <label className="text-sm block font-semibold ">Pin Code</label>
            <input
              type="text"
              name="zip_code"
              value={formData.address.zip_code}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Pin Code"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded-md mt-4 ${
              isLoading ? "bg-gray-400" : "bg-purple-500 text-white"
            }`}
          >
            {isLoading ? "Adding..." : "Add Branch"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Branches;
