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
    <div className=" bg-gray-100 pb-5" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3  px-5  border-b">
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

      <div className="w-full px-5 ">
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
