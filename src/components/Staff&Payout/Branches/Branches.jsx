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
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

const Branches = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [branchesCount, setBranchesCount] = useState({
    total: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

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
      setTotalPages(Math.ceil(branchesData.length / 10)); // Set total pages based on the data length
      setPaginationData(branchesData.slice(0, 10)); // Set initial pagination data
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, [companyId]);

  useEffect(() => {
    // Update pagination data when branches or currentPage changes
    setPaginationData(branches.slice(currentPage * 10, currentPage * 10 + 10));
    setTotalPages(Math.ceil(branches.length / 10)); // Update total pages based on branches length
  }, [branches, currentPage]);

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
    <div className="main-container " style={{ height: "82vh" }}>
      <div className="container ">
        <header className="flex items-center justify-between px-5">
          <div className="flex space-x-3  items-center">
            <h1 className="text-2xl font-bold">Branches</h1>
            <div className="input-div-icon">
              <input
                type="text"
                placeholder="Search by Branch Name..."
                className=" w-full"
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
              <IoSearch />
            </div>
          </div>

          <button
            className="btn-add "
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            + Create Branch
          </button>
        </header>

        {/* <div className="space-y-1">
          <div className="text-4xl text-blue-700 font-bold">
            {branchesCount.total}
          </div>
          <div>Total Branches</div>
        </div> */}
        <div>
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
                      Name
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Address
                    </td>
                    <td className="px-8 py-1 text-gray-400 font-semibold text-end">
                      Delete
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((branch) => (
                      <tr
                        key={branch.id}
                        className="border-b border-gray-200 text-center cursor-pointer"
                      >
                        <td className="px-8 py-3 text-start">
                          <FormatTimestamp timestamp={branch.createdAt} />
                        </td>
                        <td className="px-5 py-3 text-start">
                          {branch.branchName}
                        </td>
                        <td className="px-5 py-3 text-start">
                          {branch?.address?.address}
                        </td>
                        <td
                          className="px-12 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className="text-red-500 flex items-center justify-end"
                            onClick={() => OnDeleteBranch(branch.id)}
                          >
                            <RiDeleteBin6Line />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="h-24 text-center py-4">
                        No Branch Found
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
        <AddBranchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddBranch={handleAddBranch}
          companyId={companyId}
        />
      )}
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
          <h2 className="text-xl font-semibold mb-5 ">Branch Details</h2>
          <button
            onClick={onClose}
            className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onCreateBranch}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Branch Name</label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                className="input-tag w-full"
                placeholder="Branch Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">City</label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="input-tag w-full"
                placeholder="City"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address.address}
                onChange={handleInputChange}
                className="input-tag w-full"
                placeholder="Address"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 ">Pin Code</label>
              <input
                type="text"
                name="zip_code"
                value={formData.address.zip_code}
                onChange={handleInputChange}
                className="input-tag w-full"
                placeholder="Pin Code"
              />
            </div>
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              {isLoading ? "Adding..." : "Add Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Branches;
