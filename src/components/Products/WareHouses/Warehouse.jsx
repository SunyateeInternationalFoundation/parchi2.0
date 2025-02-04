import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import FormatTimestamp from "../../../constants/FormatTimestamp";
import { db } from "../../../firebase";
import SetWarehouse from "./SetWarehouse";

const Warehouse = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerms, setSearchTerms] = useState("");
  const [warehousesCount, setWarehousesCount] = useState({
    total: 0,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchWarehouse = async () => {
    const warehousesRef = collection(
      db,
      "companies",
      companyDetails.companyId,
      "warehouses"
    );
    const snapshot = await getDocs(warehousesRef);

    const warehousesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setWarehouses(warehousesData);
    setWarehousesCount({
      total: warehousesData.length,
    });
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const handleAddWarehouse = (newWarehouse) => {
    setWarehouses((prev) => [...prev, newWarehouse]);
    setWarehousesCount((prev) => ({
      total: prev.total + 1,
    }));
  };

  async function OnDeleteWarehouse(e, warehouseId, name) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this warehouse?"
      );
      if (!confirm) return;
      const wareRef = doc(
        db,
        "companies",
        companyDetails.companyId,
        "warehouses",
        warehouseId
      );
      await deleteDoc(wareRef);
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        {
          ref: wareRef,
          date: serverTimestamp(),
          section: "Inventory",
          action: "Delete",
          description: `${name} removed from warehouse`,
        }
      );
      setWarehouses((prev) => {
        const updatedWarehouses = prev.filter(
          (ware) => ware.id !== warehouseId
        );

        setWarehousesCount({ total: updatedWarehouses.length });

        return updatedWarehouses;
      });
    } catch (error) {
      console.error("Error deleting warehouse:", error);
    }
  }

  useEffect(() => {
    const filterWarehouses = warehouses.filter((warehouse) => {
      if (!searchTerms) {
        return true;
      }
      return warehouse.name.toLowerCase().includes(searchTerms.toLowerCase());
    });
    setPaginationData(
      filterWarehouses.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, warehouses, searchTerms]);

  return (
    <div className="main-container overflow-y-auto" style={{ height: "81vh" }}>
      <div className="flex justify-center items-center">
        <div className="container2">
          <div className="flex justify-between items-center px-5 ">
            <div
              className="flex items-center space-x-4  border
                         px-5  py-3 rounded-md w-1/2"
            >
              <input
                type="text"
                placeholder="Search..."
                className=" w-full focus:outline-none"
                onChange={(e) => setSearchTerms(e.target.value)}
              />
              <IoSearch />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
            >
              + Create Warehouse
            </button>
          </div>
          <div
            className=" rounded-lg py-3 overflow-hidden"
            style={{ minHeight: "92vh" }}
          >
            <table className="w-full border-collapse text-start  ">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Date
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Name
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Phone
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Address
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Delete
                  </td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      className="border-b-2 border-gray-200 "
                    >
                      <td className="px-8 py-3 text-start ">
                        <FormatTimestamp timestamp={warehouse.createdAt} />
                      </td>
                      <td className="px-5 py-3 text-start">{warehouse.name}</td>
                      <td className="px-5 py-3 text-start">
                        {warehouse.phone || ""}
                      </td>
                      <td className="px-5 py-3 text-start">
                        {warehouse.location?.address || ""}
                      </td>
                      <td
                        className="px-5 py-3 text-start text-red-700 text-2xl"
                        onClick={(e) => {
                          e.preventDefault();
                          OnDeleteWarehouse(e, warehouse.id, warehouse.name);
                        }}
                      >
                        <IoMdTrash />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="h-24 text-center py-4 ">
                      No Item Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
      </div>
      <SetWarehouse
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        onAddWarehouse={handleAddWarehouse}
        companyId={companyDetails.companyId}
      />
    </div>
  );
};

export default Warehouse;
