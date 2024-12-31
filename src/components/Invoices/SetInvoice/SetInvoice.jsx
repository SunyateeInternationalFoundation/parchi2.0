import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import addItem from "../../../assets/addItem.png";
import { db } from "../../../firebase";
import { setAllCustomersDetails } from "../../../store/CustomerSlice";
import CreateCustomer from "../../Customers/CreateCustomer";
import Sidebar from "./Sidebar";
const SetInvoice = () => {
  const { invoiceId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userDetails = useSelector((state) => state.users);
  const customersDetails = useSelector((state) => state.customers).data;
  const dispatch = useDispatch();
  // let companyDetails;
  // if (!companyDetail) {
  //   companyDetails = userDetails.companies[userDetails.selectedCompanyIndex];
  // } else {
  //   companyDetails = companyDetail;
  // }
  let companyDetails;
  if (userDetails.selectedDashboard === "staff") {
    companyDetails =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails;
  } else {
    companyDetails = userDetails.companies[userDetails.selectedCompanyIndex];
  }

  const phoneNo = userDetails.phone;
  const [prefix, setPrefix] = useState("");
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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

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
            pro.description = ele.description;
            pro.isAddDescription = ele.description ? true : false;
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
      const invoicesRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "invoices"
      );
      const q = query(invoicesRef, orderBy("invoiceNo", "asc"));
      const querySnapshot = await getDocs(q);
      const noList = querySnapshot.docs.map((doc) => {
        const no = doc.data().invoiceNo;
        return no;
      });
      if (invoiceId) {
        setPreInvoiceList(noList.filter((ele) => ele !== formData.invoiceNo));
      } else {
        setPreInvoiceList(noList);
        setFormData((val) => ({
          ...val,
          invoiceNo: String(+noList[noList.length - 1] + 1).padStart(4, 0),
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
    const fetchPrefix = async () => {
      try {
        const companyDocRef = doc(db, "companies", companyDetails.companyId);
        const companySnapshot = await getDoc(companyDocRef);

        if (companySnapshot.exists()) {
          const companyData = companySnapshot.data();
          setPrefix(companyData.prefix.invoice || "INV");
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
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

          const sgst = taxRate / 2;
          const cgst = taxRate / 2;
          const taxAmount = netAmount * (taxRate / 100);
          const sgstAmount = netAmount * (sgst / 100);
          const cgstAmount = netAmount * (cgst / 100);

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
            isAddDescription: false,
          };
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
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
    fetchCategories();
    if (!invoiceId) {
      fetchInvoiceNumbers();
    }
    fetchPrefix();
    fetchProducts();
    fetchBooks();
    fetchWarehouse();
    fetchInvoiceData();
    fetchTax();
    customerDetails();
  }, [companyDetails.companyId, userDetails.selectedDashboard]);

  const handleInputChange = (e) => {
    const value = e.target.value.trim();
    setSelectedCustomerData({ name: value });
    setIsDropdownVisible(true);
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
  }
  function customActionQty(value, productId, isDelete = false) {
    if (!value && !isDelete) {
      return;
    }
    let updatedProducts = products.map((product) => {
      if (product.id === productId) {
        if (product.quantity > value) {
          product.actionQty = value;
        }
        product.totalAmount = product.netAmount * product.actionQty;
      }
      return product;
    });
    calculateProduct(updatedProducts);
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
      const baseCreatedBy = {
        companyRef: companyRef,
        name: companyDetails.name,
        address: companyDetails.address ?? "",
        city: companyDetails.city ?? "",
        zipCode: companyDetails.zipCode ?? "",
        phoneNo: phoneNo,
      };

      const createdBy = invoiceId
        ? { ...baseCreatedBy, who: formData.createdBy.who }
        : {
            ...baseCreatedBy,
            who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
          };
      const payload = {
        ...formData,
        prefix,
        tds,
        tcs,
        date,
        dueDate,
        createdBy,
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
      navigate("./../");
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
    <div className="bg-gray-100 overflow-y-auto" style={{ height: "92vh" }}>
      <div className="px-5 pb-5s">
        <header className="flex items-center space-x-3  my-2">
          <Link className="flex items-center" to={"./../"}>
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
              <div className="border p-3 rounded-lg">
                <label className="text-sm text-gray-600">
                  Select Customer <span className="text-red-500">*</span>{" "}
                </label>
                <div className=" flex">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search your Customers, Company Name, GSTIN... "
                      className="text-base text-gray-900 font-semibold border  rounded-s-md w-full mt-1 px-5  py-2"
                      value={selectedCustomerData?.name}
                      onChange={handleInputChange}
                      onFocus={() => {
                        setIsDropdownVisible(true);
                        setSuggestions(customersDetails || []);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          if (!selectedCustomerData.id) {
                            setSelectedCustomerData({ name: "" });
                          }
                          setIsDropdownVisible(false);
                        }, 200);
                      }}
                      required
                    />
                    {isDropdownVisible && suggestions.length > 0 && (
                      <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto w-full">
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            onMouseDown={() => handleSelectCustomer(item)}
                            className="flex flex-col px-4 py-2 text-gray-800 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out"
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
                  <div className="w-1/4">
                    <button
                      className="text-base text-gray-500 font-semibold border  rounded-e-md w-full mt-1 px-5  py-2"
                      onClick={() => setIsModalOpen(true)}
                    >
                      + New
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="font-semibold mb-2">Invoice Details</h2>
              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-3 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={DateFormate(date)}
                    className="border p-1 rounded-md w-full mt-1  px-5  py-2"
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
                    className="border p-1 rounded-md w-full mt-1  px-5  py-2"
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
                  <div className="flex items-center">
                    <span className="px-4 py-1 mt-1 border rounded-l-md text-gray-700 flex-grow  px-5  py-2">
                      {prefix}
                    </span>
                    <input
                      type="text"
                      placeholder="Enter Invoice No. "
                      className="border p-1 rounded-r-md w-full mt-1 flex-grow  px-5  py-2"
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
          </div>

          <div className="bg-violet-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold mb-2">Products Details</h2>
            <div className="flex justify-between items-center mb-4 space-x-3">
              <div className="flex  items-center w-full">
                <select
                  className="w-1/4 rounded-s-md py-3 bg-gray-200 px-3 border-r-2"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value={""}>All Categories</option>
                  {categories.map((ele) => (
                    <option key={ele} value={ele}>
                      {ele}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="w-1/2 rounded-e-md py-3 px-3"
                  placeholder="Search..."
                  // onChange={(e) => {}}
                />
              </div>
              <button
                className="bg-[#442799] text-white text-center w-48  px-5 py-3 pt-2 font-semibold rounded-md"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="text-2xl">+</span> Add Items
              </button>
            </div>

            <div className="bg-white border-2 rounded-md overflow-hidden">
              <div className="mb-4 rounded-md">
                <table className="min-w-full text-center text-gray-500 font-semibold rounded-md ">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-1 text-gray-500 font-semibold text-start">
                        Product Name
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Unit Price
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Discount
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Net Amount
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Tax
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Total Amount
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Quantity
                      </th>
                      <th className="px-4 py-1 text-gray-500 font-semibold">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 && isProductSelected ? (
                      products.map(
                        (product) =>
                          product.actionQty > 0 && (
                            <tr key={product.id} className="text-black">
                              <td className="px-4 py-2 text-start space-y-2">
                                <div>{product.name}</div>
                                <div className="text-xs text-gray-400">
                                  {!product.isAddDescription ? (
                                    <button
                                      className="border-2 rounded-md px-2 py-1"
                                      onClick={() => {
                                        setProducts(
                                          products.map((ele) => {
                                            if (ele.id == product.id) {
                                              ele.isAddDescription = true;
                                            }
                                            return ele;
                                          })
                                        );
                                      }}
                                    >
                                      + Add Description
                                    </button>
                                  ) : (
                                    <div>
                                      <input
                                        type="text"
                                        value={product.description}
                                        className="border  rounded-md px-2 py-1"
                                        onBlur={(e) => {
                                          setProducts(
                                            products.map((ele) => {
                                              if (ele.id == product.id) {
                                                ele.description =
                                                  e.target.value;
                                              }
                                              return ele;
                                            })
                                          );
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              {/* <td className="px-4 py-2">{product.quantity}</td> */}
                              <td className="px-4 py-2">
                                ₹{product.sellingPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-2">
                                ₹ &nbsp;
                                <input
                                  type="text"
                                  defaultValue={product.discount.toFixed(2)}
                                  className="border-2 w-1/4 rounded-md px-2"
                                />
                              </td>
                              <td className="px-4 py-2">
                                ₹{product.netAmount.toFixed(2)}
                              </td>
                              <td className="px-2 py-2">
                                {/* {product.sellingPriceTaxType ? "Yes" : "No"} */}
                                {product.tax}%{" "}
                                <span className="text-xs">
                                  ({product.taxAmount.toFixed(2)})
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                ₹{product.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-1 py-2 space-x-1">
                                {product.actionQty >= 1 && (
                                  <>
                                    <button
                                      className="bg-blue-500 text-white rounded w-1/4 "
                                      onClick={() =>
                                        handleActionQty("-", product.id)
                                      }
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      value={product.actionQty}
                                      onChange={(e) => {
                                        const { value } = e.target;
                                        customActionQty(+value, product.id);
                                      }}
                                      className="border rounded-md text-sm w-10 px-2 py-1 text-center"
                                    />
                                  </>
                                )}
                                <button
                                  className="bg-blue-500 text-white  rounded w-1/4 "
                                  onClick={() =>
                                    handleActionQty("+", product.id)
                                  }
                                  disabled={product.quantity === 0}
                                >
                                  +
                                </button>
                              </td>
                              <td className=" text-red-600">
                                <div
                                  className="flex item-center justify-center"
                                  onClick={() =>
                                    customActionQty(0, product.id, true)
                                  }
                                >
                                  <RiDeleteBin6Line />
                                </div>
                              </td>
                            </tr>
                          )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-10 text-center space-y-3  w-full"
                        >
                          <div className="w-full flex justify-center">
                            <img
                              src={addItem}
                              alt="add Item"
                              className="w-24 h-24"
                            />
                          </div>

                          <div>No Products added to the Invoice</div>
                          <button
                            className=" bg-[#442799] text-white text-center w-48  px-3 py-2 pt-1 font-semibold rounded-md"
                            onClick={() => setIsSidebarOpen(true)}
                          >
                            <div>Choose Products</div>
                          </button>
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
                    customActionQty={customActionQty}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg  mb-6">
            <div className="pb-3 font-semibold">Shipping & Banking Details</div>
            <div className="w-full pt-4 bg-white p-4 rounded-lg">
              <div className="w-full grid grid-cols-3 gap-4">
                <div className="w-full text-gray-500 space-y-2">
                  <div>Shipping From</div>
                  <select
                    value={formData?.warehouse?.warehouseRef?.id || ""}
                    onChange={onSelectWarehouse}
                    className="border p-2 rounded-md w-full"
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
                <div className="w-full text-gray-500 space-y-2">
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
                <div className="w-full text-gray-500 space-y-2">
                  <div>Sign</div>
                  <select
                    value=""
                    onChange={() => {}}
                    className="border p-2 rounded-md w-full"
                  >
                    <option value="" disabled>
                      Select Sign
                    </option>
                  </select>
                </div>
                <div className="w-full text-gray-500 space-y-2 ">
                  <div>Attach Files</div>
                  <input
                    type="file"
                    className="flex h-10 w-full rounded-md border border-input
                  bg-white px-3 py-2 text-sm text-gray-400 file:border-0
                  file:bg-transparent file:text-gray-600 file:text-sm
                  file:font-medium"
                  />
                </div>
                <div className="w-full text-gray-500 space-y-2 ">
                  <div>Shipping Charges</div>
                  <input
                    type="number"
                    value={formData.shippingCharges || ""}
                    placeholder="Shipping Charges"
                    className="border p-2 rounded-md w-full"
                    min={0}
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        shippingCharges: +e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full text-gray-500 space-y-2 ">
                  <div>Packaging Charges</div>
                  <input
                    type="number"
                    value={formData.packagingCharges || ""}
                    placeholder="Packaging Charges"
                    className="border p-2 rounded-md w-full"
                    min={0}
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        packagingCharges: +e.target.value,
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
          </div>
          <div className=" mt-4   p-4 ">
            <div className="flex justify-between">
              <div className="w-full">
                <div className="w-full text-gray-500 space-y-2 ">
                  <div className="font-semibold">Notes</div>
                  <textarea
                    type="text"
                    value={formData.notes}
                    placeholder="Notes"
                    className="border p-2 rounded-md w-full max-h-24 min-h-24 resize-none"
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        notes: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="w-full text-gray-500 space-y-2 ">
                  <div className="font-semibold">Terms</div>
                  <textarea
                    type="text"
                    value={formData.terms}
                    className="border p-2 rounded-md w-full max-h-24 min-h-24 resize-none "
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        terms: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="p-6" style={{ width: "700px" }}>
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
                    <span>₹ {totalAmounts.totalTaxableAmount.toFixed(2)}</span>
                  </div>
                )}
                {totalAmounts.totalSgstAmount_2_5 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(2.5%)</span>
                    <span>₹ {totalAmounts.totalSgstAmount_2_5.toFixed(2)}</span>
                  </div>
                )}
                {totalAmounts.totalCgstAmount_2_5 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(2.5%)</span>
                    <span>₹ {totalAmounts.totalCgstAmount_2_5.toFixed(2)}</span>
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
                {/* {formData?.extraDiscount > 0 && isProductSelected && ( */}
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Extra Discount Amount</span>
                  {/* <span>
                    ₹{" "}
                    {formData.extraDiscountType === "percentage"
                      ? (
                          (+totalAmounts.totalAmount *
                            formData?.extraDiscount) /
                          100
                        ).toFixed(2)
                      : formData?.extraDiscount}
                  </span> */}
                  <div>
                    <input
                      type="number"
                      className="border px-2 py-1 rounded-s-md w-20 focus:outline-none text-sm"
                      defaultValue={formData?.extraDiscount || 0}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscount: +e.target.value || 0,
                        }));
                      }}
                    />
                    <select
                      className="border px-2 rounded-e-md text-sm py-1"
                      value={formData?.extraDiscountType || "percentage"}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscountType: e.target.value,
                        }));
                      }}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                  </div>
                </div>
                {/* )} */}
                <div className="flex justify-between font-bold text-xl mb-2">
                  <span>Total Amount</span>
                  <span>₹ {calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end sticky bottom-0 bg-white p-2 pe-10 border-t mt-5">
        <button
          className=" py-1 px-4 rounded-lg flex items-center gap-1 bg-[#442799] text-white text-center w-48  px-5 py-3 pt-2 font-semibold rounded-md"
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

      <CreateCustomer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default SetInvoice;
