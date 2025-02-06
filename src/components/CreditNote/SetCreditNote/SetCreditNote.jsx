import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SetForm from "../../../constants/SetForm";
import { db } from "../../../firebase";
import { setAllCustomersDetails } from "../../../store/CustomerSlice";

const SetCreditNote = () => {
  const { creditNoteId } = useParams();

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

  const [preCreditNoteList, setPreCreditNoteList] = useState([]);

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
    if (creditNoteId) {
      fetchCreditNoteNumbers();
    }
  }, [formData.products]);

  const fetchCreditNoteNumbers = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "companies", companyDetails.companyId, "creditNote")
      );
      const noList = querySnapshot.docs.map((doc) => doc.data().creditNoteNo);
      if (creditNoteId) {
        setPreCreditNoteList(noList.filter((ele) => ele !== formData.no));
      } else {
        setPreCreditNoteList(noList);
        setFormData((val) => ({
          ...val,
          no: String(noList.length + 1).padStart(4, 0),
        }));
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
          setPrefix(companyData.prefix.creditNote || "CN");
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    async function fetchCreditNoteData() {
      if (!creditNoteId) {
        return;
      }
      try {
        const docRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "creditNote",
          creditNoteId
        );
        const getData = (await getDoc(docRef)).data();
        const customerData = (
          await getDoc(getData.customerDetails.customerRef)
        ).data();
        setSelectedCustomerData({
          id: getData.customerDetails.customerRef.id,
          ...customerData,
        });
        setFormData({ no: getData.creditNoteNo, ...getData });
      } catch (error) {
        console.log("🚀 ~ fetchCreditNoteData ~ error:", error);
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

    if (!creditNoteId) {
      fetchCreditNoteNumbers();
    }
    fetchPrefix();
    fetchCreditNoteData();
    customerDetails();
  }, [companyDetails]);

  async function onSetCreditNote(data) {
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

      const createdBy = creditNoteId
        ? { ...baseCreatedBy, who: formData.createdBy.who }
        : {
            ...baseCreatedBy,
            who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
          };
      const payload = {
        ...restForm,
        ...rest,
        creditNoteNo: no,
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
      let creditNoteRef = "";
      let payloadLog = {
        ref: creditNoteRef,
        date: serverTimestamp(),
        section: "Credit Note",
        action: "Create",
        description: `${prefix}-${no} created by ${payload.createdBy.who}`,
      };
      if (creditNoteId) {
        creditNoteRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "creditNote",
          creditNoteId
        );
        await updateDoc(creditNoteRef, payload);
        payloadLog.ref = creditNoteRef;
        payloadLog.action = "Update";
        payloadLog.description = `${prefix}-${no} updated by ${payload.createdBy.who}`;
      } else {
        creditNoteRef = await addDoc(
          collection(db, "companies", companyDetails.companyId, "creditNote"),
          payload
        );
        payloadLog.ref = creditNoteRef;
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
          from: "credit Note",
          ref: creditNoteRef,
        };
        if (creditNoteId) {
          productPayloadLogs.status = "update";
        }
        await addDoc(collection(item.productRef, "logs"), productPayloadLogs);
      }

      alert(
        "Successfully " +
          (creditNoteId ? "Updated" : "Created") +
          " the CreditNote"
      );

      const redirect =
        (userDetails.selectedDashboard === "staff"
          ? "/staff/credit-note/"
          : "/credit-note/") + creditNoteRef.id;

      if (isPrint) {
        navigate(redirect + "?print=true");
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SetForm
      formId={creditNoteId}
      formName={"CreditNote"}
      personDetails={customersDetails}
      setFormData={setFormData}
      formData={formData}
      onSetForm={onSetCreditNote}
      prefix={prefix}
      userDetails={userDetails}
      preFormList={preCreditNoteList}
      selectedPersonData={selectedCustomerData}
      setSelectedPersonData={setSelectedCustomerData}
      companyDetails={companyDetails}
    />
  );
};

export default SetCreditNote;
