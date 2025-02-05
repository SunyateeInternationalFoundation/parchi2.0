import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbEdit } from "react-icons/tb";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const [selectedEditDes, setSelectedEditDes] = useState({});
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
      setTotalPages(Math.ceil(designationData.length / 10));
      setPaginationData(designationData.slice(0, 10));
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
  const handleEditDesignation = (updatedDes) => {
    setDesignation((prev) =>
      prev.map((des) =>
        des.id === updatedDes.id ? { ...des, ...updatedDes } : des
      )
    );
  };
  const navigate = useNavigate();

  async function OnDeleteDesignation(designationId, name) {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this Designation?"
      );
      if (!confirm) return;
      const ref = doc(db, "designations", designationId);
      await deleteDoc(ref);
      await addDoc(
        collection(
          db,
          "companies",
          userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId,
          "audit"
        ),
        {
          ref: ref,
          date: serverTimestamp(),
          section: "Staff&Payout",
          action: "Delete",
          description: `${name} designation deleted`,
        }
      );
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
  useEffect(() => {
    const filteredDesignations = designation.filter((d) =>
      d.designationName.toLowerCase().includes(searchInput.toLowerCase())
    );
    setPaginationData(
      filteredDesignations.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, designation, searchInput]);

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container2">
        <header className="flex items-center justify-between px-5">
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
            <div className="py-3" style={{ height: "92vh" }}>
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
                      Action
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.length > 0 ? (
                    paginationData.map((designation) => (
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
                        <td className="px-8 py-3 ">
                          <div className="flex items-center justify-end space-x-4">
                            <TbEdit
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEditDes(designation);
                                setIsModalOpen(true);
                              }}
                              className="text-green-500"
                            />
                            <RiDeleteBin6Line
                              onClick={(e) => {
                                e.preventDefault();
                                OnDeleteDesignation(
                                  designation.id,
                                  designation.designationName
                                );
                              }}
                              className="text-red-500 "
                            />
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
          <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
            <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
              {currentPage + 1} of {totalPages || 1} row(s) selected.
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
          <AddDesignationModal
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEditDes({});
            }}
            onAddDesignation={handleAddDesignation}
            editDes={selectedEditDes}
            handleEditDesignation={handleEditDesignation}
          />
        )}
      </div>
    </div>
  );
};

const AddDesignationModal = ({
  onClose,
  onAddDesignation,
  editDes,
  handleEditDesignation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [designationName, setDesignationName] = useState(
    editDes?.designationName || ""
  );
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const handleDesignation = async () => {
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
      };
      let docRef;

      const q = editDes?.id
        ? query(
            collection(db, "staff"),
            where("companyRef", "==", companyRef),
            where("designation", "==", editDes.designationName)
          )
        : query(collection(db, "staff"), where("companyRef", "==", companyRef));

      const getData = await getDocs(q);
      const staffData = getData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let payloadLog = {
        ref: docRef,
        date: serverTimestamp(),
        section: "Staff&Payout",
        action: "Create",
        description: `${designationName} designation created`,
      };
      if (editDes?.id) {
        docRef = doc(db, "designations", editDes.id);

        await updateDoc(docRef, {
          updatedAt: Timestamp.fromDate(new Date()),
          ...payload,
        });

        for (const staff of staffData) {
          const staffRef = doc(db, "staff", staff.id);
          await updateDoc(staffRef, { designation: designationName });
        }

        handleEditDesignation({ id: docRef.id, ...payload });
        payloadLog.ref = docRef;
        payloadLog.action = "Update";
        payloadLog.description = `${designationName} designation updated`;
      } else {
        docRef = await addDoc(collection(db, "designations"), {
          createdAt: Timestamp.fromDate(new Date()),
          ...payload,
        });

        onAddDesignation({
          id: docRef.id,
          createdAt: Timestamp.fromDate(new Date()),
          ...payload,
        });
        payloadLog.ref = docRef;
      }
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        payloadLog
      );
      onClose();
    } catch (error) {
      console.error("Error adding Designation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 opacity-100 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white  pt-2 transform transition-transform translate-x-0"
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-sm text-gray-600 ">Add Designation</h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={() => {
              onClose();
            }}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="p-5 space-y-1" style={{ height: "84vh" }}>
          <label htmlFor="designationName" className="text-sm text-gray-600">
            Designation Name
          </label>
          <input
            id="designationName"
            type="text"
            className="w-full input-tag"
            value={designationName}
            onChange={(e) => setDesignationName(e.target.value)}
          />
        </div>
        <div
          className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
          style={{ height: "6vh" }}
        >
          <button
            onClick={handleDesignation}
            className="btn-add w-full"
            disabled={isLoading}
          >
            {isLoading
              ? !editDes.id
                ? "Adding..."
                : "Editing"
              : !editDes.id
              ? "Add Designation"
              : "Edit Designation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Designation;
