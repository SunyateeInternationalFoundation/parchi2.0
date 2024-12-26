import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  collection,
  doc,
  getDocs,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../../firebase";

function ItemView({ isOpen, onClose, ItemData, onRefresh }) {
  const [modifiedItemData, setModifiedItemData] = useState(ItemData);
  const [usedItemQty, setUsedItemQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  async function onAddUsedItem() {
    try {
      if (
        usedItemQty === 0 ||
        usedItemQty >= modifiedItemData.remainingQuantity
      ) {
        return;
      }
      const batch = writeBatch(db);
      const payload = {
        createdAt: Timestamp.fromDate(new Date()),
        usedQty: usedItemQty,
        projectRef: modifiedItemData.projectRef,
      };
      const itemRef = doc(
        modifiedItemData.projectRef,
        "materials",
        modifiedItemData.id
      );
      const RecordsRef = collection(itemRef, "records");

      batch.set(doc(RecordsRef), payload);
      batch.update(itemRef, {
        remainingQuantity: modifiedItemData.remainingQuantity - usedItemQty,
      });
      await batch.commit();
      setModifiedItemData((val) => ({
        ...val,
        remainingQuantity: modifiedItemData.remainingQuantity - usedItemQty,
      }));
      fetchRecord();
      setIsUpdated(true);
    } catch (error) {
      console.log("🚀 ~ onAddUsedItem ~ error:", error);
    }
  }

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }

  async function fetchRecord() {
    try {
      setLoading(true);
      const getData = await getDocs(
        collection(
          modifiedItemData.projectRef,
          "materials",
          modifiedItemData.id,
          "records"
        )
      );
      const data = getData.docs.map((doc) => {
        const res = doc.data();
        return {
          id: doc.id,
          ...res,
          createdAt: DateFormate(res.createdAt),
        };
      });
      setRecords(data);
    } catch (error) {
      console.log("🚀 ~ fetchRecord ~ error:", error);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchRecord();
  }, []);
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        onClose();
        if (isUpdated) {
          onRefresh();
        }
      }}
    >
      <div
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5">
          {modifiedItemData.itemName}
        </h2>
        <button
          onClick={() => {
            onClose();
            if (isUpdated) {
              onRefresh();
            }
          }}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <div className="flex border-2 rounded-lg shadow text-2xl mt-5">
          <div className="border-r-2 w-full p-6">
            <div>Purchased</div>
            <div className="text-center text-blue-700 text-6xl">
              {modifiedItemData.quantity}
            </div>
          </div>
          <div className="w-full p-6">
            <div>Used Item</div>
            <div className="text-center text-blue-700 text-6xl">
              {modifiedItemData.quantity - modifiedItemData.remainingQuantity}
            </div>
          </div>
        </div>
        <div className="flex justify-between my-2">
          <div>Remaining</div>
          <div className="text-green-500">
            {modifiedItemData.remainingQuantity}
          </div>
        </div>
        <div>
          <div>
            <label className="text-sm block font-semibold">
              Use Item Quantity
            </label>
            <input
              type="number"
              name="Use Item"
              className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
              placeholder="Use Item Quantity"
              onChange={(e) => setUsedItemQty(+e.target.value)}
              required
            />
          </div>
          <div className="">
            <button
              className="w-full bg-blue-700 text-white p-2 rounded-md mt-4"
              onClick={onAddUsedItem}
            >
              + Add
            </button>
          </div>
        </div>
        <div className="mt-5 border-t-2 space-y-1 overflow-y-auto h-96">
          <div className="flex justify-between font-bold border-b-2 p-2">
            <div>Date</div>
            <div>Quantity</div>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            records.map((ele) => (
              <div
                className="flex justify-between shadow rounded-lg p-3 border-2"
                key={ele.id}
              >
                <div>{ele.createdAt}</div>
                <div>{ele.usedQty}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemView;
