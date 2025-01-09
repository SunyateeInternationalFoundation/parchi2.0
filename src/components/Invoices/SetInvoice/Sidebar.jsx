import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

function Sidebar({
  onClose,
  productList,
  isOpen,
  handleActionQty,
  totalAmount,
  customActionQty,
  categories,
}) {
  const [Products, setProducts] = useState(productList);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredProducts = Products.filter(
    (ele) =>
      ele.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (ele.category === selectedCategory || selectedCategory === "")
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
        className={`bg-white w-1/3 p-3 pt-2 transform transition-transform overflow-y-auto ${
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
        <div className="flex w-100 m-2">
          <select
            className="w-1/4 rounded-s-md p-2 border"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value={""}>All</option>
            {categories.map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
          <div className="border rounded-e-md p-2 w-3/4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              <div>
                <div className="font-bold">
                  {product.name} - Quantity: {product.quantity || "0"}
                </div>
                {product.quantity !== 0 && (
                  <div className="border-2 rounded-lg flex justify-between w-24 text-lg mt-2 bg-gray-50">
                    <button
                      onClick={() => handleActionQty("-", product.id)}
                      className="px-2"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={product.actionQty || ""}
                      onChange={(e) => {
                        customActionQty(+e.target.value, product.id);
                      }}
                      className="border-x rounded-md text-sm w-10 px-2 text-center"
                    />
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
                <div className="text-sm">
                  Discount :{!product.discountType && "₹"}{" "}
                  {product.discount.toFixed(2)}
                  {product.discountType && "%"}
                </div>
                <div className="text-sm"> Tax: {product.tax} %</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <h3 className="text-gray-700 font-bold text-base">
            Total: ₹ {totalAmount.toFixed(2)}
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
}
Sidebar.propTypes = {
  onClose: PropTypes.func,
  productList: PropTypes.array,
  categories: PropTypes.array,
  isOpen: PropTypes.bool,
  handleActionQty: PropTypes.func,
  totalAmount: PropTypes.number,
  customActionQty: PropTypes.func,
};

export default Sidebar;
