import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormatTimestamp from "../../constants/FormatTimestamp";
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
        (product) => product.stock > 0 && product.stock < 5
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
        const invoiceNo = invoiceData.invoiceNo;
        const prefix = invoiceData.prefix;
        const returnsRef = collection(invoiceDoc.ref, "returns");
        const returnsSnapshot = await getDocs(returnsRef);

        returnsSnapshot.forEach((doc) => {
          allReturns.push({
            id: doc.id,
            invoiceId,
            prefix,
            invoiceNo, // Ensure this is passed correctly
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
        <div>
          <h3 className="text-xl font-semibold text-yellow-600 p-5 ">
            Low Stock Items
          </h3>
          {lowStockItems.length > 0 ? (
            <div className="overflow-y-auto" style={{ height: "60vh" }}>
              <table className="w-full border-collapse text-start ">
                <thead>
                  <tr className=" border-b">
                    <th className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Name
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Quantity
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                      purchasePrice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 text-center cursor-pointer hover:bg-blue-50 "
                      onClick={() => navigateToInvoice(item.invoiceId)}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={item.createdAt} />
                      </td>
                      <td className="px-5 py-3 text-start">{item.name}</td>
                      <td className="px-5 py-3 text-center">{item.stock}</td>
                      <td className="px-5 py-3 text-center">
                        {item.purchasePrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 p-5" style={{ height: "60vh" }}>
              No low stock items.
            </p>
          )}
        </div>
      )}

      {selectedFilter === "noStock" && (
        <div className="bg-white rounded-lg shadow-md ">
          <h3 className="text-xl font-semibold text-red-600  p-5">
            No Stock Items
          </h3>
          {noStockItems.length > 0 ? (
            <div className="overflow-y-auto" style={{ height: "60vh" }}>
              <table className="w-full border-collapse text-start ">
                <thead>
                  <tr className=" border-b">
                    <th className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Name
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                      purchase Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {noStockItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 text-center cursor-pointer hover:bg-blue-50 "
                      onClick={() => navigateToInvoice(item.invoiceId)}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={item.createdAt} />
                      </td>
                      <td className="px-5 py-3 text-start">{item.name}</td>

                      <td className="px-5 py-3 text-center">
                        {item.purchasePrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p
              className="text-gray-600 overflow-hidden  p-5"
              style={{ height: "60vh" }}
            >
              All items are in stock.
            </p>
          )}
        </div>
      )}

      {selectedFilter === "returns" && (
        <div className="bg-white  rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-blue-600 p-5 ">
            Returned Items
          </h3>
          {returns.length > 0 ? (
            <div className="overflow-y-auto" style={{ height: "60vh" }}>
              <table className="w-full border-collapse text-start ">
                <thead>
                  <tr className=" border-b">
                    <th className="px-8 py-1 text-gray-400 font-semibold text-start">
                      Date
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Name
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Quantity
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Invoice Number
                    </th>
                    <th className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 text-center cursor-pointer hover:bg-blue-50 "
                      onClick={() => navigateToInvoice(item.invoiceId)}
                    >
                      <td className="px-8 py-3 text-start">
                        <FormatTimestamp timestamp={item.createdAt} />
                      </td>
                      <td className="px-5 py-3 text-start">{item.name}</td>
                      <td className="px-5 py-3 text-center">{item.quantity}</td>
                      <td className="px-5 py-3 text-center">
                        {item.prefix}-{item.invoiceNo}
                      </td>
                      <td className="px-5 py-3 text-center">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 p-5" style={{ height: "60vh" }}>
              No returned items found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Stock;
