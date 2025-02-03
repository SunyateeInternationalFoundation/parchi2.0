import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SetForm from "../../../constants/SetForm";
import { db } from "../../../firebase";

const SetPurchase = () => {
  const { purchaseId } = useParams();
  const userDetails = useSelector((state) => state.users);
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
  const [vendorsDetails, setVendorsDetails] = useState([]);
  const [prePurchaseList, setPrePurchaseList] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: Timestamp.fromDate(new Date()),
    dueDate: Timestamp.fromDate(new Date()),
    book: {},
    warehouse: {},
    discount: 0,
    orderStatus: "Pending",
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

  const [selectedVendorData, setSelectedVendorData] = useState({
    name: "",
  });

  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseNumbers();
    }
  }, [formData.products]);

  const fetchPurchaseNumbers = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "companies", companyDetails.companyId, "purchases")
      );
      const noList = querySnapshot.docs.map((doc) => doc.data().purchaseNo);
      if (purchaseId) {
        setPrePurchaseList(noList.filter((ele) => ele !== formData.no));
      } else {
        setPrePurchaseList(noList);
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
          setPrefix(companyData.prefix.purchase || "PUR");
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    async function fetchPurchaseData() {
      if (!purchaseId) {
        return;
      }
      try {
        const docRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "purchases",
          purchaseId
        );
        const getData = (await getDoc(docRef)).data();

        const vendorData = (
          await getDoc(getData.vendorDetails.vendorRef)
        ).data();
        setSelectedVendorData({
          id: getData.vendorDetails.vendorRef.id,
          ...vendorData,
        });
        setFormData({ no: getData.purchaseNo, ...getData });
      } catch (error) {
        console.log("🚀 ~ fetchPurchaseData ~ error:", error);
      }
    }

    async function vendorDetails() {
      try {
        const vendorsRef = collection(db, "vendors");

        const companyRef = doc(db, "companies", companyDetails.companyId);
        const q = query(vendorsRef, where("companyRef", "==", companyRef));
        const company = await getDocs(q);
        const VendorData = company.docs.map((doc) => {
          const { createdAt, companyRef, ...data } = doc.data();
          return {
            id: doc.id,
            createdAt: JSON.stringify(createdAt),
            companyRef: JSON.stringify(companyRef),
            ...data,
          };
        });
        setVendorsDetails(VendorData);
      } catch (error) {
        console.log("🚀 ~ vendorDetails ~ error:", error);
      }
    }

    if (!purchaseId) {
      fetchPurchaseNumbers();
    }
    fetchPrefix();
    fetchPurchaseData();
    vendorDetails();
  }, [companyDetails]);

  async function onSetPurchase(data) {
    try {
      const { no, ...restForm } = formData;
      const { products, isPrint, ...rest } = data;

      const vendorRef = doc(db, "vendors", selectedVendorData.id);
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
        phoneNo: phoneNo,
      };

      const createdBy = purchaseId
        ? { ...baseCreatedBy, who: formData.createdBy.who }
        : {
            ...baseCreatedBy,
            who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
          };
      const payload = {
        ...restForm,
        ...rest,
        purchaseNo: no,
        prefix,
        createdBy,
        subTotal: +subTotal,
        products: items,
        vendorDetails: {
          gstNumber: selectedVendorData.gstNumber ?? "",
          vendorRef: vendorRef,
          address: selectedVendorData.address ?? "",
          city: selectedVendorData.city ?? "",
          zipCode: selectedVendorData.zipCode ?? "",
          phone: selectedVendorData.phone ?? "",
          name: selectedVendorData.name,
        },
      };
      let purchaseRef = "";
      let payloadLog = {
        ref: purchaseRef,
        date: serverTimestamp(),
        section: "Purchase",
        action: "Create",
        description: `${prefix}-${no} updated by ${payload.createdBy.who}`,
      };
      if (purchaseId) {
        (purchaseRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "purchases",
          purchaseId
        )),
          await updateDoc(purchaseRef, payload);
        payloadLog.ref = purchaseRef;
        payloadLog.action = "Update";
      } else {
        purchaseRef = await addDoc(
          collection(db, "companies", companyDetails.companyId, "purchases"),
          payload
        );
        payloadLog.ref = purchaseRef;
        payloadLog.action = "Create";
      }
      await addDoc(
        collection(db, "companies", companyDetails.companyId, "audit"),
        payloadLog
      );
      alert(
        "Successfully " + (purchaseId ? "Updated" : "Created") + " the Purchase"
      );
      const redirect =
        (userDetails.selectedDashboard === "staff"
          ? "/staff/purchase/"
          : "/purchase/") + purchaseRef.id;

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
      formId={purchaseId}
      formName={"Purchase"}
      personDetails={vendorsDetails}
      setFormData={setFormData}
      formData={formData}
      onSetForm={onSetPurchase}
      prefix={prefix}
      userDetails={userDetails}
      preFormList={prePurchaseList}
      selectedPersonData={selectedVendorData}
      setSelectedPersonData={setSelectedVendorData}
      companyDetails={companyDetails}
      isVendor={true}
    />
  );
};

export default SetPurchase;
