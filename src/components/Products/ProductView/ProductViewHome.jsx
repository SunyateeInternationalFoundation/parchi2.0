import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import ProductLogs from "./ProductLogs";
import ProductReturns from "./ProductReturns";
import ProductView from "./ProductView";

function ProductViewHome() {
  const [activeTab, setActiveTab] = useState("Product");
  const { id: productId } = useParams();
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  const [product, setProduct] = useState(null);
  const [returns, setReturns] = useState(null);
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "products",
          productId
        );
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
          const q = query(
            collection(productRef, "logs"),
            orderBy("date", "desc")
          );
          const logsDocs = await getDocs(q);
          let returnsData = [];
          const logsData = logsDocs.docs.map((doc) => {
            const data = doc.data();
            if (data.status == "return") {
              returnsData.push({
                id: doc.id,
                ...data,
              });
            }
            return {
              id: doc.id,
              ...data,
            };
          });
          setLogs(logsData);
          setReturns(returnsData);
          console.log("🚀 ~ fetchProduct ~ logsData:", logsData);
        } else {
          console.error("No Product Found!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId, companyDetails.companyId]);

  return (
    <div className="  pb-5" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3  px-5  border-b bg-white">
        <Link className="flex items-center " to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
        </Link>
        <nav className="flex space-x-4 ">
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Product" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => setActiveTab("Product")}
          >
            Product
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Logs" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => setActiveTab("Logs")}
          >
            Logs
          </button>
          <button
            className={
              "p-4 font-semibold text-gray-500 " +
              (activeTab === "Returns" ? " border-b-4 border-blue-500 " : "")
            }
            onClick={() => setActiveTab("Returns")}
          >
            Returns
          </button>
        </nav>
      </header>

      <div className="w-full  ">
        {activeTab === "Product" && (
          <div>
            <ProductView productData={product} />
          </div>
        )}
        {activeTab === "Logs" && (
          <div>
            <ProductLogs logs={logs} />
          </div>
        )}
        {activeTab === "Returns" && (
          <div>
            <ProductReturns returns={returns} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductViewHome;
