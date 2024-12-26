import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Sidebar = ({
  onClose,
  productList,
  isOpen,
  handleActionQty,
  totalAmount,
}) => {
  const [Products, setProducts] = useState(productList);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = Products.filter((ele) =>
    ele.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setProducts(productList);
  }, [productList]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="font-bold text-xl mb-4"> Select Products</h2>
          <button className="text-2xl mb-4" onClick={onClose}>
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="flex-grow w-100 m-2 relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full h-8 p-2 pl-8  border border-gray-300 rounded-md text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600"
            size={16}
          />
        </div>

        <div className="overflow-y-auto" style={{ height: "68vh" }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={
                "border-2 shadow rounded-lg px-4 py-2 flex justify-between my-2  cursor-pointer " +
                (product.quantity === 0 ? "bg-gray-100" : "")
              }
            >
              <div className="">
                <div className="font-bold">
                  {product.name} - Quantity: {product.quantity || "0"}
                </div>
                {product.quantity !== 0 && (
                  <div className="border-2 rounded-lg flex justify-between w-20 text-lg mt-2">
                    <button
                      onClick={() => handleActionQty("-", product.id)}
                      className="px-2"
                    >
                      -
                    </button>
                    <div>{product.actionQty}</div>
                    <button
                      onClick={() => handleActionQty("+", product.id)}
                      className="px-2"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div className="text-end">
                <div className="font-bold">₹ {product.sellingPrice}</div>
                <div className="text-sm">Discount : ₹ {product.discount}</div>
                <div className="text-sm"> Tax: {product.tax} %</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <h3 className="text-gray-700 font-bold text-base">
            Total: ₹ {totalAmount}
          </h3>
        </div>

        <button
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded w-full"
          onClick={onClose}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
