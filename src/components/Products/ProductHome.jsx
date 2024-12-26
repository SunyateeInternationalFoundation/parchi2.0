import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import ProductList from "./ProductList";
import Categories from "./Categories";
import Warehouse from "./Warehouse";
import Stock from "./Stock";

const ProductHome = () => {
  const [activeTab, setActiveTab] = useState("Products");
  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center  space-x-3 my-2 ">
        {/* <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
           to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        
        </Link> */}
        {/* <h1 className="text-2xl font-bold">Products</h1> */}
      </header>
      <hr />
      <div>
        <nav className="flex space-x-4 mt-3 mb-3">
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Products"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Products")}
          >
            Products
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Categories"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Categories")}
          >
            Categories
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Warehouse"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Warehouse")}
          >
            Warehouse
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Stock"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Stock")}
          >
            Stock
          </button>
        </nav>
      </div>
      <hr />
      <div className="w-full">
        {activeTab === "Products" && (
          <div>
            <ProductList />
          </div>
        )}
        {activeTab === "Categories" && (
          <div>
            <Categories />
          </div>
        )}

        {activeTab === "Warehouse" && (
          <div>
            <Warehouse />
          </div>
        )}

        {activeTab === "Stock" && (
          <div>
            <Stock />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHome;
