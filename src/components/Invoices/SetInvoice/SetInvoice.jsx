import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SetForm from "../../../constants/SetForm";
import { db } from "../../../firebase";
import { setAllCustomersDetails } from "../../../store/CustomerSlice";

const SetInvoice = () => {
  const { invoiceId } = useParams();
  const userDetails = useSelector((state) => state.users);
  const customersDetails = useSelector((state) => state.customers).data;

  const dispatch = useDispatch();
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
  const [preInvoiceList, setPreInvoiceList] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: Timestamp.fromDate(new Date()),
    dueDate: Timestamp.fromDate(new Date()),
    book: {},
    warehouse: {},
    discount: 0,
    paymentStatus: "UnPaid",
    notes: "",
    no: "",
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
    extraDiscountType: true,
  });

  const [selectedCustomerData, setSelectedCustomerData] = useState({
    name: "",
  });

  useEffect(() => {
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
        setPreInvoiceList(noList.filter((ele) => ele !== formData.no));
      } else {
        setPreInvoiceList(noList);
        if (noList.length == 0) {
          setFormData((val) => ({
            ...val,
            no: "0001",
          }));
        } else {
          setFormData((val) => ({
            ...val,
            no: String(+noList[noList.length - 1] + 1).padStart(4, 0),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

        const customerData = (
          await getDoc(getData.customerDetails.customerRef)
        ).data();
        setSelectedCustomerData({
          id: getData.customerDetails.customerRef.id,
          ...customerData,
        });
        setFormData({ no: getData.invoiceNo, ...getData });
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
      } catch (error) {
        console.log("🚀 ~ customerDetails ~ error:", error);
      }
    }

    if (!invoiceId) {
      fetchInvoiceNumbers();
    }
    fetchPrefix();
    fetchInvoiceData();
    customerDetails();
  }, [companyDetails.companyId, userDetails.selectedDashboard]);

  async function onSetInvoice(data) {
    try {
      const { no, ...restForm } = formData;
      const { products, isPrint, ...rest } = data;
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
          discount: product.discount,
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

      const baseCreatedBy = {
        companyRef: companyRef,
        name: companyDetails.name,
        address: companyDetails.address ?? "",
        city: companyDetails.city ?? "",
        zipCode: companyDetails.zipCode ?? "",
        phoneNo: companyDetails.phone ?? "",
        email: companyDetails.email ?? "",
      };

      const createdBy = invoiceId
        ? { ...baseCreatedBy, who: formData.createdBy.who }
        : {
          ...baseCreatedBy,
          who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
        };

      const payload = {
        ...restForm,
        ...rest,

        invoiceNo: no,
        prefix,
        createdBy,
        subTotal: +subTotal,
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

      let invoiceRef = "";
      let payloadLog = {
        ref: invoiceRef,
        date: serverTimestamp(),
        section: "Invoice",
        action: "Create",
        description: `${prefix}-${no} created by ${payload.createdBy.who}`,
      };
      if (invoiceId) {
        invoiceRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "invoices",
          invoiceId
        );
        await updateDoc(invoiceRef, payload);
        payloadLog.ref = invoiceRef;
        payloadLog.action = "Update";
        payloadLog.description = `${prefix}-${no} created by ${payload.createdBy.who}`;
      } else {
        invoiceRef = await addDoc(
          collection(db, "companies", companyDetails.companyId, "invoices"),
          payload
        );
        payloadLog.ref = invoiceRef;
      }
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        payloadLog
      );
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

        let productPayloadLogs = {
          date: Timestamp.fromDate(new Date()),
          status: "use",
          quantity: item.quantity,
          from: "invoice",
          ref: invoiceRef,
        };
        if (invoiceId) {
          productPayloadLogs.status = "update";
        }

        await addDoc(collection(item.productRef, "logs"), productPayloadLogs);
      }

      alert(
        "Successfully " + (invoiceId ? "Updated" : "Created") + " the Invoice"
      );

      const redirect =
        (userDetails.selectedDashboard === "staff"
          ? "/staff/invoice/"
          : "/invoice/") + invoiceRef.id;

      if (isPrint) {
        navigate(redirect + "?tab=Invoice&print=true");
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SetForm
      formId={invoiceId}
      formName={"Invoice"}
      personDetails={customersDetails}
      setFormData={setFormData}
      formData={formData}
      onSetForm={onSetInvoice}
      prefix={prefix}
      userDetails={userDetails}
      preFormList={preInvoiceList}
      selectedPersonData={selectedCustomerData}
      setSelectedPersonData={setSelectedCustomerData}
      companyDetails={companyDetails}
    />
  );
};

export default SetInvoice;
