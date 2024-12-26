import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import ProductView from "./ProductView";
import ProductReturns from "./ProductReturns";
import ProductLogs from "./ProductLogs";

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
          console.log("🚀 ~ fetchReturns ~ invoiceData:", invoiceData);
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
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
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
