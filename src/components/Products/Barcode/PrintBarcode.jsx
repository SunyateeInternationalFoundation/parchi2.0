import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { db } from "../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";
import addItem from "./../../../assets/addItem.png";

function PrintBarcode() {
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownVisible, setIsProductDropdownVisible] =
    useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [selectProduct, setSelectProduct] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [newBarcode, setNewBarcode] = useState("");
  const [editProduct, setEditProduct] = useState("");
  const barcodeRef = useRef();
  const reactToPrintFn = useReactToPrint({
    contentRef: barcodeRef,
  });
  const sheets = [
    {
      id: 1,
      itemsPerSheet: 40,
      dimensions: [1.799, 1.003],
    },
    {
      id: 2,
      itemsPerSheet: 40,
      dimensions: [1.799, 1.003],
    },
    {
      id: 3,
      itemsPerSheet: 30,
      dimensions: [2.625, 1],
    },
    {
      id: 4,
      itemsPerSheet: 24,
      dimensions: [2.48, 1.334],
    },
    {
      id: 5,
      itemsPerSheet: 20,
      dimensions: [4, 1],
    },
    {
      id: 6,
      itemsPerSheet: 18,
      dimensions: [2.5, 1.835],
    },
    {
      id: 7,
      itemsPerSheet: 14,
      dimensions: [4, 1.33],
    },
    {
      id: 8,
      itemsPerSheet: 12,
      dimensions: [2.5, 2.834],
    },
    {
      id: 9,
      itemsPerSheet: 10,
      dimensions: [4, 2],
    },
  ];

  const [selectSheetDetails, setSelectSheetDetails] = useState({
    sheetData: {
      id: 1,
      itemsPerSheet: 40,
      dimensions: [1.799, 1.003],
    },
    isName: false,
    isPrice: false,
  });

  const [products, setProducts] = useState([]);

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
          barcode: data.barcode || "",
          sellingPrice: data.sellingPrice || 0,
          quantity: 0,
          category: data.category || "",
        };
      });
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    const categoriesRef = collection(
      db,
      "companies",
      userDetails.companies[userDetails.selectedCompanyIndex].companyId,
      "categories"
    );
    const snapshot = await getDocs(categoriesRef);

    const categoriesData = snapshot.docs.map((doc) => doc.data().name);

    setCategories(categoriesData);
  };

  const handleQuantityChange = (id, value) => {
    setSelectProduct(
      selectProduct.map((product) =>
        product.id === id ? { ...product, quantity: value } : product
      )
    );
  };

  const handleDelete = (id) => {
    setSelectProduct(selectProduct.filter((product) => product.id !== id));
  };

  async function updateProductBarcode() {
    try {
      await updateDoc(
        doc(
          db,
          "companies",
          companyDetails.companyId,
          "products",
          editProduct.id
        ),
        { barcode: newBarcode }
      );
      setIsModelOpen(false);
      setEditProduct("");
      setNewBarcode("");
      setSelectProduct((val) => [
        ...val,
        { ...editProduct, barcode: newBarcode, quantity: 1 },
      ]);
    } catch (error) {
      console.log("🚀 ~ updateProductBarcode ~ error:", error);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all" && productSearch === "") {
      setProductSuggestions(products);
      return;
    }
    const filteredSuggestions = products.filter((item) => {
      return (
        item.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        (selectedCategory == "all" ? true : item.category === selectedCategory)
      );
    });

    setProductSuggestions(filteredSuggestions);
  }, [productSearch, selectedCategory]);

  return (
    <div className="main-container" style={{ height: "81vh" }}>
      <div className="container p-5">
        <div className="">
          <div className="flex justify-between items-center mb-4 space-x-3">
            <div className="flex  items-center w-full">
              <div className=" w-1/4">
                <Select
                  value={selectedCategory ?? "all"}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                  }}
                >
                  <SelectTrigger
                    style={{
                      borderBottomRightRadius: "0px",
                      borderTopRightRadius: "0px",
                      height: "50px",
                    }}
                  >
                    <SelectValue placeholder=" Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>All</SelectItem>
                    {categories.map((ele) => (
                      <SelectItem value={ele} key={ele}>
                        {ele}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full">
                <input
                  type="text"
                  className="w-1/2 rounded-e-md py-3 px-3 border"
                  placeholder="Search..."
                  onChange={(e) => setProductSearch(e.target.value.trim())}
                  onFocus={() => {
                    setIsProductDropdownVisible(true);
                    setProductSuggestions((val) =>
                      val.length > 0
                        ? val
                        : selectedCategory == "all"
                        ? products
                        : []
                    );
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsProductDropdownVisible(false);
                    }, 200);
                  }}
                />
                {isProductDropdownVisible && productSuggestions.length > 0 && (
                  <div className="absolute z-20 bg-white border border-gray-300 rounded-b-lg shadow-md max-h-60 overflow-y-auto w-1/2">
                    {productSuggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          if (!product?.barcode) {
                            setEditProduct(product);
                            setIsModelOpen(true);
                            return;
                          }
                          setSelectProduct((val) => [
                            ...val,
                            { ...product, quantity: 1 },
                          ]);
                        }}
                        className="flex flex-col   text-gray-800 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out"
                      >
                        <div className=" p-3 border-b">{product.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 rounded-md overflow-hidden">
            <div className="mb-4 rounded-md">
              <table className="min-w-full text-center text-gray-500 font-semibold rounded-md table-fixed">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className=" px-4 py-3 text-gray-500 font-semibold text-start">
                      Product Name
                    </th>
                    <th className=" px-6 py-3 text-gray-500 font-semibold">
                      Barcode
                    </th>
                    <th className=" px-6 py-3 text-gray-500 font-semibold">
                      Quantity
                    </th>
                    <th className=" px-4 py-3 text-gray-500 font-semibold">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectProduct.length > 0 ? (
                    selectProduct.map((product) => (
                      <tr key={product.id} className="text-black">
                        <td className="px-4 py-2 text-start space-y-2">
                          {product.name}
                        </td>
                        <td className="px-4 py-2 space-y-2">
                          {product.barcode}
                        </td>
                        <td className="px-1 py-2 space-x-1">
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => {
                              const { value } = e.target;
                              handleQuantityChange(product.id, +value);
                            }}
                            className="border rounded-md text-sm w-14  py-1 text-center"
                          />
                        </td>
                        <td className=" text-red-600">
                          <div
                            className="flex item-center justify-center"
                            onClick={() => handleDelete(product.id)}
                          >
                            <RiDeleteBin6Line />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr
                      style={{ border: "none" }}
                      className="hover:bg-transparent"
                    >
                      <td
                        colSpan="8"
                        className="py-10 text-center space-y-3  w-full"
                      >
                        <div className="w-full flex justify-center">
                          <img
                            src={addItem}
                            alt="add Item"
                            className="w-24 h-24"
                          />
                        </div>

                        <div>No Products added </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 my-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Select Name
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Select Price
          </label>
        </div>

        <div className="w-1/4 my-3">
          <Select
            value={selectSheetDetails.sheetData.id || "1"}
            onValueChange={(data) => {
              const selectedSheet = sheets.find((ele) => ele.id == data);
              setSelectSheetDetails((val) => ({
                ...val,
                sheetData: selectedSheet,
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Sheet" />
            </SelectTrigger>
            <SelectContent>
              {sheets.map((ele) => (
                <SelectItem key={ele.id} value={ele.id}>
                  {ele.itemsPerSheet} per sheet (
                  {ele.dimensions[0] + " * " + ele.dimensions[0]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4 mb-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Reset
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={reactToPrintFn}
          >
            Print Barcode
          </button>
        </div>

        {/* Barcode Display */}
        <div
          className="grid grid-cols-5 gap-4 p-4 border rounded bg-white"
          ref={barcodeRef}
          style={{
            height: "10.3in",
            width: "8.45in",
            display: "block",
            margin: "10px auto",
            breakAfter: "page",
            paddingTop: "0.1in",
          }}
        >
          {selectProduct.map((product) =>
            Array.from({ length: product.quantity }).map((_, i) => (
              <div
                key={`${product.id}-${i}`}
                className="text-center flex text-sm"
              >
                <div className="border p-2">
                  <div className="bg-black w-full h-[56px] w-[110px]"></div>
                  <p>{product.barcode}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModelOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg shadow-lg p-6 z-10">
            <h2 className="text-xl font-semibold mb-4">Update Barcode</h2>
            <input
              type="text"
              className="border rounded w-full py-2 px-3 mb-4"
              placeholder="Enter new barcode"
              onChange={(e) => setNewBarcode(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setIsModelOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={updateProductBarcode}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrintBarcode;
