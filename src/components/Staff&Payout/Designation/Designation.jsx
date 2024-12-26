import React, { useState, useEffect } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";

const Designation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [designation, setDesignation] = useState([]);
  const [designationCount, setDesignationCount] = useState({
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchDesignation = async () => {
    setLoading(true);
    try {
      const companyRef = doc(
        db,
        "companies",
        userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId
      );

      const designationRef = collection(db, "designations");

      const q = query(designationRef, where("companyRef", "==", companyRef));
      const querySnapshot = await getDocs(q);

      const designationData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDesignation(designationData);
      setDesignationCount({
        total: designationData.length,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignation();
  }, [companyDetails.companyId]);

  const handleAddDesignation = (newDesignation) => {
    setDesignation((prev) => [...prev, newDesignation]);
    setDesignationCount((prev) => ({
      total: prev.total + 1,
    }));
  };

  const filteredDesignations = designation.filter((d) =>
    d.designationName.toLowerCase().includes(searchInput.toLowerCase())
  );

  const navigate = useNavigate();

  async function OnDeleteDesignation(e, designationId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this Designation?"
      );
      if (!confirm) return;

      await deleteDoc(doc(db, "designations", designationId));

      setDesignation((prev) => {
        const updatedDesignation = prev.filter(
          (des) => des.id !== designationId
        );

        setDesignationCount({ total: updatedDesignation.length });

        return updatedDesignation;
      });
    } catch (error) {
      console.error("Error deleting Designation:", error);
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

            <h1 className="text-2xl font-bold">Designations</h1>
          </div>

          <button
            className="bg-blue-500 text-white py-1 px-2 rounded "
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            + Create Designation
          </button>
        </header>
        <div className="flex items-center bg-white space-x-4 mb-4 border p-2 rounded">
          <input
            type="text"
            placeholder="Search by Designation Name..."
            className=" w-full focus:outline-none"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
          <IoSearch />
        </div>
        <div>
          <div className="text-4xl text-blue-700 font-bold">
            {designationCount.total}
          </div>
          <div>Total Designations</div>
        </div>
        <div>
          {loading ? (
            <div className="text-center py-6">Loading Designations...</div>
          ) : filteredDesignations.length > 0 ? (
            filteredDesignations.map((designation) => (
              <div className="mt-4" key={designation.id}>
                <div
                  className="bg-white p-4 rounded shadow"
                  key={designation.id}
                  onClick={() => navigate(designation.designationName)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {designation.designationName}
                    </h2>
                    <button
                      onClick={(e) => OnDeleteDesignation(e, designation.id)}
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
              No Designation
            </div>
          )}
        </div>

        {isModalOpen && (
          <AddDesignationModal
            onClose={() => setIsModalOpen(false)}
            onAddDesignation={handleAddDesignation}
          />
        )}
      </div>
    </div>
  );
};

const AddDesignationModal = ({ onClose, onAddDesignation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [designationName, setDesignationName] = useState("");
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const handleAddDesignation = async () => {
    if (!designationName.trim()) {
      alert("Designation name is required");
      return;
    }
    setIsLoading(true);

    try {
      const newDesignation = {
        designationName: designationName,
      };

      const companyRef = await doc(db, "companies", companyDetails.companyId);

      const payload = {
        ...newDesignation,
        companyRef: companyRef,
        createdAt: Timestamp.fromDate(new Date()),
      };
      const docRef = await addDoc(collection(db, "designations"), payload);

      onAddDesignation({ id: docRef.id, ...payload });
      onClose();
    } catch (error) {
      console.error("Error adding Designation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
      <div className="bg-white w-full max-w-sm p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Designation</h2>
        <div className="mb-4">
          <label htmlFor="designationName" className="block text-gray-700 mb-2">
            Designation Name
          </label>
          <input
            id="designationName"
            type="text"
            className="w-full p-2 border rounded"
            value={designationName}
            onChange={(e) => setDesignationName(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddDesignation}
            className={`${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            } text-white px-4 py-2 rounded hover:bg-blue-600 transition`}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Designation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Designation;
