import axios from "axios";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";
import SetCategory from "./Categories/SetCategory";
import SetWarehouse from "./WareHouses/SetWarehouse";

function CreateProduct() {
  const { id: productId } = useParams();
  const userDetails = useSelector((state) => state.users);
  const [productImage, setProductImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [sideBarOpen, setSidebarOpen] = useState("");
  const [isHsnDropdownVisible, setIsHsnDropdownVisible] = useState(false);
  const [hsnSuggestions, setHsnSuggestions] = useState([]);
  const [selectedHSN, setSelectedHSN] = useState("");
  const [formData, setFormData] = useState({
    barcode: "",
    category: "",
    companyRef: "",
    createdAt: "",
    description: "",
    discount: 0,
    discountType: true,
    imageUrl: "",
    name: "",
    purchasePrice: 0,
    purchasePriceTaxType: true,
    sellingPrice: 0,
    sellingPriceTaxType: true,
    stock: 0,
    tax: 0,
    units: "",
    userRef: "",
    warehouse: "",
  });
  const navigate = useNavigate();
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const fetchWarehouses = async () => {
    const warehousesRef = collection(
      db,
      "companies",
      userDetails.companies[userDetails.selectedCompanyIndex].companyId,
      "warehouses"
    );
    const snapshot = await getDocs(warehousesRef);

    const warehousesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWarehouses(warehousesData);
  };
  const fetchCategories = async () => {
    const categoriesRef = collection(
      db,
      "companies",
      userDetails.companies[userDetails.selectedCompanyIndex].companyId,
      "categories"
    );
    const snapshot = await getDocs(categoriesRef);

    const categoriesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCategories(categoriesData);
  };
  async function fetchProduct() {
    try {
      const productRef = doc(
        db,
        "companies",
        companyDetails.companyId,
        "products",
        productId
      );
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        setFormData(productData);
        setProductImage(productData.imageUrl || "");
        setSelectedHSN(productData.hsn);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("🚀 ~ fetchProduct ~ error:", error);
    }
  }
  useEffect(() => {
    fetchCategories();
    fetchWarehouses();
    if (productId) {
      fetchProduct();
    }
  }, []);

  const handleFileChange = async (file) => {
    if (file) {
      try {
        const storageRef = ref(storage, `productImages/${file.name}`);
        await uploadBytes(storageRef, file);
        const productImageUrl = await getDownloadURL(storageRef);
        return productImageUrl;
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  async function onCreateProduct() {
    const { stock, name, category, sellingPrice } = formData;
    const isValid = stock > 0 && category && name && sellingPrice > 0;
    if (!isValid) {
      alert("Please Required Details");
      return;
    }

    try {
      let productLogs = {
        ref: "",
        date: serverTimestamp(),
        section: "Inventory",
        action: "Create",
        description: `${name} created on inventory`,
      };

      if (productId) {
        const productDocRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "products",
          productId
        );

        const productImageUrl = productImage
          ? await handleFileChange(productImage)
          : formData.imageUrl;

        const { id, ...rest } = formData;
        const payload = {
          ...rest,
          hsn: selectedHSN | "",
          imageUrl: productImageUrl,
        };
        await updateDoc(productDocRef, payload); // Update product
        const productPayloadLogs = {
          date: new Date(),
          status: "update",
          quantity: formData.stock,
          from: "inventory",
          ref: productDocRef,
        };
        await addDoc(collection(productDocRef, "logs"), productPayloadLogs);
        productLogs.action = "Update";
        productLogs.description = `${name} product updated`;
        alert("Product successfully updated.");
      } else {
        let productImageUrl = "";
        if (productImage) {
          productImageUrl = await handleFileChange(productImage);
        }
        const companyRef = doc(
          db,
          "companies",
          userDetails.companies[userDetails.selectedCompanyIndex].companyId
        );
        const userRef = doc(db, "users", userDetails.userId);

        const payload = {
          ...formData,
          hsn: selectedHSN || "",
          imageUrl: productImageUrl,
          createdAt: Timestamp.fromDate(new Date()),
          companyRef,
          userRef,
        };

        // productDocRef = collection(db, "products");
        const productDocRef = collection(
          db,
          "companies",
          companyDetails.companyId,
          "products"
        );
        const productRef = await addDoc(productDocRef, payload);

        const productPayloadLogs = {
          date: payload.createdAt,
          status: "add",
          quantity: formData.stock,
          from: "inventory",
          ref: productRef,
        };
        await addDoc(
          collection(
            db,
            "companies",
            companyDetails.companyId,
            "products",
            productRef.id,
            "logs"
          ),
          productPayloadLogs
        );
        alert("Product successfully created.");
        productLogs.action = "Create";
        productLogs.description = `${name} product created`;
      }
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        productLogs
      );
      navigate("/products");
    } catch (error) {
      console.log("🚀 ~ onCreateProduct ~ error:", error);
    }
  }

  const handleHsnInputChange = async (e) => {
    const value = e.target.value.trim();
    setSelectedHSN({ code: value });
    setIsHsnDropdownVisible(true);
    if (value.length < 4) {
      return;
    }
    try {
      let response = [];

      if (!isNaN(+value)) {
        response = await axios.get(
          `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${value}&selectedType=byCode&category=null`
        );
      } else {
        response = await axios.get(
          `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${value}&selectedType=byDesc&category=P`
        );
      }
      if (response?.data) {
        setHsnSuggestions(response.data.data);
      }
    } catch (e) {
      console.log("🚀 ~ handleHsnInputChange ~ e:", e);
    }
  };

  return (
    <div className="bg-gray-100 overflow-y-auto" style={{ height: "92vh" }}>
      <header className="flex items-center   my-2">
        <Link className="flex items-center" to={"/products"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link>
        <h2 className="text-lg text-gray-600 font-bold">
          {productId ? "Edit Product" : "New Product"}
        </h2>
      </header>
      <div className="px-5">
        <div className="container2">
          <div className="">
            <div className="border-b py-3 px-5 space-y-2">
              <div className="">Product Information</div>
              <div className="space-y-1">
                <label className="  text-gray-600">
                  Item Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input-tag w-full "
                  placeholder="Name"
                  value={formData.name || ""}
                  required
                  onChange={(e) =>
                    setFormData((val) => ({ ...val, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">
                  Category<span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center items-center">
                  <Select
                    value={formData.category ?? ""}
                    onValueChange={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        category: val,
                      }));
                    }}
                  >
                    <SelectTrigger
                      style={{
                        borderTopRightRadius: "0px",
                        borderBottomRightRadius: "0px",
                      }}
                    >
                      <SelectValue placeholder=" Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((ele) => (
                        <SelectItem value={ele.name} key={ele.id}>
                          {ele.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    className="w-28 btn-outline-black h-12"
                    style={{
                      borderTopLeftRadius: "0px",
                      borderBottomLeftRadius: "0px",
                    }}
                    onClick={() => setSidebarOpen("category")}
                  >
                    + New
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">
                  Selling Price<span className="text-red-500">*</span>
                </label>

                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    name="pricing.sellingPrice.amount"
                    className="w-full input-tag "
                    placeholder="Selling Price"
                    required
                    value={formData.sellingPrice || ""}
                    onChange={(e) =>
                      setFormData((val) => ({
                        ...val,
                        sellingPrice: +e.target.value,
                      }))
                    }
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  />

                  <Select
                    defaultValue={
                      formData.sellingPriceTaxType ? "true" : "false"
                    }
                    onValueChange={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        sellingPriceTaxType: val == "true" ? true : false,
                      }));
                    }}
                  >
                    <SelectTrigger
                      style={{
                        height: "50px",
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                      }}
                    >
                      <SelectValue placeholder=" Select SellingPriceTaxType" />
                    </SelectTrigger>
                    <SelectContent className="h-18">
                      <SelectItem value="true">Incl Tax</SelectItem>
                      <SelectItem value="false">Excl Tax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Purchase Price</label>

                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    name="purchasePricing"
                    className="w-full input-tag"
                    placeholder="Purchase Pricing"
                    value={formData.purchasePrice || ""}
                    onChange={(e) =>
                      setFormData((val) => ({
                        ...val,
                        purchasePrice: +e.target.value,
                      }))
                    }
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  />
                  <Select
                    defaultValue={
                      formData.purchasePriceTaxType ? "true" : "false"
                    }
                    onValueChange={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        purchasePriceTaxType: val == "true" ? true : false,
                      }));
                    }}
                  >
                    <SelectTrigger
                      style={{
                        height: "50px",
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                      }}
                    >
                      <SelectValue placeholder=" Select PurchasePriceTaxType" />
                    </SelectTrigger>
                    <SelectContent className="h-18">
                      <SelectItem value="true">Incl Tax</SelectItem>
                      <SelectItem value="false">Excl Tax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Discount</label>

                <div className="flex items-center justify-center ">
                  <input
                    type="number"
                    name="discount"
                    className="w-full input-tag"
                    placeholder="Discount"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      setFormData((val) => ({
                        ...val,
                        discount: +e.target.value || 0,
                      }))
                    }
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  />
                  <Select
                    defaultValue={formData.discountType ? "true" : "false"}
                    onValueChange={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        discountType: val == "true" ? true : false,
                      }));
                    }}
                  >
                    <SelectTrigger
                      style={{
                        height: "50px",
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                      }}
                    >
                      <SelectValue placeholder=" Select discountType" />
                    </SelectTrigger>
                    <SelectContent className="h-18">
                      <SelectItem value="true">%</SelectItem>
                      <SelectItem value="false">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div>Product Media</div>
              <div className="space-y-1">
                <div className="grid w-full mb-2 items-center gap-1.5">
                  <label className=" text-gray-600">Product Image</label>
                  <label
                    htmlFor="file"
                    className="cursor-pointer p-3 rounded-md border-2 border-dashed border shadow-[0_0_200px_-50px_rgba(0,0,0,0.72)]"
                  >
                    <div className="flex  items-center justify-center gap-1">
                      {productImage?.name ? (
                        <span className="py-1 px-4">{productImage?.name}</span>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 640 512"
                            className="h-8 fill-gray-600"
                          >
                            <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                          </svg>
                          <span className="py-1 px-4">Upload Image</span>
                        </>
                      )}
                    </div>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={(e) => setProductImage(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div className="">Inventory</div>
              <div className="flex space-x-3">
                <div className="space-y-1 w-full">
                  <label className="  text-gray-600">SKU ID</label>
                  <input
                    type="text"
                    name="SKU"
                    className="w-full input-tag"
                    placeholder="SKU ID"
                    value={formData.skuId || ""}
                    onChange={(e) =>
                      setFormData((val) => ({
                        ...val,
                        skuId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1 w-full">
                  <label className="  text-gray-600">
                    Stock<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="stock"
                    className="w-full input-tag"
                    placeholder="Stock/Quantity"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData((val) => ({
                        ...val,
                        stock: +e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div className="">Shipping & Tax</div>
              <div className="space-y-1">
                <label className="  text-gray-600">Units</label>
                <input
                  type="text"
                  name="units"
                  className="w-full input-tag"
                  placeholder="Units (Ex: CM, BOX)"
                  value={formData.units || ""}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      units: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex-1">
                <label className="  text-gray-600">HSN Code</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="HSN CODE "
                    className="w-full input-tag"
                    value={selectedHSN?.code}
                    onChange={handleHsnInputChange}
                    onFocus={() => {
                      setIsHsnDropdownVisible(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (!selectedHSN.code) {
                          setSelectedHSN({ code: "" });
                        }
                        setIsHsnDropdownVisible(false);
                      }, 200);
                    }}
                  />
                  {isHsnDropdownVisible && hsnSuggestions.length > 0 && (
                    <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto w-full">
                      {hsnSuggestions.map((item, index) => (
                        <div
                          key={index}
                          onMouseDown={() => {
                            setSelectedHSN({
                              code: item.c,
                              description: item.n,
                            });
                            setIsHsnDropdownVisible(false);
                          }}
                          className="flex flex-col px-4 py-2 text-gray-800 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out"
                        >
                          <span className="font-medium ">
                            code:
                            <span className="font-semibold">{item.c}</span>
                          </span>
                          <span className="text-xs text-gray-600">
                            Descriptions: {item.n}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className=" text-gray-600">GST Tax</label>
                <Select
                  value={String(formData.tax)}
                  onValueChange={(val) => {
                    setFormData((pre) => ({
                      ...pre,
                      tax: +val,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST Tax" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    <SelectItem value="28">28</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div className="space-y-1">
                <label className="  text-gray-600 ">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  placeholder="Barcode"
                  className="w-full input-tag"
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      barcode: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Warehouse</label>
                <div className="flex justify-center items-center">
                  <Select
                    value={formData.warehouse ?? ""}
                    onValueChange={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        warehouse: val,
                      }));
                    }}
                  >
                    <SelectTrigger
                      style={{
                        borderTopRightRadius: "0px",
                        borderBottomRightRadius: "0px",
                      }}
                    >
                      <SelectValue placeholder="Select a Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((ele) => (
                        <SelectItem value={ele.name} key={ele.id}>
                          {ele.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    className="w-28 btn-outline-black h-12"
                    onClick={() => setSidebarOpen("warehouse")}
                    style={{
                      borderTopLeftRadius: "0px",
                      borderBottomLeftRadius: "0px",
                    }}
                  >
                    + New
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Description </label>
                <textarea
                  type="text"
                  name="description"
                  className="w-full input-tag"
                  placeholder="Description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-t bg-white sticky bottom-0 flex justify-end py-3 px-5">
        <button className="btn-add" onClick={onCreateProduct}>
          {productId ? "Update " : "Create "} Product
        </button>
      </div>
      {sideBarOpen && (
        <>
          <SetCategory
            isOpen={sideBarOpen == "category"}
            onClose={() => setSidebarOpen("")}
            onAddCategory={(newData) => {
              setCategories((val) => [...val, newData]);
            }}
            companyId={companyDetails.companyId}
          />
          <SetWarehouse
            onClose={() => setSidebarOpen("")}
            isOpen={sideBarOpen == "warehouse"}
            onAddWarehouse={(newData) => {
              setWarehouses((val) => [...val, newData]);
            }}
            companyId={companyDetails.companyId}
          />
        </>
      )}
    </div>
  );
}

export default CreateProduct;
