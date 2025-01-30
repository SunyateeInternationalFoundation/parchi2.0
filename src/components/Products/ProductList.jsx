import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import { db } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchProducts = async () => {
    try {
      const productRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "products"
      );

      const querySnapshot = await getDocs(productRef);
      const productsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "N/A",
          imageUrl: data.imageUrl || "",
          description: data.description || "No description available",
          unitPrice: data.sellingPrice ?? 0,
          discount: data.discount ?? 0,
          discountType: data.discountType ?? true,
          tax: data.tax || 0,
          barcode: data.barcode || "",
          purchasePrice: data.purchasePrice || 0,
          sellingPrice: data.sellingPrice || 0,
          includingTax: data.sellingPriceTaxType || false,
          stock: data.stock || 0,
          units: data.units,
          category: data.category,
          warehouse: data.warehouse,
        };
      });
      setProducts(productsData);
      setTotalPages(Math.ceil(productsData.length / 10));
      setPaginationData(productsData.slice(0, 10));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "companies", companyDetails.companyId, "products", productId)
      );
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  async function fetchCategory() {
    try {
      const categoriesRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "categories"
      );
      const getDocsData = await getDocs(categoriesRef);
      const categories = getDocsData.docs.map((doc) => doc.data().name);
      setCategoryList(categories);
    } catch (error) {
      console.log("🚀 ~ fetchCategory ~ error:", error);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategory();
  }, []);

  useEffect(() => {
    const filterProduct = products.filter((product) => {
      if (!searchTerms && selectedCategory == "All") {
        return true;
      }
      const isSearch = product.name
        .toLowerCase()
        ?.includes(searchTerms.toLowerCase());
      const isCategory = product.category?.includes(selectedCategory);
      return isSearch && isCategory;
    });

    setPaginationData(
      filterProduct.slice(currentPage * 10, currentPage * 10 + 10)
    );
  }, [currentPage, products, searchTerms, selectedCategory]);

  return (
    <div className="main-container" style={{ height: "81vh" }}>
      <div className="container">
        <div className="flex justify-between items-center px-5 ">
          <div className="flex justify-between items-center space-x-5 w-1/2">
            <div
              className="flex items-center space-x-4  w-full border
                px-5  py-3 rounded-md "
            >
              <input
                type="text"
                placeholder="Search..."
                className=" w-full"
                onChange={(e) => setSearchTerms(e.target.value)}
              />
              <IoSearch />
            </div>

            <Select
              value={selectedCategory || "All"}
              onValueChange={(val) => {
                setSelectedCategory(val);
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>

                {categoryList.map((ele, index) => (
                  <SelectItem value={ele} key={index}>
                    {ele}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
            onClick={() => {
              navigate("create-product");
            }}
          >
            + Create Product
          </button>
        </div>
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-hidden pt-8" style={{ minHeight: "92vh" }}>
            <table className="w-full border-collapse ">
              <thead className="bg-white">
                <tr className="border-b">
                  <th className="px-8 py-1 text-gray-400 font-semibold text-start">
                    Image
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Name
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Description
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold ">
                    Unit Price
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold ">
                    Discount
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold ">
                    GST Tax
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold ">
                    Purchase Price
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Including Tax
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold ">
                    Quantity
                  </th>
                  <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginationData.length > 0 ? (
                  paginationData.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-100 cursor-pointer text-gray-600"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <td className="px-8 py-3 text-start">
                        {product?.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name || "Product"}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="bg-red-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                            {product.name?.[0]?.toUpperCase() || "N"}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-start">{product.name}</td>
                      <td className="px-5 py-3 text-start">
                        {product.description}
                      </td>
                      <td className="px-5 py-3 text-center">
                        ₹{product.unitPrice}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {product.discountType
                          ? `${product.discount}%`
                          : `₹${product.discount}`}
                      </td>
                      <td className="px-5 py-3 text-center">{product.tax}%</td>
                      <td className="px-5 py-3 text-center">
                        ₹{product.purchasePrice}
                      </td>
                      <td className="px-5 py-3 text-start">
                        {product.includingTax ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-3 ">{product.stock}</td>
                      <td
                        className="px-5 py-3 text-start"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="flex justify-center items-center space-x-4">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("edit-product/" + product.id);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="h-96 text-center py-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={addItem}
                          alt="add Item"
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="mb-6">No Product Created</div>
                      <div className="">
                        <button
                          className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                          onClick={() => {
                            navigate("create-product");
                          }}
                        >
                          + Create Product
                        </button>
                      </div>
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
    </div>
  );
};

export default ProductList;
