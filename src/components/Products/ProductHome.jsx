import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PrintBarcode from "./Barcode/PrintBarcode";
import Categories from "./Categories/Categories";
import ProductList from "./ProductList";
import Warehouse from "./WareHouses/Warehouse";

const ProductHome = () => {
  // const [activeTab, setActiveTab] = useState("Products");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get("tab");

  const renderTabContent = () => {
    switch (tab) {
      case "Products":
        return <ProductList />;
      case "Categories":
        return <Categories />;
      case "Warehouse":
        return <Warehouse />;
      case "Barcode":
        return <PrintBarcode />;
      default:
        return null;
    }
  };

  const renderTabButton = (tabName, label) => (
    <button
      className={
        "p-4  " +
        (tab === tabName ? " border-b-4 border-blue-500 " : "")
      }
      onClick={() => navigate("?tab=" + tabName)}
    >
      {label}
    </button>
  );
  useEffect(() => {
    if (!tab) {
      navigate("?tab=Products");
    }
  }, [!tab]);
  return (
    <div className="pb-5 bg-gray-100" style={{ width: "100%" }}>
      <div>
        <nav className="flex space-x-4 bg-white px-5">
          {renderTabButton("Products", "Products")}
          {renderTabButton("Categories", "Categories")}
          {renderTabButton("Warehouse", "Warehouse")}
          {renderTabButton("Barcode", "Print Barcode")}
        </nav>
      </div>
      <hr />
      <div className="w-full">{renderTabContent()}</div>
    </div>
  );
};

export default ProductHome;
