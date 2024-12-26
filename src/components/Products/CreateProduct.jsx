import {
  addDoc,
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db, storage } from "../../firebase";
import { useSelector } from "react-redux";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

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
    image: "",
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

  useEffect(() => {
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
    fetchCategories();
    fetchWarehouses();
    if (onProductUpdated) {
      setFormData({
        ...onProductUpdated,
      });
      // setProductImage(onProductUpdated.image || "");
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
      image: "",
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

  // const handleFileChange = async (file) => {
  //   if (file) {
  //     try {
  //       const storageRef = ref(storage, `productImages/${file.name}`);
  //       await uploadBytes(storageRef, file);
  //       const productImageUrl = await getDownloadURL(storageRef);
  //       return productImageUrl;
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //     }
  //   }
  // };

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
        // const productImageUrl = productImage.name
        //   ? await handleFileChange(productImage)
        //   : formData.image;
        const { id, includingTax, unitPrice, taxAmount, ...rest } = formData;
        const payload = {
          ...rest,
          // image: productImageUrl,
          // companyRef: doc(
          //   db,
          //   "companies",
          //   userDetails.companies[userDetails.selectedCompanyIndex].companyId
          // ),
          // userRef: doc(db, "users", userDetails.userId),
        };
        await updateDoc(productDocRef, payload); // Update product
        alert("Product successfully updated.");
      } else {
        let productDocRef;
        // let productImageUrl = "";
        // if (productImage?.name) {
        //   productImageUrl = await handleFileChange(productImage);
        // }
        const companyRef = doc(
          db,
          "companies",
          userDetails.companies[userDetails.selectedCompanyIndex].companyId
        );
        const userRef = doc(db, "users", userDetails.userId);

        const payload = {
          ...formData,
          // image: productImageUrl,
          createdAt: Timestamp.fromDate(new Date()),
          companyRef,
          userRef,
        };
        if (formData.barcode) {
          productDocRef = doc(
            db,
            "companies",
            companyDetails.companyId,
            "products",
            formData.barcode
          );
          await setDoc(productDocRef, payload);
        } else {
          // productDocRef = collection(db, "products");
          productDocRef = collection(
            db,
            "companies",
            companyDetails.companyId,
            "products"
          );
          await addDoc(productDocRef, payload);
        }
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
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold ">
          {onProductUpdated ? "Edit Product" : "New Product"}
        </h2>
        <button
          onClick={() => {
            onClose();
            ResetForm();
          }}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>

        <form className="space-y-1.5" onSubmit={onCreateProduct}>
          <div>
            <div className="grid w-full mb-2 items-center gap-1.5">
              <label className="text-sm block font-semibold ">
                Product Image
              </label>
              <input
                id="picture"
                type="file"
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
                onChange={(e) => setProductImage(e.target.files[0])}
              />
            </div>
          </div>
          <div>
            <label className="text-sm block font-semibold mt-2">
              Item Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
              placeholder="name"
              value={formData.name || ""}
              required
              onChange={(e) =>
                setFormData((val) => ({ ...val, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-sm block font-semibold">Selling Price</label>

            <div className="flex items-center justify-center">
              <input
                type="number"
                name="pricing.sellingPrice.amount"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
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
                className="w-full  border border-gray-300 p-2 rounded-r-lg"
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
            <label className="text-sm block font-semibold">
              Purchase Price
            </label>

            <div className="flex items-center justify-center">
              <input
                type="number"
                name="purchasePricing"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
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
                className="w-full  border border-gray-300 p-2 rounded-r-lg"
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
            <label className="text-sm block font-semibold">Discount</label>

            <div className="flex items-center justify-center ">
              <input
                type="number"
                name="discount"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
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
                className="w-full border border-gray-300 p-2 rounded-r-lg"
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

          <div>
            <label className="text-sm block font-semibold">GST Tax</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg"
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
          <div>
            <label className="text-sm block font-semibold">Stock</label>
            <input
              type="text"
              name="stock"
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Stock/Quantity"
              value={formData.stock || ""}
              onChange={(e) =>
                setFormData((val) => ({
                  ...val,
                  stock: +e.target.value,
                }))
              }
            />
          </div>
          <div>
            <div className="grid w-full mb-2 items-center gap-1.5">
              <label className="text-sm block font-semibold ">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                readOnly={onProductUpdated?.barcode}
                className="w-full border border-gray-300 p-2 rounded-md"
                onChange={(e) =>
                  setFormData((val) => ({
                    ...val,
                    barcode: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <hr></hr>
          <div>
            <label className="text-sm block font-semibold">
              Category & Warehouse
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData((val) => ({ ...val, category: e.target.value }))
              }
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
            <select
              className="w-full border border-gray-300 p-2 my-1 rounded-md"
              value={formData.warehouse || ""}
              onChange={(e) =>
                setFormData((val) => ({ ...val, warehouse: e.target.value }))
              }
            >
              <option value="" disabled>
                Select Warehouse
              </option>
              {warehouses.map((ele) => (
                <option value={ele.name} key={ele.id}>
                  {ele.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="description"
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((val) => ({ ...val, description: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm block font-semibold">Units</label>
            <input
              type="text"
              name="units"
              className="w-full border border-gray-300 p-2 rounded-md"
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

          <button
            type="submit"
            className="w-full bg-purple-500 text-white p-2 rounded-md mt-4"
          >
            {onProductUpdated ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;
