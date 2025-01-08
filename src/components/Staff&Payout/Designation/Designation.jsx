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
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";

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

  async function OnDeleteDesignation(designationId) {
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
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <header className="flex items-center justify-between p-5">
          <div className="flex space-x-3 items-center ">
            <div className="flex space-x-3 ">
              <h1 className="text-2xl font-bold">Designations</h1>
            </div>
            <div className="flex items-center bg-white space-x-4  border p-2 rounded-md">
              <input
                type="text"
                placeholder="Search by Designation Name..."
                className=" w-full focus:outline-none"
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
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
            + Create Designation
          </button>
        </header>

        {/* <div>
          <div className="text-4xl text-blue-700 font-bold">
            {designationCount.total}
          </div>
          <div>Total Designations</div>
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
                      Name
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                      Delete
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesignations.length > 0 ? (
                    filteredDesignations.map((designation) => (
                      <tr
                        key={designation.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                        onClick={() =>
                          navigate(
                            "designations/" + designation.designationName
                          )
                        }
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={designation.createdAt} />
                        </td>
                        <td className="px-5 py-3 text-start">
                          {designation.designationName}
                        </td>
                        <td
                          className="px-12 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className="text-red-500 flex items-center justify-end"
                            onClick={() => OnDeleteDesignation(designation.id)}
                          >
                            <RiDeleteBin6Line />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="h-24 text-center py-4">
                        No Designation Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
