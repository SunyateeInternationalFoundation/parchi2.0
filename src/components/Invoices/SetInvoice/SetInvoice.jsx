import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Sidebar from "./Sidebar";
import { setAllCustomersDetails } from "../../../store/CustomerSlice";

const SetInvoice = () => {
  const { invoiceId } = useParams();

  const userDetails = useSelector((state) => state.users);
  const customersDetails = useSelector((state) => state.customers).data;
  const dispatch = useDispatch();
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const phoneNo = userDetails.phone;

  const [date, setDate] = useState(Timestamp.fromDate(new Date()));
  const [dueDate, setDueDate] = useState(Timestamp.fromDate(new Date()));
  const [taxSelect, setTaxSelect] = useState("");
  const [selectedTaxDetails, setSelectedTaxDetails] = useState({});
  const [total_Tax_Amount, setTotal_Tax_Amount] = useState(0);
  const [taxTypeOptions, setTaxTypeOptions] = useState({
    tds: [],
    tcs: [],
  });
  const [isProductSelected, setIsProductSelected] = useState(false);

  const [products, setProducts] = useState([]);
  const [preInvoiceList, setPreInvoiceList] = useState([]);
  const [books, setBooks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    book: {},
    warehouse: {},
    discount: 0,
    paymentStatus: "UnPaid",
    notes: "",
    invoiceNo: "",
    packagingCharges: 0,
    subTotal: 0,
    tds: {},
    total: 0,
    shippingCharges: 0,
    tax: 0,
    attachments: [],
    tcs: {},
    terms: "",
    mode: "Cash",
    extraDiscount: 0,
    extraDiscountType: "percentage",
  });

  const [totalAmounts, setTotalAmounts] = useState({
    totalTaxableAmount: 0,
    totalSgstAmount_2_5: 0,
    totalCgstAmount_2_5: 0,
    totalSgstAmount_6: 0,
    totalCgstAmount_6: 0,
    totalSgstAmount_9: 0,
    totalCgstAmount_9: 0,
    totalAmount: 0,
  });

  const [selectedCustomerData, setSelectedCustomerData] = useState({
    name: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    function addActionQty() {
      if (
        formData?.products?.length === 0 ||
        products.length === 0 ||
        !invoiceId
      ) {
        return;
      }
      setIsProductSelected(true);
      let productData = products;
      for (let ele of formData.products) {
        productData = products.map((pro) => {
          if (pro.id === ele.productRef.id) {
            pro.actionQty = ele.quantity;
            pro.quantity += ele.quantity;
            pro.totalAmount = ele.quantity * pro.netAmount;
          }
          return pro;
        });
      }
      setProducts(productData);
      calculateProduct(productData);
    }
    addActionQty();
    if (invoiceId) {
      fetchInvoiceNumbers();
    }
  }, [formData.products]);

  const fetchInvoiceNumbers = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "companies", companyDetails.companyId, "invoices")
      );
      const noList = querySnapshot.docs.map((doc) => doc.data().invoiceNo);
      if (invoiceId) {
        setPreInvoiceList(noList.filter((ele) => ele !== formData.invoiceNo));
      } else {
        setPreInvoiceList(noList);
        setFormData((val) => ({
          ...val,
          invoiceNo: String(noList.length + 1).padStart(4, 0),
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function onSelect_TDS_TCS(e) {
    const taxId = e.target.value;
    let taxDetails = taxTypeOptions[taxSelect].find((ele) => ele.id === taxId);
    setSelectedTaxDetails(taxDetails);
  }

  useEffect(() => {
    async function fetchInvoiceData() {
      if (!invoiceId) {
        return;
      }
      try {
        const docRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "invoices",
          invoiceId
        );
        const getData = (await getDoc(docRef)).data();

        setDate(getData.date);
        setDueDate(getData.dueDate);
        const customerData = (
          await getDoc(getData.customerDetails.customerRef)
        ).data();
        handleSelectCustomer({
          id: getData.customerDetails.customerRef.id,
          ...customerData,
        });
        setFormData(getData);
      } catch (error) {
        console.log("🚀 ~ fetchInvoiceData ~ error:", error);
      }
    }

    async function customerDetails() {
      if (customersDetails.length !== 0) {
        return;
      }

      try {
        const customersRef = collection(db, "customers");
        const companyRef = doc(db, "companies", companyDetails.companyId);
        const q = query(customersRef, where("companyRef", "==", companyRef));
        const company = await getDocs(q);
        const customersData = company.docs.map((doc) => {
          const { createdAt, companyRef, ...data } = doc.data();
          return {
            id: doc.id,
            createdAt: JSON.stringify(createdAt),
            companyRef: JSON.stringify(companyRef),
            ...data,
          };
        });
        dispatch(setAllCustomersDetails(customersData));
        setSuggestions(customersData);
      } catch (error) {
        console.log("🚀 ~ customerDetails ~ error:", error);
      }
    }

    async function fetchTax() {
      try {
        const tdsRef = collection(db, "tds");
        const tdsQuerySnapshot = await getDocs(tdsRef);
        const tdsData = tdsQuerySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            natureOfPayment: data.payment_nature,
            percentage: data.percentage,
            percentageValue: data.percentage_value,
            tdsSection: data.tds_section,
          };
        });
        const tcsRef = collection(db, "tcs_tax");
        const tcsQuerySnapshot = await getDocs(tcsRef);
        const tcsData = tcsQuerySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            tax: data.tax,
            tax_value: data.tax_value,
            type_of_goods: data.type_of_goods,
          };
        });

        setTaxTypeOptions({
          tds: tdsData,
          tcs: tcsData,
        });
      } catch (error) {
        console.log("🚀 ~ fetchTDC ~ error:", error);
      }
    }

    async function fetchBooks() {
      try {
        const bookRef = collection(
          db,
          "companies",
          companyDetails.companyId,
          "books"
        );
        const getBookData = await getDocs(bookRef);
        const fetchBooks = getBookData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(fetchBooks);
      } catch (error) {
        console.log("🚀 ~ fetchBooks ~ error:", error);
      }
    }

    async function fetchWarehouse() {
      try {
        const bookRef = collection(
          db,
          "companies",
          companyDetails.companyId,
          "warehouses"
        );
        const getWarehouseData = await getDocs(bookRef);
        const fetchWarehouses = getWarehouseData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWarehouses(fetchWarehouses);
      } catch (error) {
        console.log("🚀 ~ fetchBooks ~ error:", error);
      }
    }

    const fetchProducts = async () => {
      try {
        const companyRef = doc(db, "companies", companyDetails.companyId);
        const productRef = collection(
          db,
          "companies",
          companyDetails.companyId,
          "products"
        );
        const q = query(productRef, where("companyRef", "==", companyRef));
        const querySnapshot = await getDocs(q);

        const productsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          let discount = +data.discount || 0;

          if (data.discountType) {
            discount = (+data.sellingPrice / 100) * data.discount;
          }
          const netAmount = +data.sellingPrice - discount;
          const taxRate = data.tax || 0;
          let sgst = 0;
          let cgst = 0;
          let taxAmount = 0;
          let sgstAmount = 0;
          let cgstAmount = 0;

          sgst = taxRate / 2;
          cgst = taxRate / 2;
          taxAmount = netAmount * (taxRate / 100);
          sgstAmount = netAmount * (sgst / 100);
          cgstAmount = netAmount * (cgst / 100);

          return {
            id: doc.id,
            description: data.description ?? "",
            name: data.name ?? "N/A",
            quantity: data.stock ?? 0,
            sellingPrice: data.sellingPrice ?? 0,
            sellingPriceTaxType: data.sellingPriceTaxType,
            purchasePrice: data.purchasePrice ?? 0,
            purchasePriceTaxType: data.purchasePriceTaxType,
            discount: discount ?? 0,
            fieldDiscount: data.discount,
            discountType: data.discountType,
            tax: data.tax,
            actionQty: 0,
            totalAmount: 0,
            netAmount: netAmount,
            sgst,
            cgst,
            sgstAmount,
            cgstAmount,
            taxAmount,
          };
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    if (!invoiceId) {
      fetchInvoiceNumbers();
    }

    fetchProducts();
    fetchBooks();
    fetchWarehouse();
    fetchInvoiceData();
    fetchTax();
    customerDetails();
  }, [companyDetails]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedCustomerData({ name: value });
    if (value) {
      const filteredSuggestions = customersDetails.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsDropdownVisible(true);
    } else {
      setSuggestions(customersDetails);
    }
  };

  const handleSelectCustomer = (item) => {
    setSelectedCustomerData(item);
    setIsDropdownVisible(false);
  };

  function handleActionQty(op, productId) {
    let countOfSelect = 0;
    let updatedProducts = products.map((product) => {
      if (product.id === productId) {
        // Update action quantity
        if (op === "+") {
          if (product.quantity > product.actionQty) {
            ++product.actionQty;
          }
        } else {
          if (0 < product.actionQty) {
            --product.actionQty;
          }
        }
        product.actionQty = Math.max(product.actionQty, 0); // Prevent negative quantity
        // Calculate total amount for each product based on quantity
        product.totalAmount = product.netAmount * product.actionQty;
      }
      if (product.actionQty !== 0) ++countOfSelect;
      return product;
    });
    setIsProductSelected(countOfSelect > 0);
    calculateProduct(updatedProducts);
    // Calculate totals based on updated quantities
  }
  function calculateProduct(products) {
    const totalTaxableAmount = products.reduce((sum, product) => {
      const cal =
        sum + (product.netAmount - product.taxAmount) * product.actionQty;
      if (!product.sellingPriceTaxType) {
        return sum + product.netAmount * product.actionQty;
      }
      return cal;
    }, 0);

    const totalSgstAmount_2_5 = products.reduce(
      (sum, product) =>
        product.sgst === 2.5
          ? sum + product.sgstAmount * product.actionQty
          : sum,
      0
    );
    const totalCgstAmount_2_5 = products.reduce(
      (sum, product) =>
        product.cgst === 2.5
          ? sum + product.cgstAmount * product.actionQty
          : sum,
      0
    );

    const totalSgstAmount_6 = products.reduce(
      (sum, product) =>
        product.sgst === 6 ? sum + product.sgstAmount * product.actionQty : sum,
      0
    );
    const totalCgstAmount_6 = products.reduce(
      (sum, product) =>
        product.cgst === 6 ? sum + product.cgstAmount * product.actionQty : sum,
      0
    );

    const totalSgstAmount_9 = products.reduce(
      (sum, product) =>
        product.sgst === 9 ? sum + product.sgstAmount * product.actionQty : sum,
      0
    );

    const totalCgstAmount_9 = products.reduce(
      (sum, product) =>
        product.cgst === 9 ? sum + product.cgstAmount * product.actionQty : sum,
      0
    );

    const totalAmount =
      totalTaxableAmount +
      totalSgstAmount_2_5 +
      totalCgstAmount_2_5 +
      totalSgstAmount_6 +
      totalCgstAmount_6 +
      totalSgstAmount_9 +
      totalCgstAmount_9;

    setProducts(products);
    setTotalAmounts({
      totalTaxableAmount,
      totalSgstAmount_2_5,
      totalCgstAmount_2_5,
      totalSgstAmount_6,
      totalCgstAmount_6,
      totalSgstAmount_9,
      totalCgstAmount_9,
      totalAmount,
    });
  }

  const calculateTotal = () => {
    const discountAmount =
      formData.extraDiscountType === "percentage"
        ? (+totalAmounts.totalAmount * formData.extraDiscount) / 100
        : formData.extraDiscount || 0;

    const total =
      totalAmounts.totalAmount +
      formData.shippingCharges +
      formData.packagingCharges +
      total_Tax_Amount -
      (isProductSelected ? discountAmount : 0);

    return total.toFixed(2);
  };

  function total_TCS_TDS_Amount() {
    const totalQty = products.reduce((acc, cur) => {
      return acc + cur.actionQty;
    }, 0);
    if (taxSelect === "" || !selectedTaxDetails.id || totalQty === 0) {
      return;
    }

    const amount =
      taxSelect === "tcs"
        ? selectedTaxDetails.tax_value
        : selectedTaxDetails.percentageValue;
    const totalTaxAmount = amount * totalQty;
    setTotal_Tax_Amount(totalTaxAmount);
  }

  useEffect(() => {
    total_TCS_TDS_Amount();
  }, [products, selectedTaxDetails]);

  async function onSetInvoice() {
    try {
      if (!selectedCustomerData.id) {
        return;
      }
      const customerRef = doc(db, "customers", selectedCustomerData.id);
      const companyRef = doc(db, "companies", companyDetails.companyId);
      let subTotal = 0;
      const items = [];
      for (const product of products) {
        if (product.actionQty === 0) {
          continue;
        }
        const productRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "products",
          product.id
        );
        subTotal += product.totalAmount;
        items.push({
          name: product.name,
          description: product.description,
          discount: product.fieldDiscount,
          discountType: product.discountType,
          purchasePrice: product.purchasePrice,
          purchasePriceTaxType: product.purchasePriceTaxType,
          sellingPrice: product.sellingPrice,
          sellingPriceTaxType: product.sellingPriceTaxType,
          tax: product.tax,
          quantity: product.actionQty,
          productRef: productRef,
        });
      }

      let tcs = {
        isTcsApplicable: Boolean(taxSelect === "tcs"),
        tax: taxSelect === "tcs" ? selectedTaxDetails.tax : "",
        tax_value: taxSelect === "tcs" ? selectedTaxDetails.tax_value : 0,
        type_of_goods:
          taxSelect === "tcs" ? selectedTaxDetails.type_of_goods : "",
        tcs_amount: taxSelect === "tcs" ? total_Tax_Amount : 0,
      };

      let tds = {
        isTdsApplicable: Boolean(taxSelect === "tds"),
        natureOfPayment:
          taxSelect === "tds" ? selectedTaxDetails.natureOfPayment : "",
        percentage: taxSelect === "tds" ? selectedTaxDetails.percentage : 0,
        percentageValue:
          taxSelect === "tds" ? selectedTaxDetails.percentageValue : "",
        tdsSection: taxSelect === "tds" ? selectedTaxDetails.tdsSection : "",
        tds_amount: taxSelect === "tds" ? total_Tax_Amount : 0,
      };

      const payload = {
        ...formData,
        tds,
        tcs,
        date,
        dueDate,
        createdBy: {
          companyRef: companyRef,
          name: companyDetails.name,
          address: companyDetails.address ?? "",
          city: companyDetails.city ?? "",
          zipCode: companyDetails.zipCode ?? "",
          phoneNo: phoneNo,
        },
        subTotal: +subTotal,
        total: +calculateTotal(),
        products: items,
        customerDetails: {
          gstNumber: selectedCustomerData.gstNumber ?? "",
          customerRef: customerRef,
          address: selectedCustomerData.address ?? "",
          city: selectedCustomerData.city ?? "",
          zipCode: selectedCustomerData.zipCode ?? "",
          phone: selectedCustomerData.phone ?? "",
          name: selectedCustomerData.name,
        },
      };

      if (invoiceId) {
        await updateDoc(
          doc(db, "companies", companyDetails.companyId, "invoices", invoiceId),
          payload
        );
      } else {
        await addDoc(
          collection(db, "companies", companyDetails.companyId, "invoices"),
          payload
        );
      }

      for (const item of items) {
        if (item.quantity === 0) {
          continue;
        }

        const currentQuantity = products.find(
          (val) => val.name === item.name
        ).quantity;

        if (currentQuantity <= 0) {
          alert("Product is out of stock!");
          throw new Error("Product is out of stock!");
        }

        await updateDoc(item.productRef, {
          stock: currentQuantity - item.quantity,
        });
      }

      alert(
        "Successfully " + (invoiceId ? "Updated" : "Created") + " the Invoice"
      );
      navigate("/invoice");
    } catch (err) {
      console.error(err);
    }
  }

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getFullYear}-${getMonth}-${getDate}`;
  }
  function onSelectBook(e) {
    const { value } = e.target;
    const data = books.find((ele) => ele.id === value);
    console.log("🚀 ~ onSelectBook ~ data:", data);
    const bookRef = doc(
      db,
      "companies",
      companyDetails.companyId,
      "books",
      value
    );
    setFormData((val) => ({
      ...val,
      book: { name: data.name, bookRef },
    }));
  }
  function onSelectWarehouse(e) {
    const { value } = e.target;
    const data = warehouses.find((ele) => ele.id === value);
    const warehouseRef = doc(
      db,
      "companies",
      companyDetails.companyId,
      "warehouses",
      value
    );
    setFormData((val) => ({
      ...val,
      warehouse: { name: data.name, warehouseRef },
    }));
  }
  return (
    <div
      className="px-5 pb-5 bg-gray-100 overflow-y-auto"
      style={{ height: "92vh" }}
    >
      <header className="flex items-center space-x-3  my-2">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
        </Link>
        <h1 className="text-2xl font-bold">
          {invoiceId ? "Edit" : "Create"} Invoice
        </h1>
      </header>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex gap-8 mb-6">
          <div className="flex-1">
            <h2 className="font-semibold mb-2">Customer Details</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="text-sm text-gray-600">
                Select Customer <span className="text-red-500">*</span>{" "}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your Customers, Company Name, GSTIN..."
                  className="text-base text-gray-900 font-semibold border p-1 rounded w-full mt-1"
                  value={selectedCustomerData?.name}
                  onChange={handleInputChange}
                  onFocus={() => setIsDropdownVisible(true)}
                  onBlur={() => {
                    if (!selectedCustomerData.id) {
                      setSelectedCustomerData({ name: "" });
                    }
                    setIsDropdownVisible(false);
                  }}
                  required
                />
                {isDropdownVisible && suggestions.length > 0 && (
                  <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto w-full">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onMouseDown={() => handleSelectCustomer(item)}
                        className="flex flex-col px-4 py-3 text-gray-800 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out"
                      >
                        <span className="font-medium text-sm">
                          Name:{" "}
                          <span className="font-semibold">{item.name}</span>
                        </span>
                        <span className="text-xs text-gray-600">
                          Phone No.: {item.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="font-semibold mb-2">Other Details</h2>
            <div className="grid grid-cols-3 gap-4 bg-pink-50 p-4 rounded-lg">
              <div>
                <label className="text-sm text-gray-600">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={DateFormate(date)}
                  className="border p-1 rounded w-full mt-1"
                  onChange={(e) => {
                    setDate(Timestamp.fromDate(new Date(e.target.value)));
                  }}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={DateFormate(dueDate)}
                  className="border p-1 rounded w-full mt-1"
                  onChange={(e) => {
                    setDueDate(Timestamp.fromDate(new Date(e.target.value)));
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Invoice No. <span className="text-red-500">*</span>
                  {preInvoiceList.includes(formData.invoiceNo) && (
                    <span className="text-red-800 text-xs">
                      "Already Invoice No. exist"{" "}
                    </span>
                  )}
                  {Number(formData.invoiceNo) == 0 && (
                    <span className="text-red-800 text-xs">
                      "Kindly Enter valid Invoice No."{" "}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Enter Invoice No. "
                  className="border p-1 rounded w-full mt-1"
                  value={formData.invoiceNo}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((val) => ({
                      ...val,
                      invoiceNo: value,
                    }));
                  }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <h2 className="font-semibold mb-2">Products & Services</h2>
          <div className="flex justify-between items-center gap-4 mb-4"></div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-inner mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex-grow">Items</h2>
            <button
              className="bg-blue-500 text-white py-1 px-4 rounded mt-1 ml-auto"
              onClick={() => setIsSidebarOpen(true)}
            >
              + Add Items
            </button>
          </div>

          <div className="bg-white">
            <div className="mb-4">
              <table className="min-w-full text-center text-gray-500 font-semibold">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Product Name</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Unit Price</th>
                    <th className="px-4 py-2">Discount</th>
                    <th className="px-4 py-2">Net Amount</th>
                    <th className="px-2 py-2">Is Tax Included</th>
                    <th className="px-4 py-2">Total Amount</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 && isProductSelected ? (
                    products.map(
                      (product) =>
                        product.actionQty > 0 && (
                          <tr key={product.id}>
                            <td className="px-4 py-2">{product.name}</td>
                            <td className="px-4 py-2">{product.quantity}</td>
                            <td className="px-4 py-2">
                              ₹{product.sellingPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              ₹{product.discount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              ₹{product.netAmount.toFixed(2)}
                            </td>
                            <td className="px-2 py-2">
                              {product.sellingPriceTaxType ? "Yes" : "No"}
                            </td>
                            <td className="px-4 py-2">
                              ₹{product.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              {product.actionQty >= 1 && (
                                <>
                                  <button
                                    className="bg-blue-500 text-white rounded w-1/5"
                                    onClick={() =>
                                      handleActionQty("-", product.id)
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="px-2">
                                    {product.actionQty}
                                  </span>{" "}
                                </>
                              )}
                              <button
                                className="bg-blue-500 text-white  rounded w-1/5 "
                                onClick={() => handleActionQty("+", product.id)}
                                disabled={product.quantity === 0}
                              >
                                +
                              </button>
                            </td>
                          </tr>
                        )
                    )
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-10 text-center">
                        No Product Selected
                      </td>
                    </tr>
                    // <tr>
                    //   <td colSpan="7" className="py-10 text-center">
                    //     <div className="flex flex-col items-center">
                    //       <p>
                    //         Search existing products to add to this list or add
                    //         a new product to get started!
                    //       </p>
                    //       <button
                    //         className="bg-blue-500 text-white py-1 px-4 rounded mt-4"
                    //         onClick={() => setIsSidebarOpen(true)}
                    //       >
                    //         + Add Items
                    //       </button>
                    //     </div>
                    //   </td>
                    // </tr>
                  )}
                </tbody>
              </table>
              {isSidebarOpen && (
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  productList={products}
                  handleActionQty={handleActionQty}
                  totalAmount={+totalAmounts.totalAmount}
                />
              )}
            </div>
            <div className="w-full mt-4 border-t pt-4 bg-gray-50 p-4 ">
              <div className="w-full grid grid-cols-3 gap-4">
                <div className="w-full ">
                  <div>Dispatch From</div>
                  <select
                    value={formData?.warehouse?.warehouseRef?.id || ""}
                    onChange={onSelectWarehouse}
                    className="border p-2 rounded w-full"
                  >
                    <option value="" disabled>
                      Select WareHouse
                    </option>
                    {warehouses.length > 0 &&
                      warehouses.map((warehouse, index) => (
                        <option value={warehouse.id} key={index}>
                          {warehouse.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="w-full ">
                  <div>Bank/Book</div>
                  <select
                    value={formData.book.bookRef?.id || ""}
                    onChange={onSelectBook}
                    className="border p-2 rounded w-full"
                  >
                    <option value="" disabled>
                      Select Bank/Book
                    </option>
                    {books.length > 0 &&
                      books.map((book, index) => (
                        <option value={book.id} key={index}>
                          {`${book.name} - ${book.bankName} - ${book.branch}`}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="w-full ">
                  <div>Sign</div>
                  <select
                    value=""
                    onChange={() => {}}
                    className="border p-2 rounded w-full"
                  >
                    <option value="" disabled>
                      Select Sign
                    </option>
                  </select>
                </div>
                <div className="w-full ">
                  <div>Attach Files</div>

                  <input
                    type="file"
                    className="flex h-10 w-full rounded-md border border-input
                  bg-white px-3 py-2 text-sm text-gray-400 file:border-0
                  file:bg-transparent file:text-gray-600 file:text-sm
                  file:font-medium"
                  />
                </div>
                <div className="w-full ">
                  <div>Shipping Charges</div>
                  <input
                    type="number"
                    value={formData.shippingCharges || ""}
                    placeholder="Shipping Charges"
                    className="border p-2 rounded w-full"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        shippingCharges: +e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full ">
                  <div>Packaging Charges</div>
                  <input
                    type="number"
                    value={formData.packagingCharges || ""}
                    placeholder="Packaging Charges"
                    className="border p-2 rounded w-full"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        packagingCharges: +e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full ">
                  <div>Notes</div>
                  <input
                    type="text"
                    value={formData.notes}
                    placeholder="Notes"
                    className="border p-2 rounded w-full"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        notes: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full ">
                  <div>Terms</div>
                  <textarea
                    type="text"
                    value={formData.terms}
                    className="border p-2 rounded w-full max-h-16 min-h-16"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        terms: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full flex justify-between items-center mt-5 space-x-3">
                  <div>TDS</div>
                  <div>
                    <label className="relative inline-block w-14 h-8">
                      <input
                        type="checkbox"
                        name="tds"
                        className="sr-only peer"
                        checked={taxSelect === "tds"}
                        onChange={(e) => {
                          setTaxSelect((val) => (val === "tds" ? "" : "tds"));
                          setSelectedTaxDetails({});
                          setTotal_Tax_Amount(0);
                        }}
                      />
                      <span className="absolute cursor-pointer inset-0 bg-[#9fccfa] rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] peer-focus:ring-2 peer-focus:ring-[#0974f1] peer-checked:bg-[#0974f1]"></span>
                      <span className="absolute top-0 left-0 h-8 w-8 bg-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center peer-checked:translate-x-[1.6em]"></span>
                    </label>
                  </div>
                  <div>TCS</div>
                  <div>
                    <label className="relative inline-block w-14 h-8">
                      <input
                        type="checkbox"
                        name="tcs"
                        className="sr-only peer"
                        checked={taxSelect === "tcs"}
                        onChange={(e) => {
                          setTaxSelect((val) => (val === "tcs" ? "" : "tcs"));
                          setSelectedTaxDetails({});
                          setTotal_Tax_Amount(0);
                        }}
                      />
                      <span className="absolute cursor-pointer inset-0 bg-[#9fccfa] rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] peer-focus:ring-2 peer-focus:ring-[#0974f1] peer-checked:bg-[#0974f1]"></span>
                      <span className="absolute top-0 left-0 h-8 w-8 bg-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center peer-checked:translate-x-[1.6em]"></span>
                    </label>
                  </div>
                  <div className="w-full">
                    <select
                      className="border p-2 rounded w-full"
                      value={formData.mode}
                      onChange={(e) =>
                        setFormData((val) => ({ ...val, mode: e.target.value }))
                      }
                    >
                      <option value="Cash">Cash</option>
                      <option value="Emi">Emi</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit/Debit Card">
                        Credit/Debit Card
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <div className="w-full flex ">
                  {taxSelect === "tds" && (
                    <select
                      className="border p-2 rounded w-full focus:outline-none"
                      defaultValue=""
                      onChange={onSelect_TDS_TCS}
                    >
                      <option value="" disabled>
                        Select {taxSelect.toUpperCase()} Option
                      </option>
                      {taxTypeOptions.tds.map((ele) => (
                        <option key={ele.id} value={ele.id}>
                          {ele.natureOfPayment} {ele.percentage}
                        </option>
                      ))}
                    </select>
                  )}
                  {taxSelect === "tcs" && (
                    <select
                      className="border p-2 rounded w-full focus:outline-none"
                      defaultValue=""
                      onChange={onSelect_TDS_TCS}
                    >
                      <option value="" disabled>
                        Select {taxSelect.toUpperCase()} Option
                      </option>
                      {taxTypeOptions.tcs.map((ele) => (
                        <option key={ele.id} value={ele.id}>
                          {ele.type_of_goods} {ele.tax}
                        </option>
                      ))}
                    </select>
                  )}
                  {(taxSelect === "tds" || taxSelect === "tcs") && (
                    <div className="border p-2 rounded w-1/5">
                      ₹ {total_Tax_Amount}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center mt-4 border-t pt-4 bg-gray-50 p-4 ">
              <div className="flex justify-between">
                <div className="flex space-x-3 items-center">
                  <div className=""> Extra Discount: </div>
                  <div>
                    <input
                      type="number"
                      className="border p-2 rounded"
                      value={formData?.extraDiscount || ""}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscount: +e.target.value || 0,
                        }));
                      }}
                    />
                    <select
                      className="border p-2 rounded"
                      value={formData?.extraDiscountType || "percentage"}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscountType: e.target.value,
                        }));
                      }}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>
                <div className=" p-6" style={{ width: "600px" }}>
                  {formData.shippingCharges > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Shipping Charges</span>
                      <span>₹ {formData.shippingCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.packagingCharges > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Packaging Charges</span>
                      <span>₹ {formData.packagingCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {taxSelect !== "" && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>{taxSelect.toUpperCase()}</span>
                      <span>₹ {total_Tax_Amount.toFixed(2)}</span>
                    </div>
                  )}

                  {totalAmounts.totalTaxableAmount > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Taxable Amount</span>
                      <span>
                        ₹ {totalAmounts.totalTaxableAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalAmounts.totalSgstAmount_2_5 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>SGST(2.5%)</span>
                      <span>
                        ₹ {totalAmounts.totalSgstAmount_2_5.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalAmounts.totalCgstAmount_2_5 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>CGST(2.5%)</span>
                      <span>
                        ₹ {totalAmounts.totalCgstAmount_2_5.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalAmounts.totalSgstAmount_6 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>SGST(6%)</span>
                      <span>₹ {totalAmounts.totalSgstAmount_6.toFixed(2)}</span>
                    </div>
                  )}
                  {totalAmounts.totalCgstAmount_6 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>CGST(6%)</span>
                      <span>₹ {totalAmounts.totalCgstAmount_6.toFixed(2)}</span>
                    </div>
                  )}
                  {totalAmounts.totalSgstAmount_9 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>SGST(9%)</span>
                      <span>₹ {totalAmounts.totalSgstAmount_9.toFixed(2)}</span>
                    </div>
                  )}
                  {totalAmounts.totalCgstAmount_9 > 0 && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>CGST(9%)</span>
                      <span>₹ {totalAmounts.totalCgstAmount_9.toFixed(2)}</span>
                    </div>
                  )}
                  {formData?.extraDiscount > 0 && isProductSelected && (
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Extra Discount Amount</span>
                      <span>
                        ₹{" "}
                        {formData.extraDiscountType === "percentage"
                          ? (+totalAmounts.totalAmount *
                              formData?.extraDiscount) /
                            100
                          : formData?.extraDiscount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl mb-2">
                    <span>Total Amount</span>
                    <span>₹ {calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <div className="flex gap-2">
            {/* <button className="border border-blue-500 text-blue-500 py-1 px-4 rounded-lg flex items-center gap-1">
              <span className="text-lg">+</span> Add to Product
            </button> */}
            <button
              className="bg-blue-500 text-white py-1 px-4 rounded-lg flex items-center gap-1"
              onClick={() => {
                {
                  products.length > 0 && isProductSelected
                    ? onSetInvoice()
                    : alert("Please select items to proceed.");
                }
              }}
            >
              <span className="text-lg">+</span> {invoiceId ? "Edit" : "Create"}{" "}
              Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetInvoice;
