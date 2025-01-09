import {
  addDoc,
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db, storage } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

function CreateProduct({ isOpen, onClose, onProductAdded, onProductUpdated }) {
  const userDetails = useSelector((state) => state.users);
  const [productImage, setProductImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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
  useEffect(() => {
    fetchCategories();
    fetchWarehouses();
    if (onProductUpdated) {
      setFormData({
        ...onProductUpdated,
      });
      setProductImage(onProductUpdated.imageUrl || "");
    }
  }, [onProductUpdated, userDetails]);

  function ResetForm() {
    setFormData({
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
    setProductImage("");
  }

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

  async function onCreateProduct(e) {
    e.preventDefault();
    try {
      // let fieldValue = formData.discount;

      // if (formData.discountType) {
      //   fieldValue = (formData.sellingPrice / 100) * formData.discount;
      // }
      // const amount = formData.sellingPrice - fieldValue;

      // const sellingPriceTaxAmount = amount * (formData.tax / 100);
      // if (!formData.barcode) {
      //   alert("Please provide a valid barcode.");
      //   return;
      // }

      if (onProductUpdated?.id) {
        const productDocRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "products",
          onProductUpdated.id
        );

        const productImageUrl = productImage
          ? await handleFileChange(productImage)
          : formData.imageUrl;
        const { id, includingTax, unitPrice, taxAmount, ...rest } = formData;
        const payload = {
          ...rest,
          imageUrl: productImageUrl,
          // companyRef: doc(
          //   db,
          //   "companies",
          //   userDetails.companies[userDetails.selectedCompanyIndex].companyId
          // ),
          // userRef: doc(db, "users", userDetails.userId),
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
          imageUrl: productImageUrl,
          createdAt: Timestamp.fromDate(new Date()),
          companyRef,
          userRef,
        };
        let productRef = "";
        if (formData.barcode) {
          const productDocRef = doc(
            db,
            "companies",
            companyDetails.companyId,
            "products",
            formData.barcode
          );
          productRef = await setDoc(productDocRef, payload);
        } else {
          // productDocRef = collection(db, "products");
          const productDocRef = collection(
            db,
            "companies",
            companyDetails.companyId,
            "products"
          );
          productRef = await addDoc(productDocRef, payload);
        }
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
      }
      onProductAdded();
      ResetForm();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onCreateProduct ~ error:", error);
    }
  }
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        onClose();
        ResetForm();
      }}
    >
      <div
        className={`bg-white  pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className=" text-sm text-gray-600 ">
            {onProductUpdated ? "Edit Product" : "New Product"}
          </h2>
          <button
            onClick={() => {
              onClose();
              ResetForm();
            }}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={onCreateProduct}>
          <div className="space-y-2 p-5">
            <div className="space-y-1">
              <div className="grid w-full mb-2 items-center gap-1.5">
                <label className="text-gray-600">Product Image</label>

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
            <div className="space-y-1">
              <label className=" text-sm text-gray-600 mt-2">
                Item Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="input-tag w-full"
                placeholder="name"
                value={formData.name || ""}
                required
                onChange={(e) =>
                  setFormData((val) => ({ ...val, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">
                Selling Price<span className="text-red-500">*</span>
              </label>

              <div className="flex items-center justify-center">
                <input
                  type="number"
                  name="pricing.sellingPrice.amount"
                  className="w-full border px-5 py-3 rounded-l-md"
                  placeholder="Selling Price"
                  required
                  value={formData.sellingPrice || ""}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      sellingPrice: +e.target.value,
                    }))
                  }
                />
                <select
                  className="w-full  border px-5 py-3 rounded-r-md text-gray-600"
                  name="pricing.sellingPrice.includingTax"
                  value={formData.sellingPriceTaxType}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      sellingPriceTaxType:
                        e.target.value === "true" ? true : false,
                    }))
                  }
                >
                  <option value="true">Incl Tax</option>
                  <option value="false">Excl Tax</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Purchase Price</label>

              <div className="flex items-center justify-center">
                <input
                  type="number"
                  name="purchasePricing"
                  className="w-full border px-5 py-3 rounded-l-md"
                  placeholder="Purchase Pricing"
                  value={formData.purchasePrice || ""}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      purchasePrice: +e.target.value,
                    }))
                  }
                />
                <select
                  className="w-full  border px-5 py-3 rounded-r-md text-gray-600"
                  value={formData.purchasePriceTaxType}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      purchasePriceTaxType:
                        e.target.value === "true" ? true : false,
                    }))
                  }
                >
                  <option value="true">Incl Tax</option>
                  <option value="false">Excl Tax</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Discount</label>

              <div className="flex items-center justify-center ">
                <input
                  type="number"
                  name="discount"
                  className="w-full border px-5 py-3 rounded-l-md"
                  placeholder="Discount"
                  value={formData.discount || ""}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      discount: +e.target.value || 0,
                    }))
                  }
                />
                <select
                  className="w-full border px-5 py-3 rounded-r-md text-gray-600"
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      discountType: e.target.value === "true" ? true : false,
                    }))
                  }
                >
                  <option value="true">%</option>
                  <option value="false">Fixed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">GST Tax</label>
              <select
                className="w-full input-tag text-gray-600"
                value={formData.tax}
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    tax: +e.target.value,
                  }))
                }
              >
                <option value={0}>0 %</option>
                <option value={5}>5 %</option>
                <option value={12}>12 %</option>
                <option value={18}>18 %</option>
                <option value={28}>28 %</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">
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
            <div className="space-y-1">
              <label className=" text-sm text-gray-600 ">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                readOnly={onProductUpdated?.barcode}
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
              <label className=" text-sm text-gray-600">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                className="w-full input-tag text-gray-600 "
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData((val) => ({ ...val, category: e.target.value }))
                }
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((ele) => (
                  <option value={ele.name} key={ele.id}>
                    {ele.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Warehouse</label>
              <Select
                value={formData.warehouse ?? ""}
                onValueChange={(val) => {
                  console.log(val);
                  setFormData((pre) => ({
                    ...pre,
                    warehouse: val,
                  }));
                }}
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Description </label>

              <input
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
            <div className="space-y-1">
              <label className=" text-sm text-gray-600">Units</label>
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
          </div>
          <div className="w-full border-t bg-white sticky bottom-0 px-5 py-3">
            <button
              type="submit"
              className="w-full bg-purple-500 text-white px-5 py-3 text-sm text-gray-600 rounded-md"
            >
              {onProductUpdated ? "Update " : "Create "}Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
CreateProduct.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onProductAdded: PropTypes.func,
  onProductUpdated: PropTypes.object,
};

export default CreateProduct;
