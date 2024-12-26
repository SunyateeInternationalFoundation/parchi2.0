import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../firebase";
import {
  collection,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import CreateProduct from "./CreateProduct";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
          image: data.image || "",
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsSideBarOpen(true);
  };

  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white p-4 overflow-y-auto" style={{ height: "80vh" }}>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setIsSideBarOpen(true);
            setEditingProduct(null);
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
        <div className="bg-gray-50 border-b mb-4 py-4">
          <table className="min-w-full text-center text-gray-800 font-semibold">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Unit Price</th>
                <th className="px-4 py-2">Discount</th>
                <th className="px-4 py-2">GST Tax</th>
                <th className="px-4 py-2">Purchase Price</th>
                <th className="px-4 py-2">Including Tax</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-100 cursor-pointer text-gray-600"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <td className="px-4 py-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || "Product"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-red-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          {product.name?.[0]?.toUpperCase() || "N"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.description}</td>
                    <td className="px-4 py-3">₹{product.unitPrice}</td>
                    <td className="px-4 py-3">
                      {product.discountType
                        ? `${product.discount}%`
                        : `₹${product.discount}`}
                    </td>
                    <td className="px-4 py-3">{product.tax}%</td>
                    <td className="px-4 py-3">₹{product.purchasePrice}</td>
                    <td className="px-4 py-3">
                      {product.includingTax ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center space-x-4">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
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
                  <td colSpan="10" className="py-10 text-center">
                    <p>No products available.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <CreateProduct
        isOpen={isSideBarOpen}
        onClose={() => setIsSideBarOpen(false)}
        onProductAdded={fetchProducts}
        onProductUpdated={editingProduct}
      />
    </div>
  );
};

export default ProductList;
