import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
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
import { db, storage } from "../firebase";
import { cn, formatDate } from "../lib/utils";
import SelectProductSide from "./SelectProductSide";
import tcsData from "./tcsData";
import tdsData from "./tdsData";

function SetForm(props) {
  const navigate = useNavigate();
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
  const [isSignOpen, setIsSignOpen] = useState(false);
  const signDropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (signDropdownRef.current && !signDropdownRef.current.contains(event.target)) {
        setIsSignOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [isPersonDropdownVisible, setIsPersonDropdownVisible] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownVisible, setIsProductDropdownVisible] =
    useState(false);
  const [isProductSelected, setIsProductSelected] = useState(false);

  const purchaseList = ["Purchase", "PO", "DebitNote"];

  const [productSuggestions, setProductSuggestions] = useState([]);
  const [personSuggestions, setPersonSuggestions] = useState(personDetails);

  const [products, setProducts] = useState([]);
  const [attachFiles, setAttachFiles] = useState(formData.attachments || []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [taxSelect, setTaxSelect] = useState("");
  const [total_Tax_Amount, setTotal_Tax_Amount] = useState(0);
  const [selectedTaxDetails, setSelectedTaxDetails] = useState({});

  const [totalGSTAmounts, setTotalGSTAmounts] = useState({
    totalTaxableAmount: 0,
    totalSgstAmount_2_5: 0,
    totalCgstAmount_2_5: 0,
    totalSgstAmount_6: 0,
    totalCgstAmount_6: 0,
    totalSgstAmount_9: 0,
    totalCgstAmount_9: 0,
    totalAmount: 0,
  });

  const [SignImagesList, setSignImagesList] = useState([]);

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
      ? (+totalGSTAmounts.totalAmount * formData.extraDiscount) / 100
      : formData.extraDiscount || 0;

    const total =
      totalGSTAmounts.totalAmount +
      formData.shippingCharges +
      formData.packagingCharges -
      (isProductSelected ? discountAmount : 0);
    setTotalAmount(total);
  };

  useEffect(() => {
    setAttachFiles(formData.attachments);
    setPersonSuggestions(personDetails);
  }, [personDetails, formData.attachments]);

  function addActionQty() {
    if (!formData?.products?.length || !products.length || !formId) {
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

          pro.totalAmount = (pro.netAmount + pro.taxAmount) * ele.quantity;
        }
        return pro;
      });
    }
    setProducts(productData);
    calculateProduct(productData);
  }

  function total_TCS_TDS_Amount() {
    if (taxSelect === "" || !selectedTaxDetails.rate || totalAmount === 0) {
      return;
    }

    const rate = selectedTaxDetails.rate;
    let amount = totalAmount;
    if (taxSelect == "tcs" && !selectedTaxDetails?.isTotalAmount) {
      const discountAmount = formData.extraDiscountType
        ? (+totalGSTAmounts.totalAmount * formData.extraDiscount) / 100
        : formData.extraDiscount || 0;

      amount =
        totalGSTAmounts?.totalTaxableAmount +
        discountAmount +
        (formData?.shippingCharges || 0) +
        (formData?.packagingCharges || 0);
    }

    const totalTaxAmount = (rate / 100) * amount;
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
          else if (purchaseList.includes(formName)) {
            ++product.actionQty;
          }
        } else {
          if (0 < product.actionQty) {
            --product.actionQty;
          }
        }
        product.actionQty = Math.max(product.actionQty, 0); // Prevent negative quantity
        // Calculate total amount for each product based on quantity
        product.totalAmount =
          (product.netAmount + product.taxAmount) * product.actionQty;
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
    const totalWithoutTaxableAmount = products.reduce((sum, product) => {
      return (sum += product.netAmount * product.actionQty);
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
      totalWithoutTaxableAmount +
      totalSgstAmount_2_5 +
      totalCgstAmount_2_5 +
      totalSgstAmount_6 +
      totalCgstAmount_6 +
      totalSgstAmount_9 +
      totalCgstAmount_9;

    setProducts(products);
    setTotalGSTAmounts({
      totalTaxableAmount: totalWithoutTaxableAmount,
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

  function customActionQty(value, productId, isDelete = false) {
    if (!value && !isDelete) {
      return;
    }
    let updatedProducts = products.map((product) => {
      if (product.id === productId) {
        if (product.quantity >= value || purchaseList.includes(formName)) {
          product.actionQty = value;
        }
        product.totalAmount =
          (product.netAmount + product.taxAmount) * product.actionQty;
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
    let netAmount = +data.sellingPrice - discount;
    const taxRate = data.tax || 0;
    const sgst = taxRate / 2;
    const cgst = taxRate / 2;

    let taxAmount = netAmount - netAmount * (100 / (100 + taxRate));
    if (!data.sellingPriceTaxType) {
      taxAmount = (netAmount * taxRate) / 100;
    }

    const sgstAmount = taxAmount / 2;
    const cgstAmount = taxAmount / 2;

    let totalAmount = data.actionQty * netAmount;

    if (data.sellingPriceTaxType) {
      netAmount = netAmount - taxAmount;
    } else {
      totalAmount = data.actionQty * (netAmount + taxAmount);
    }

    return {
      ...data,
      netAmount,
      sgst,
      cgst,
      sgstAmount,
      cgstAmount,
      taxAmount,
      totalAmount,
    };
  }

  async function fetchSign() {
    try {
      const signRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "signs"
      );
      const q = query(signRef, orderBy("createdAt", "desc"));
      const getDocsList = await getDocs(q);
      const signData = getDocsList.docs.map((doc) => {
        const { name, url } = doc.data();
        return { id: doc.id, name, url };
      });
      setSignImagesList(signData);
    } catch (error) {
      console.log("🚀 ~ fetchSign ~ error:", error);
    }
  }

  async function uploadSign(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file.name) {
      return;
    }
    try {
      const storageRef = ref(storage, `signImages/${file.name}`);
      await uploadBytes(storageRef, file);
      const productImageUrl = await getDownloadURL(storageRef);
      const payload = {
        name: file.name,
        url: productImageUrl,
        createdAt: Timestamp.fromDate(new Date()),
        who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
      };

      const signRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "signs"
      );

      const newSign = await addDoc(signRef, payload);
      setSignImagesList((val) => [
        { id: newSign.id, name: payload.name, url: payload.url },
        ...val,
      ]);
    } catch (error) {
      console.log("🚀 ~ fetchSign ~ error:", error);
    }
  }

  async function deleteSign(signId, signUrl) {
    try {
      if (!confirm("Are you sure want to delete?")) {
        return;
      }
      const storageRef = ref(storage, signUrl);
      await deleteObject(storageRef);

      const signRef = doc(
        db,
        "companies",
        companyDetails.companyId,
        "signs",
        signId
      );
      await deleteDoc(signRef);

      setSignImagesList((prev) => prev.filter((sign) => sign.id !== signId));
    } catch (error) {
      console.log("🚀 ~ deleteSign ~ error:", error);
    }
  }

  const handleFileChange = async (files) => {
    const payload = [];
    if (files.length <= 0) {
      return [];
    }

    try {
      for (let file of files) {
        if (file?.url) {
          payload.push(file);
        } else {
          const storageRef = ref(storage, `productImages/${file.name}`);
          await uploadBytes(storageRef, file);
          const productImageUrl = await getDownloadURL(storageRef);
          payload.push({ name: file.name, url: productImageUrl });
        }
      }
      return payload;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  async function onSubmit(isPrint = false) {
    if (!selectedPersonData.id) {
      alert("Please select a Person");
      return;
    }
    const t_sTaxDetails =
      (taxSelect !== "") &
      {
        [taxSelect]: {
          isTcsApplicable: true,
          ...selectedTaxDetails,
        },
      };

    const payload = {
      tds: { isTcsApplicable: false },
      tcs: { isTcsApplicable: false },
      ...t_sTaxDetails,
      products,
      isPrint,
      attachments: await handleFileChange(attachFiles),
      withoutT_SAmount: +totalAmount,
      total:
        totalAmount +
        (taxSelect === "tds" ? -total_Tax_Amount : total_Tax_Amount),
    };

    onSetForm(payload);
  }

  useEffect(() => {
    calculateTotal();
  }, [formData, products]);

  useEffect(() => {
    fetchSign();
    fetchCategories();
    fetchProducts();
    fetchBooks();
    fetchWarehouse();
  }, [companyDetails.companyId, userDetails.selectedDashboard]);

  useEffect(() => {
    setAttachFiles(formData.attachments);
    setPersonSuggestions(personDetails);
    addActionQty();
  }, [personDetails, formData.attachments, formData.products]);

  useEffect(() => {
    total_TCS_TDS_Amount();
  }, [totalAmount, selectedTaxDetails]);

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
    <div className="bg-gray-100 overflow-y-auto" style={{ height: "94vh" }}>
      <div className="px-5 pb-5">
        <header className="flex items-center space-x-3  my-2">
          <Link className="flex items-center" to={"./../"}>
            <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
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
                                {product.tax}%
                                <span className="text-xs">
                                  (
                                  {product.sellingPriceTaxType
                                    ? "In: "
                                    : "Ex: "}
                                  {product.taxAmount.toFixed(2)})
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
                      <SelectValue placeholder="Select Shipping From" />
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
                  <div className="relative" ref={signDropdownRef}>
                    <div
                      className="border h-12 rounded-md cursor-pointer"
                      onClick={() => setIsSignOpen(!isSignOpen)}
                    >
                      {formData.sign ? (
                        <div className="flex items-center">
                          <img
                            src={formData.sign}
                            className="w-full h-12 mix-blend-multiply object-contain"
                          />
                          <div
                            className="hover:text-red-500 text-2xl pe-4 "
                            onClick={() => {
                              setFormData((val) => ({ ...val, sign: "" }));
                            }}
                          >
                            <IoClose />
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-3">Select Sign</div>
                      )}
                    </div>
                    {isSignOpen && (
                      <div className="absolute w-full border-2 left-0 top-14 bg-white rounded-md auto-focus shadow">
                        <div className="border-b  minH-96 overflow-y-auto">
                          {SignImagesList.length > 0 &&
                            SignImagesList.map((item) => (
                              <div
                                className="flex items-center cursor-pointer hover:bg-blue-100 rounded-md"
                                key={item.id}
                              >
                                <div
                                  className="w-full h-14 overflow-hidden"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setFormData((val) => ({
                                      ...val,
                                      sign: item.url,
                                    }));
                                    setIsSignOpen(false);
                                  }}
                                >
                                  <img
                                    src={item.url}
                                    className="w-full h-14 mix-blend-multiply object-contain"
                                  />
                                </div>
                                <div
                                  className="hover:text-red-500 text-2xl pe-4"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteSign(item.id, item.url);
                                  }}
                                >
                                  <IoClose />
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="p-3 flex justify-center">
                          <label
                            htmlFor="file"
                            className="cursor-pointer p-2 rounded-md border-2 "
                          >
                            <div>
                              <span className="py-1 px-4">+ ADD</span>
                            </div>
                            <input
                              id="file"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={uploadSign}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full text-gray-500 space-y-2 grid">
                  <div>
                    Attach Files{" "}
                    <small>(Each file must be less than 2 MB.)</small>
                  </div>
                  <label
                    htmlFor="file"
                    className="cursor-pointer p-2 rounded-md border-2  border"
                  >
                    <div>
                      {attachFiles.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {attachFiles.map((file, index) => (
                            <div
                              className="py-1 px-4 w-full border rounded-md flex items-center"
                              key={index}
                            >
                              <div className="w-full text-nowrap text-ellipsis overflow-hidden">
                                {file.name}
                              </div>
                              <div
                                className="hover:text-red-500 text-lg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const filterFiles = attachFiles.filter(
                                    (_, i) => i !== index
                                  );
                                  setAttachFiles(filterFiles);
                                }}
                              >
                                <IoClose />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <span className="py-1 px-4">Upload Pdf</span>
                        </>
                      )}
                    </div>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (attachFiles.length + files.length > 2) {
                          alert("You can only upload a maximum of 2 files.");
                          e.target.value = null;
                        } else {
                          const invalidFiles = files.filter(
                            (file) => file.size > 2 * 1024 * 1024
                          );
                          if (invalidFiles.length > 0) {
                            alert("Each file must be less than 2 MB.");
                            e.target.value = null;
                          } else {
                            setAttachFiles((val) => [...val, ...files]);
                          }
                        }
                      }}
                    />
                  </label>
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
                          setSelectedTaxDetails({
                            isTotalAmount: true,
                          });
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
                <div className="w-full flex pt-3">
                  {taxSelect === "tds" && (
                    <Select
                      onValueChange={(data) => {
                        setSelectedTaxDetails(
                          tdsData.find((ele) => ele.id == data)
                        );
                      }}
                      value={selectedTaxDetails?.id || ""}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select ${taxSelect.toUpperCase()} Option`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tdsData.map((ele) => (
                          <SelectItem key={ele.id} value={ele.id}>
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
                    <Select
                      onValueChange={(data) => {
                        const selectData = tcsData.find(
                          (ele) => ele.id == data
                        );
                        setSelectedTaxDetails((val) => ({
                          ...val,
                          ...selectData,
                        }));
                      }}
                      value={selectedTaxDetails?.id || ""}
                    >
                      <SelectTrigger
                        style={{
                          borderTopRightRadius: "0px",
                          borderBottomRightRadius: "0px",
                        }}
                      >
                        <SelectValue
                          placeholder={`Select ${taxSelect.toUpperCase()} Option`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tcsData.map((ele) => (
                          <SelectItem key={ele.id} value={ele.id}>
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
                    <Select
                      onValueChange={(data) => {
                        setSelectedTaxDetails((val) => ({
                          ...val,
                          isTotalAmount: data == "true" ? true : false,
                        }));
                      }}
                      value={
                        selectedTaxDetails?.isTotalAmount == false
                          ? "false"
                          : "true"
                      }
                    >
                      <SelectTrigger
                        style={{
                          borderRadius: "0px",
                          width: "300px",
                        }}
                      >
                        <SelectValue
                          placeholder={`Select ${taxSelect.toUpperCase()} Option`}
                        />
                      </SelectTrigger>
                      <SelectContent className="h-24">
                        {[
                          { name: "Net Amount", value: "false" },
                          { name: "Total Amount", value: "true" },
                        ].map((ele, index) => (
                          <SelectItem key={index} value={ele.value}>
                            {ele.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {(taxSelect === "tds" || taxSelect === "tcs") && (
                    <div className="border p-3 rounded-e-md w-1/5">
                      ₹ {total_Tax_Amount.toFixed(2)}
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

                {totalGSTAmounts.totalTaxableAmount > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Taxable Amount</span>
                    <span>
                      ₹ {totalGSTAmounts.totalTaxableAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalGSTAmounts.totalSgstAmount_2_5 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(2.5%)</span>
                    <span>
                      ₹ {totalGSTAmounts.totalSgstAmount_2_5.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalGSTAmounts.totalCgstAmount_2_5 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(2.5%)</span>
                    <span>
                      ₹ {totalGSTAmounts.totalCgstAmount_2_5.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalGSTAmounts.totalSgstAmount_6 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(6%)</span>
                    <span>
                      ₹ {totalGSTAmounts.totalSgstAmount_6.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalGSTAmounts.totalCgstAmount_6 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(6%)</span>
                    <span>
                      ₹ {totalGSTAmounts.totalCgstAmount_6.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalGSTAmounts.totalSgstAmount_9 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>SGST(9%)</span>
                    <span>
                      ₹ {totalGSTAmounts.totalSgstAmount_9.toFixed(2)}
                    </span>
                  </div>
                )}
                {totalGSTAmounts.totalCgstAmount_9 > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>CGST(9%)</span>
                    <span>
                      ₹ {totalGSTAmounts.totalCgstAmount_9.toFixed(2)}
                    </span>
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
                {taxSelect !== "" && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>{taxSelect.toUpperCase()}</span>
                    <span>
                      {taxSelect === "tds" && "-"} ₹
                      {total_Tax_Amount.toFixed(2)}
                    </span>
                  </div>
                )}
                {/* )} */}
                <div className="flex justify-between font-bold text-xl mb-2 border-t pt-2">
                  <span>Total Amount</span>
                  <span>
                    ₹{" "}
                    {(
                      totalAmount +
                      (taxSelect === "tds"
                        ? -total_Tax_Amount
                        : total_Tax_Amount)
                    )?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end sticky bottom-0 space-x-4 bg-white p-2 pe-10 border-t mt-5">
        <button
          className="btn-outline-black "
          onClick={() => {
            navigate("./../");
          }}
        >
          Cancel
        </button>
        <button
          className=" bg-[#442799] text-white text-center   px-5 py-3 pt-2 font-semibold rounded-md"
          onClick={() => {
            {
              products.length > 0 && isProductSelected
                ? onSubmit(true)
                : alert("Please select items to proceed.");
            }
          }}
        >
          <span className="text-lg">+</span> {formId ? "Edit " : "Create "}&
          Print
        </button>
        <button
          className=" bg-[#442799] text-white text-center   px-5 py-3 pt-2 font-semibold rounded-md"
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
          totalAmount={+totalGSTAmounts.totalAmount}
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
export default SetForm;
