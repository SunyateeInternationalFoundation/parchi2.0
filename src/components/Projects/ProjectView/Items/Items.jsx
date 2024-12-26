import React, { useEffect, useState } from "react";
import QuickAddSideBar from "./QuickAddSideBar";
import InventoryAddSideBar from "./InventoryAddSideBar";
import { Link, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { MdDelete } from "react-icons/md";
import ItemView from "./ItemView";

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
      console.log("🚀 ~ data ~ data:", data);

      setItemsData(data);
    } catch (error) {
      console.log("🚀 ~ fetchMaterials ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

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
    <div className="w-full" style={{ width: "100%", height: "92vh" }}>
      <div
        className="px-8 pb-8 pt-5 bg-gray-100 overflow-y-auto"
        style={{ width: "100%", height: "92vh" }}
      >
        <header className="flex space-x-3 mb-3">
          <Link
            className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
            to={"./../"}
          >
            <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold">Project Material</h1>
        </header>
        <div className="flex items-center justify-between  mb-4">
          <div className="space-x-4">
            <button
              onClick={() => setTypeOfAdd("quick")}
              className={`px-4 py-1 rounded-full ${
                typeOfAdd === "quick"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Quick Add
            </button>
            <button
              onClick={() => setTypeOfAdd("inventory")}
              className={`px-4 py-1 rounded-full ${
                typeOfAdd === "inventory"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              From Inventory
            </button>
          </div>
          <button
            className="bg-blue-700 text-white py-1 px-2 rounded"
            onClick={() => {
              setIsSideBarOpen(true);
            }}
          >
            + Create Items
          </button>
        </div>
        <div className="bg-white text-lg rounded-lg shadow mb-4">
          <div className="flex justify-between p-4">
            <div className="w-full">
              <div className="mb-2">Total Quantity</div>
              <div>{total.qty.toFixed(1)}</div>
            </div>

            <div className="w-full text-end">
              <div className="mb-2">Total Material Count</div>
              <div>{itemsData.length}</div>
            </div>
          </div>
          <div className="flex justify-between bg-blue-700 text-white text-center p-2 px-5 rounded-b-lg">
            <div>Total Value</div>
            <div>₹ {total.price.toFixed(1)}</div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-6">Loading Project Materials...</div>
          ) : (
            <div className="overflow-y-auto h-96 ">
              <div className="">
                {itemsData.length > 0 ? (
                  itemsData.map((item) => (
                    <div
                      className={`border-2 shadow rounded-lg p-3 mt-3 cursor-pointer`}
                      key={item.id}
                      onClick={() => {
                        setViewItemData(item);
                        setIsItemView(true);
                      }}
                    >
                      <div className="flex justify-between items-center px-4 mb-2">
                        <div className="font-bold">
                          <div className="">{item.itemName}</div>
                          <div className="">
                            <span className="text-gray-500 font-normal">
                              Item Per Pc
                            </span>{" "}
                            {item.itemPricePerPiece}
                          </div>
                          <div className="">
                            <span className="text-gray-500 font-normal">
                              Quantity
                            </span>{" "}
                            {item.quantity}
                          </div>
                          <div className="">
                            <span className="text-gray-500 font-normal">
                              Remaining Quantity
                            </span>{" "}
                            {item.remainingQuantity}
                          </div>
                        </div>
                        <div className="flex space-x-8 font-bold">
                          <div>₹ {item.quantity * item.itemPricePerPiece}</div>
                          <div
                            className="text-red-700 text-2xl"
                            onClick={(e) => OnDeleteItem(e, item.id)}
                          >
                            <MdDelete />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-lg text-center">No Item Found</div>
                )}
              </div>
            </div>
          )}
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
