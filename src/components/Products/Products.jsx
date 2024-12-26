import React, { useState } from "react";
import CreateProduct from "./CreateProduct";
import { IoSearch } from "react-icons/io5";

const Products = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [loading, setLoading] = useState(!true);

  return (
    <div
      className="px-8 pb-8 pt-5 bg-gray-100 overflow-y-auto"
      style={{ width: "100%", height: "92vh" }}
    >
      <header className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setIsSideBarOpen(true)}
        >
          + Create Product
        </button>
      </header>
      <div className=" bg-white shadow rounded-lg mt-4">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="">
              <div className="flex items-center ">
                {/* <div className="text-green-500 p-3 bg-sky-100 rounded-lg"></div> */}
                <span className="font-bold">No. of Products</span>
              </div>
              <div>6</div>
            </div>
            <div className="">
              <div className="flex items-center ">
                <span className=" font-bold">Total Stock</span>
                {/* <div className="text-red-500 p-3 bg-red-200 rounded-lg"></div> */}
              </div>
              <div className="text-end">40</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between bg-green-500  text-center p-2 rounded-b-lg">
          <div>Total Values of Items</div>
          <div>₹4648</div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-4 mt-5">
        <div className="flex items-center space-x-4 mb-4 border p-2 rounded">
          <input
            type="text"
            placeholder="Search by Project Name #..."
            className=" w-full focus:outline-none"
            // value={searchTerm}
            // onChange={onSearchFilter}
          />
          <IoSearch />
        </div>

        {loading ? (
          <div className="text-center py-6">Loading Projects...</div>
        ) : (
          <div className="overflow-y-auto h-96 ">
            <div className="">
              {/* {modifiedProjectsList.map((item) => ( */}
              <div
                className={"border-2 shadow cursor-pointer rounded-lg p-3 mt-"}
                // onClick={() => onViewProject(item)}
                // key={item.projectId}
              >
                <div className="flex justify-between mb-2">
                  <div className="font-bold">Chips</div>
                  <div>
                    <span>Qty</span> 5
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <div>
                    <span className="text-gray-700">Selling Price </span>
                    <span> 150.0 </span>
                    {/* 
                      <span className="text-gray-700 ml-4">End Date : </span>
                      <span>{item.dueDate}</span> */}
                  </div>
                  <div className="text-gray-700">
                    {" "}
                    <span>Discount Price </span> 22.5
                  </div>
                </div>
                {/*                
                } */}
              </div>
              {/* ))} */}
            </div>
          </div>
        )}
      </div>

      <CreateProduct
        isOpen={isSideBarOpen}
        onClose={() => setIsSideBarOpen(false)}
      />
    </div>
  );
};

export default Products;
