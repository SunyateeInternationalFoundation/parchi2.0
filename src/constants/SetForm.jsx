import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import addItem from "../assets/addItem.png";
import CreateCustomer from "../components/Customers/CreateCustomer";
import { Calendar } from "../components/UI/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/UI/select";
import CreateVendor from "../components/Vendors/CreateVendor";
import { db } from "../firebase";
import { cn, formatDate } from "../lib/utils";
import SelectProductSide from "./SelectProductSide";
import tcsData from "./tcsData";
import tdsData from "./tdsData";

function SetForm(props) {
  const {
    formId,
    formName,
    formData,
    personDetails,
    setSelectedPersonData,
    setFormData,
    prefix,
    preFormList,
    onSetForm,
    companyDetails,
    userDetails,
    selectedPersonData,
    isVendor,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPersonDropdownVisible, setIsPersonDropdownVisible] = useState(false);
  const [personSuggestions, setPersonSuggestions] = useState(personDetails);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownVisible, setIsProductDropdownVisible] =
    useState(false);

  const purchaseList = ["Purchase", "PO", "DebitNote"];
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [isProductSelected, setIsProductSelected] = useState(false);
  const [books, setBooks] = useState([]);
  const [taxTypeOptions, setTaxTypeOptions] = useState({
    tds: [],
    tcs: [],
  });
  const [taxSelect, setTaxSelect] = useState("");
  const [total_Tax_Amount, setTotal_Tax_Amount] = useState(0);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedTaxDetails, setSelectedTaxDetails] = useState({});
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
  function onSelect_TDS_TCS(index) {
    let taxDetails = tcsData[index];
    if (taxSelect === "tds") {
      taxDetails = tdsData[index];
    } else {
      taxDetails = tcsData[index];
    }
    setSelectedTaxDetails(taxDetails);
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

  const handlePersonInputChange = (e) => {
    const value = e.target.value.trim();
    setSelectedPersonData({ name: value });
    setIsPersonDropdownVisible(true);
    if (value) {
      const filteredSuggestions = personDetails.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setPersonSuggestions(filteredSuggestions);
      setIsPersonDropdownVisible(true);
    } else {
      setPersonSuggestions(personDetails);
    }
  };

  function onSelectWarehouse(value) {
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

  const calculateTotal = () => {
    const discountAmount = formData.extraDiscountType
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

  useEffect(() => {
    setPersonSuggestions(personDetails);
  }, [personDetails]);

  function addActionQty() {
    if (formData?.products?.length === 0 || products.length === 0 || !formId) {
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
          if (isVendor) {
            pro.quantity -= ele.quantity;
          } else {
            pro.quantity += ele.quantity;
          }

          pro.totalAmount = ele.quantity * pro.netAmount;
        }
        return pro;
      });
    }
    setProducts(productData);
    calculateProduct(productData);
  }
  useEffect(() => {
    addActionQty();
  }, [formData.products]);

  useEffect(() => {
    if (selectedCategory === "all" && productSearch === "") {
      setProductSuggestions(products);
      return;
    }
    const filteredSuggestions = products.filter((item) => {
      return (
        item.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        item.category === selectedCategory
      );
    });
    setProductSuggestions(filteredSuggestions);
  }, [productSearch, selectedCategory]);

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

  function handleActionQty(op, productId) {
    let countOfSelect = 0;
    let updatedProducts = products.map((product) => {
      if (product.id === productId) {
        if (op === "+") {
          if (product.quantity > product.actionQty) {
            ++product.actionQty;
          }
          if (purchaseList.includes(formName)) {
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

  function onChangeDiscount(value, name, id) {
    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        product[name] = value;
        return ModifiedProductData(product);
      }
      return product;
    });
    setProducts(updatedProducts);
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

  function onSelectBook(value) {
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
        const temp = {
          id: doc.id,
          category: data.category,
          description: data.description ?? "",
          name: data.name ?? "N/A",
          quantity: data.stock ?? 0,
          sellingPrice: data.sellingPrice ?? 0,
          sellingPriceTaxType: data.sellingPriceTaxType,
          purchasePrice: data.purchasePrice ?? 0,
          purchasePriceTaxType: data.purchasePriceTaxType,
          discount: data.discount ?? 0,
          discountType: data.discountType,
          isAddDescription: false,
          actionQty: 0,
          tax: data.tax,
          totalAmount: 0,
        };
        return ModifiedProductData(temp);
      });
      console.log("🚀 ~ productList:", productsData);

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching forms:", error);
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
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchBooks();
    fetchWarehouse();
    fetchTax();
  }, [companyDetails.companyId, userDetails.selectedDashboard]);

  useEffect(() => {
    total_TCS_TDS_Amount();
  }, [products, selectedTaxDetails]);

  function customActionQty(value, productId, isDelete = false) {
    if (!value && !isDelete) {
      return;
    }
    let updatedProducts = products.map((product) => {
      if (product.id === productId) {
        if (product.quantity >= value || purchaseList.includes(formName)) {
          product.actionQty = value;
        }
        product.totalAmount = product.netAmount * product.actionQty;
      }
      return product;
    });
    calculateProduct(updatedProducts);
  }
  function ModifiedProductData(data) {
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
    const totalAmount = data.actionQty * netAmount;
    return {
      ...data,
      netAmount: netAmount,
      sgst,
      cgst,
      sgstAmount,
      cgstAmount,
      taxAmount,
      totalAmount,
    };
  }
  function onSubmit() {
    // const tcs = {
    //   isTcsApplicable: Boolean(taxSelect === "tcs"),
    //   tax: taxSelect === "tcs" ? selectedTaxDetails.tax : "",
    //   tax_value: taxSelect === "tcs" ? selectedTaxDetails.tax_value : 0,
    //   type_of_goods:
    //     taxSelect === "tcs" ? selectedTaxDetails.type_of_goods : "",
    //   tcs_amount: taxSelect === "tcs" ? total_Tax_Amount : 0,
    // };

    // const tds = {
    //   isTdsApplicable: Boolean(taxSelect === "tds"),
    //   natureOfPayment:
    //     taxSelect === "tds" ? selectedTaxDetails.natureOfPayment : "",
    //   percentage: taxSelect === "tds" ? selectedTaxDetails.percentage : 0,
    //   percentageValue:
    //     taxSelect === "tds" ? selectedTaxDetails.percentageValue : "",
    //   tdsSection: taxSelect === "tds" ? selectedTaxDetails.tdsSection : "",
    //   tds_amount: taxSelect === "tds" ? total_Tax_Amount : 0,
    // };

    const payload = {
      // tds,
      // tcs,
      products,
      total: +calculateTotal(),
    };
    if (!selectedPersonData.id) {
      alert("Please select a Person");
      return;
    }
    onSetForm(payload);
  }
  return (
    <div className="bg-gray-100 overflow-y-auto" style={{ height: "92vh" }}>
      <div className="px-5 pb-5">
        <header className="flex items-center space-x-3  my-2">
          <Link className="flex items-center" to={"./../"}>
            <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
          </Link>
          <h1 className="text-2xl font-bold">
            {formId ? "Edit" : "Create"} {formName}
          </h1>
        </header>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex gap-8 mb-6">
            <div className="flex-1">
              <h2 className="font-semibold mb-2">
                {isVendor ? "Vendor" : "Customer"} Details
              </h2>
              <div className="border p-3 rounded-lg">
                <label className="text-sm text-gray-600">
                  Select {isVendor ? "Vendor" : "Customer"}
                  <span className="text-red-500">*</span>
                </label>
                <div className=" flex">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search ... "
                      className="text-base text-gray-900 font-semibold border  rounded-s-md w-full mt-1 px-5  py-2"
                      value={selectedPersonData?.name}
                      onChange={handlePersonInputChange}
                      onFocus={() => {
                        setIsPersonDropdownVisible(true);
                        setPersonSuggestions(personDetails || []);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          if (!selectedPersonData.id) {
                            setSelectedPersonData({ name: "" });
                          }
                          setIsPersonDropdownVisible(false);
                        }, 200);
                      }}
                      required
                    />
                    {isPersonDropdownVisible &&
                      personSuggestions.length > 0 && (
                        <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto w-full">
                          {personSuggestions.map((item) => (
                            <div
                              key={item.id}
                              onMouseDown={() => {
                                setSelectedPersonData(item);
                                setIsPersonDropdownVisible(false);
                              }}
                              className="flex flex-col px-4 py-2 text-gray-800 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out"
                            >
                              <span className="font-medium text-sm">
                                Name:
                                <span className="font-semibold">
                                  {item.name}
                                </span>
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
              <h2 className="font-semibold mb-2">{formName} Details</h2>
              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-3 rounded-lg">
                <div>
                  <label className="text-sm text-gray-600">
                    {formName} Date <span className="text-red-500">*</span>
                  </label>

                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !formData.date?.seconds && "text-muted-foreground"
                          )}
                        >
                          {formData.date?.seconds ? (
                            formatDate(
                              new Date(
                                formData.date?.seconds * 1000 +
                                  formData.date?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span className="text-gray-600">Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              formData.date?.seconds * 1000 +
                                formData.date?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setFormData((pre) => ({
                              ...pre,
                              date: Timestamp.fromDate(new Date(val)),
                            }));
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between   items-center input-tag ",
                            !formData.dueDate?.seconds &&
                              "text-muted-foreground"
                          )}
                        >
                          {formData.dueDate?.seconds ? (
                            formatDate(
                              new Date(
                                formData.dueDate?.seconds * 1000 +
                                  formData.dueDate?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span>Due Date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              formData.dueDate?.seconds * 1000 +
                                formData.dueDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              dueDate: Timestamp.fromDate(new Date(val)),
                            }));
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    {formName} No. <span className="text-red-500">*</span>
                    {preFormList.includes(formData.no) && (
                      <span className="text-red-800 text-xs">
                        &quot;Already {formName} No. exist&quot;
                      </span>
                    )}
                    {Number(formData.no) == 0 && (
                      <span className="text-red-800 text-xs">
                        &quot;Kindly Enter valid {formName} No.&quot;
                      </span>
                    )}
                  </label>
                  <div className="flex items-center">
                    <span className="px-4 py-1 mt-1 border rounded-l-md text-gray-700 flex-grow  px-5  py-2">
                      {prefix}
                    </span>
                    <input
                      type="text"
                      placeholder="Enter {formName}  No. "
                      className="border p-1 rounded-r-md w-full mt-1 flex-grow  px-5  py-2"
                      value={formData.no}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((val) => ({
                          ...val,
                          no: value,
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
                <div className=" w-1/4">
                  <Select
                    value={selectedCategory ?? "all"}
                    onValueChange={(val) => {
                      setSelectedCategory(val);
                    }}
                  >
                    <SelectTrigger>
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
                        val.length > 0 ? val : products
                      );
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsProductDropdownVisible(false);
                      }, 200);
                    }}
                  />
                  {isProductDropdownVisible &&
                    productSuggestions.length > 0 && (
                      <div className="absolute z-20 bg-white border border-gray-300 rounded-b-lg shadow-md max-h-60 overflow-y-auto w-1/2">
                        {productSuggestions.map((product) => (
                          <div
                            key={product.id}
                            onMouseDown={() => handleActionQty("+", product.id)}
                            className="flex flex-col   text-gray-800 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out"
                          >
                            <div className="font-medium text-sm border-b px-4 py-2">
                              <div className="font-semibold">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 space-x-2">
                                <span>Qty- {product.quantity}</span>
                                <span>Price -{product.sellingPrice}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
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
                <table className="min-w-full text-center text-gray-500 font-semibold rounded-md table-fixed">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className=" px-4 py-3 text-gray-500 font-semibold text-start">
                        Product Name
                      </th>
                      <th className=" px-4 py-3 text-gray-500 font-semibold">
                        Unit Price
                      </th>
                      <th className=" px-4 py-3 text-gray-500 font-semibold">
                        Discount
                      </th>
                      <th className=" px-4 py-3 text-gray-500 font-semibold">
                        Net Amount
                      </th>
                      <th className=" px-4 py-3 text-gray-500 font-semibold">
                        Tax
                      </th>
                      <th className=" px-4 py-3 text-gray-500 font-semibold">
                        Total Amount
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
                                        const updatedProducts = products.map(
                                          (ele) => {
                                            if (ele.id == product.id) {
                                              ele.isAddDescription = true;
                                            }
                                            return ele;
                                          }
                                        );
                                        setProducts(updatedProducts);
                                      }}
                                    >
                                      + Add Description
                                    </button>
                                  ) : (
                                    <div>
                                      <input
                                        type="text"
                                        defaultValue={product.description}
                                        className="border rounded-md px-2 py-1"
                                        onBlur={(e) => {
                                          const updatedProducts = products.map(
                                            (ele) => {
                                              if (ele.id == product.id) {
                                                ele.description =
                                                  e.target.value;
                                              }
                                              return ele;
                                            }
                                          );
                                          setProducts(updatedProducts);
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
                              <td className="w-32">
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    defaultValue={product.discount.toFixed(2)}
                                    className="border w-full rounded-s-md p-2"
                                    onChange={(e) =>
                                      onChangeDiscount(
                                        +e.target.value,
                                        "discount",
                                        product.id
                                      )
                                    }
                                  />
                                  <select
                                    className="border w-fit rounded-e-md p-2"
                                    name="discountType"
                                    value={product.discountType}
                                    onChange={(e) =>
                                      onChangeDiscount(
                                        e.target.value === "true"
                                          ? true
                                          : false,
                                        "discountType",
                                        product.id
                                      )
                                    }
                                  >
                                    <option value="true">%</option>
                                    <option value="false">₹</option>
                                  </select>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                ₹{product.netAmount.toFixed(2)}
                              </td>
                              <td className="px-2 py-2">
                                {/* {product.sellingPriceTaxType ? "Yes" : "No"} */}
                                {product.tax}%
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

                          <div>No Products added to the {formName} </div>
                          <button
                            className=" bg-[#442799] text-white text-center w-48  px-3 py-2 pt-1 font-semibold rounded-md"
                            onClick={() => setIsSidebarOpen(true)}
                          >
                            <div>Choose Products</div>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg  mb-6">
            <div className="pb-3 font-semibold">Shipping & Banking Details</div>
            <div className="w-full pt-4 bg-white p-4 rounded-lg">
              <div className="w-full grid grid-cols-3 gap-4">
                <div className="w-full text-gray-500 space-y-2">
                  <div>Shipping From</div>
                  <Select
                    value={formData?.warehouse?.warehouseRef?.id || ""}
                    onValueChange={(val) => {
                      onSelectWarehouse(val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=" Select WareHouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem value={warehouse.id} key={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full text-gray-500 space-y-2">
                  <div>Bank/Book</div>
                  <Select
                    value={formData?.book?.bookRef?.id || ""}
                    onValueChange={(val) => {
                      onSelectBook(val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=" Select book" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem value={book.id} key={book.id}>
                          {`${book.name} - ${book.bankName} - ${book.branch}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full text-gray-500 space-y-2">
                  <div>Sign</div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder=" Select Sign" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {books.map((book) => (
                        <SelectItem value={book.id} key={book.id}>
                          {`${book.name} - ${book.bankName} - ${book.branch}`}
                        </SelectItem>
                      ))} */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full text-gray-500 space-y-2 ">
                  <div>Attach Files</div>
                  <input
                    type="file"
                    className="flex h-12  w-full rounded-md border border-input
                bg-white px-3 py-3 text-sm text-gray-400 file:border-0
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
                    className="input-tag w-full"
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
                    className="input-tag w-full"
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
                    <Select
                      value={formData?.mode || ""}
                      onValueChange={(value) => {
                        setFormData((val) => ({ ...val, mode: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder=" Select Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Cash",
                          "Emi",
                          "Cheque",
                          "Net Banking",
                          "Credit/Debit Card",
                        ].map((ele) => (
                          <SelectItem value={ele} key={ele}>
                            {ele}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <div className="w-full flex ">
                  {taxSelect === "tds" && (
                    // <Select onValueChange={onSelect_TDS_TCS}>
                    <Select>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select ${taxSelect.toUpperCase()} Option`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tdsData.map((ele, index) => (
                          <SelectItem key={index} value={index}>
                            <span className="font-semibold">
                              {ele.rate}% - {ele.code}
                            </span>
                            <span> - {ele.description}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {taxSelect === "tcs" && (
                    // <Select onValueChange={onSelect_TDS_TCS}>
                    <Select>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select ${taxSelect.toUpperCase()} Option`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tcsData.map((ele, index) => (
                          <SelectItem key={index} value={index}>
                            <span className="font-semibold">
                              {ele.rate}% - {ele.code}
                            </span>
                            <span> - {ele.description}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          <div className=" mt-4">
            <div className="flex justify-between space-x-8">
              <div className="w-full bg-zinc-50 p-5 rounded-lg">
                <div className="w-full text-gray-500 space-y-2 ">
                  <div className="font-semibold">Notes</div>
                  <textarea
                    type="text"
                    value={formData.notes}
                    placeholder="Notes"
                    className="input-tag w-full max-h-24 min-h-24 resize-none"
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
                    className="input-tag w-full max-h-24 min-h-24 resize-none "
                    onChange={(e) => {
                      setFormData((val) => ({
                        ...val,
                        terms: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              <div
                className="p-8 bg-blue-50 rounded-lg"
                style={{ width: "700px" }}
              >
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
                  <span>Extra Discount</span>
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
                      value={formData?.extraDiscountType}
                      onChange={(e) => {
                        setFormData((val) => ({
                          ...val,
                          extraDiscountType:
                            e.target.value == "true" ? true : false,
                        }));
                      }}
                    >
                      <option value="true">%</option>
                      <option value="false">₹</option>
                    </select>
                  </div>
                </div>
                {/* )} */}
                <div className="flex justify-between font-bold text-xl mb-2 border-t pt-2">
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
          className="rounded-lg  bg-[#442799] text-white text-center   px-5 py-3 pt-2 font-semibold rounded-md"
          onClick={() => {
            {
              products.length > 0 && isProductSelected
                ? onSubmit()
                : alert("Please select items to proceed.");
            }
          }}
        >
          <span className="text-lg">+</span> {formId ? "Edit " : "Create "}
          {formName}
        </button>
      </div>

      {isSidebarOpen && (
        <SelectProductSide
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          productList={products}
          handleActionQty={handleActionQty}
          totalAmount={+totalAmounts.totalAmount}
          customActionQty={customActionQty}
          categories={categories}
          setProductsData={setProducts}
          from={formName}
        />
      )}
      {isVendor ? (
        <CreateVendor
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      ) : (
        <CreateCustomer
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
SetForm.propTypes = {
  formId: PropTypes.string,
  formName: PropTypes.string,
  formData: PropTypes.object,
  personDetails: PropTypes.array,
  setSelectedPersonData: PropTypes.func,
  setFormData: PropTypes.func,
  prefix: PropTypes.string,
  preFormList: PropTypes.array,
  onSetForm: PropTypes.func,
  companyDetails: PropTypes.object,
  userDetails: PropTypes.object,
  selectedPersonData: PropTypes.object,
  isVendor: PropTypes.bool,
};
export default SetForm;
