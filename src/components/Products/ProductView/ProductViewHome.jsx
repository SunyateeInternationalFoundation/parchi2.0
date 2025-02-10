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
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { db } from "../../../firebase";
import ProductLogs from "./ProductLogs";
import ProductReturns from "./ProductReturns";
import ProductView from "./ProductView";
import Transfers from "./Transfers";

function ProductViewHome() {
  const { id: productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get("tab");
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  const [product, setProduct] = useState({});
  const [returns, setReturns] = useState({});
  const [logs, setLogs] = useState({});
  const [transfers, setTransfers] = useState([]);

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
        const transferQuery = query(
          collection(productRef, "transfers"),
          orderBy("date", "desc")
        );
        const transferDocs = await getDocs(transferQuery);
        const transferData = transferDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransfers(transferData);
        setLogs(logsData);
        setReturns(returnsData);
      } else {
        console.error("No Product Found!");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };
  useEffect(() => {
    if (!tab) {
      navigate("?tab=Product");
    }
    fetchProduct();
  }, [productId, companyDetails.companyId]);

  const tabs = [
    { name: "Product", component: <ProductView productData={product} /> },
    { name: "Logs", component: <ProductLogs logs={logs} /> },
    { name: "Returns", component: <ProductReturns returns={returns} /> },
    // { name: "Stocks", component: <Stocks stocks={[]} /> },
    {
      name: "Transfers",
      component: (
        <Transfers
          transfersData={transfers}
          productDetails={product}
          refreshTransfersData={(data) => setTransfers((val) => [data, ...val])}
        />
      ),
    },
  ];

  return (
    <div className="pb-5" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 px-5 border-b bg-white">
        <Link className="flex items-center" to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500 text-gray-500" />
        </Link>
        <nav className="flex space-x-4">
          {tabs.map((t) => (
            <button
              key={t.name}
              className={
                "p-4  " +
                (tab === t.name ? " border-b-4 border-blue-500 " : "")
              }
              onClick={() => navigate("?tab=" + t.name)}
            >
              {t.name}
            </button>
          ))}
        </nav>
      </header>

      <div className="w-full">
        {tabs.map(
          (t) => tab === t.name && <div key={t.name}>{t.component}</div>
        )}
      </div>
    </div>
  );
}

export default ProductViewHome;
