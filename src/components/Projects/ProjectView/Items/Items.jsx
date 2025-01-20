import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import InventoryAddSideBar from "./InventoryAddSideBar";
import ItemView from "./ItemView";
import QuickAddSideBar from "./QuickAddSideBar";
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

function Items() {
  const { id } = useParams();
  const projectId = id;
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId;
  const [typeOfAdd, setTypeOfAdd] = useState("quick");
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isItemView, setIsItemView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemsData, setItemsData] = useState([]);
  const [viewItemData, setViewItemData] = useState({});
  const [total, setTotal] = useState({
    qty: 0,
    price: 0,
  });
  
 
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const materialRef = collection(db, "projects", projectId, "materials");
      const querySnapshot = await getDocs(materialRef);
      let sumQty = 0;
      let price = 0;
      const data = querySnapshot.docs.map((doc) => {
        const getData = doc.data();
        sumQty += getData.quantity;
        price += getData.quantity * getData.itemPricePerPiece;
        return {
          id: doc.id,
          ...getData,
        };
      });
      setTotal({
        qty: sumQty,
        price,
      });

      setItemsData(data);
      setTotalPages(Math.ceil(data.length / 10)); 
      setPaginationData(data.slice(0, 10)); 
    } catch (error) {
      console.log("🚀 ~ fetchMaterials ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    
    setPaginationData(itemsData.slice(currentPage * 10, currentPage * 10 + 10));
    setTotalPages(Math.ceil(itemsData.length / 10)); 
  }, [itemsData, currentPage]);

  async function OnDeleteItem(e, itemId) {
    e.stopPropagation();
    try {
      const confirm = window.confirm(`Are you sure wanted to delete the  item`);
      if (!confirm) {
        return;
      }
      await deleteDoc(doc(db, "materials", itemId));
      setItemsData((val) => val.filter((ele) => ele.id !== itemId));
    } catch (error) {
      console.log("🚀 ~ OnDeleteItem ~ error:", error);
    }
  }
  return (
    <div className="w-full">
      <div
        className="px-8 pt-5 bg-gray-100 overflow-y-auto"
        style={{ width: "100%", height: "82vh" }}
      >
        <header className="flex space-x-3 ">
          <h1 className="text-2xl font-bold">Project Material</h1>
        </header>

        <div className="py-3">
          <div className="grid grid-cols-4 gap-8 ">
            <div className="rounded-lg p-5 bg-white shadow  ">
              <div className="text-lg">Total Quantity</div>
              <div className="text-3xl text-indigo-600 font-bold p-2">
                {total.qty.toFixed(1)}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg">Total Value</div>
              <div className="text-3xl text-emerald-600 font-bold p-2">
                {itemsData.length}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-white shadow ">
              <div className="text-lg">Total Material Count</div>
              <div className="text-3xl text-orange-600 font-bold p-2">
                ₹ {total.price.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg ">
          <div className="flex items-center justify-between px-5 py-5">
            <div className="space-x-4">
              <button
                onClick={() => setTypeOfAdd("quick")}
                className={` px-5  py-3 text-gray-600  rounded-md border hover:bg-black hover:text-white   ${
                  typeOfAdd === "quick" && "bg-black text-white"
                }`}
              >
                Quick Add
              </button>
              <button
                onClick={() => setTypeOfAdd("inventory")}
                className={` px-5  py-3 text-gray-600  rounded-md border hover:bg-black hover:text-white ${
                  typeOfAdd === "inventory" && "bg-black text-white"
                }`}
              >
                From Inventory
              </button>
            </div>
            <button
              className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
              onClick={() => {
                setIsSideBarOpen(true);
              }}
            >
              + Create Items
            </button>
          </div>
          <div
            className="bg-white rounded-lg overflow-y-auto"
            style={{ height: "80vh" }}
          >
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Item
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                    Quantity
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Remaining Quantity
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Item Per Pc
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Price
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Delete
                  </td>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() => {
                        setViewItemData(item);
                        setIsItemView(true);
                      }}
                    >
                      <td className="px-8 py-3 text-start">{item.name}</td>
                      <td className="px-5 py-3 text-start">{item.quantity}</td>
                      <td className="px-5 py-3 text-start">
                        {item.remainingQuantity}
                      </td>
                      <td className="px-5 py-3 text-start">
                        {item.itemPricePerPiece}
                      </td>
                      <td className="px-5 py-3 text-start">
                        {item.quantity * item.itemPricePerPiece}
                      </td>
                      <td
                        className="px-5 py-3 text-start text-red-700 text-2xl"
                        onClick={(e) => {
                          e.preventDefault();
                          OnDeleteItem(e, item.id);
                        }}
                      >
                        <MdDelete />
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
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
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
      {isSideBarOpen &&
        (typeOfAdd === "quick" ? (
          <div>
            <QuickAddSideBar
              isOpen={isSideBarOpen}
              onClose={() => {
                setIsSideBarOpen(false);
              }}
              isMaterialAdd={fetchMaterials}
            />
          </div>
        ) : (
          <div>
            <InventoryAddSideBar
              projectId={projectId}
              isOpen={isSideBarOpen}
              onClose={() => {
                setIsSideBarOpen(false);
              }}
              isMaterialAdd={fetchMaterials}
            />
          </div>
        ))}
      {isItemView && (
        <div>
          <ItemView
            isOpen={isItemView}
            onClose={() => {
              setIsItemView(false);
            }}
            ItemData={viewItemData}
            onRefresh={fetchMaterials}
          />
        </div>
      )}
    </div>
  );
}

export default Items;
