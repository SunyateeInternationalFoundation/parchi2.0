import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";

const Stock = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [noStockItems, setNoStockItems] = useState([]);
  const [returns, setReturns] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("lowStock");
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const navigate = useNavigate();
  const navigateToInvoice = (invoiceId) => {
    navigate(`/invoice/${invoiceId}`);
  };

  const fetchProducts = async () => {
    try {
      const productRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "products"
      );
      const productSnapshot = await getDocs(productRef);
      const products = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter products based on stock quantity
      const lowStock = products.filter(
        (product) => product.stock >= 0 && product.stock < 5
      );
      const noStock = products.filter((product) => product.stock === 0);

      setLowStockItems(lowStock);
      setNoStockItems(noStock);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };
  const fetchReturns = async () => {
    try {
      const invoicesRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "invoices"
      );
      const invoicesSnapshot = await getDocs(invoicesRef);

      let allReturns = [];

      for (const invoiceDoc of invoicesSnapshot.docs) {
        const invoiceId = invoiceDoc.id;
        const invoiceData = invoiceDoc.data();
        const invoiceNumber = invoiceData.invoiceNo || invoiceData.number;
        const returnsRef = collection(invoiceDoc.ref, "returns");
        const returnsSnapshot = await getDocs(returnsRef);

        returnsSnapshot.forEach((doc) => {
          allReturns.push({
            id: doc.id,
            invoiceId,
            invoiceNumber, // Ensure this is passed correctly
            ...doc.data(),
          });
        });
      }

      setReturns(allReturns);
    } catch (error) {
      console.error("Error fetching returns:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchReturns();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="m-5 bg-white rounded-lg shadow-md">
      <div className="flex space-x-4 px-5 py-5 border-b">
        <button
          onClick={() => setSelectedFilter("lowStock")}
          className={`px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white ${
            selectedFilter === "lowStock" && "bg-black text-white"
          } `}
        >
          Low Stock
        </button>
        <button
          onClick={() => setSelectedFilter("noStock")}
          className={`px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white ${
            selectedFilter === "noStock" && "bg-black text-white"
          } `}
        >
          No Stock
        </button>
        <button
          onClick={() => {
            setSelectedFilter("returns");
            fetchReturns();
          }}
          className={`px-4 py-1 text-gray-600  rounded-md flex items-center border hover:bg-black hover:text-white ${
            selectedFilter === "returns" && "bg-black text-white"
          } `}
        >
          Returns
        </button>
      </div>

      {/* Conditional Rendering Based on Selected Filter */}
      {selectedFilter === "lowStock" && (
        <div className=" p-6 ">
          <h3 className="text-xl font-semibold text-yellow-600 mb-4">
            Low Stock Items
          </h3>
          {lowStockItems.length > 0 ? (
            <ul className="space-y-3">
              {lowStockItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg cursor-pointer"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-red-600 font-semibold">
                    Qty: {item.stock}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No low stock items.</p>
          )}
        </div>
      )}
      {selectedFilter === "noStock" && (
        <div className="bg-white p-6 rounded-lg shadow-md ">
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            No Stock Items
          </h3>
          {noStockItems.length > 0 ? (
            <ul className="space-y-3">
              {noStockItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg cursor-pointer"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-500">Out of Stock</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">All items are in stock.</p>
          )}
        </div>
      )}

      {selectedFilter === "returns" && (
        <div className="bg-white p-6 rounded-lg shadow-md ">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">
            Returned Items
          </h3>
          {returns.length > 0 ? (
            <ul className="space-y-3">
              {returns.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigateToInvoice(item.invoiceId)}
                >
                  <div>
                    <span className="text-gray-700 font-bold">{item.name}</span>
                    <br />
                    <span className="text-blue-600 font-semibold">
                      Qty: {item.quantity}
                    </span>
                    <br />
                    <span className="text-sm text-gray-500">
                      Invoice: {item.invoiceNumber}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No returned items found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Stock;
