import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
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
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
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

        const productRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "products",
          productId
        );

        const q = query(
          invoicesRef,
          where("productRef", "array-contains", productRef)
        );
        const invoicesSnapshot = await getDocs(q);

        let allReturns = [];

        for (const invoiceDoc of invoicesSnapshot.docs) {
          const invoiceId = invoiceDoc.id;
          const invoiceData = invoiceDoc.data();
          //   const invoiceNumber = invoiceData.invoiceNo || invoiceData.number;

          //   const returnsRef = collection(invoiceDoc.ref, "returns");
          //   const returnsSnapshot = await getDocs(returnsRef);

          //   returnsSnapshot.forEach((doc) => {
          //     allReturns.push({
          //       id: doc.id,
          //       invoiceId,
          //       invoiceNumber, // Ensure this is passed correctly
          //       ...doc.data(),
          //     });
          //   });
        }

        //console.log("All returns:", allReturns); // Final log to confirm structure
        setReturns(allReturns);
      } catch (error) {
        console.error("Error fetching returns:", error);
      }
    };
    fetchProduct();
    // fetchReturns();
  }, [productId, companyDetails.companyId]);

  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 my-2 ">
        <Link className="flex items-center " to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
        </Link>
      </header>
      <hr />
      <div>
        <nav className="flex space-x-4 mt-3 mb-3">
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Product"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Product")}
          >
            Product
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Logs"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Logs")}
          >
            Logs
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeTab === "Returns"
                ? " bg-blue-700 text-white rounded-full"
                : "")
            }
            onClick={() => setActiveTab("Returns")}
          >
            Returns
          </button>
        </nav>
      </div>
      <hr />
      <div className="w-full">
        {activeTab === "Product" && (
          <div>
            <ProductView productData={product} />
          </div>
        )}
        {activeTab === "Logs" && (
          <div>
            <ProductLogs />
          </div>
        )}
        {activeTab === "Returns" && (
          <div>
            <ProductReturns />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductViewHome;
