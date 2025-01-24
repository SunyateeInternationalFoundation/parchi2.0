import { useState } from "react";
import Categories from "./Categories/Categories";
import ProductList from "./ProductList";
import Stock from "./Stock";
import Warehouse from "./WareHouses/Warehouse";

const ProductHome = () => {
  const [activeTab, setActiveTab] = useState("Products");
  return (
    <div className=" pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center  space-x-3 ">
        {/* <Link
          className="flex items-center "
           to={"./../"}
        >
             <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link> */}
        {/* <h1 className="text-2xl font-bold">Products</h1> */}
      </header>
      <hr />
      <div>
        <nav className="flex space-x-4 bg-white px-5">
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Products" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => setActiveTab("Products")}
          >
            Products
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Categories" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => setActiveTab("Categories")}
          >
            Categories
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Warehouse" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => setActiveTab("Warehouse")}
          >
            Warehouse
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Stock" ? " border-b-4 border-blue-500 " : "")
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
