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

const SetDeliveryChallan = () => {
  const { deliverychallanId } = useParams();

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
  const [preDeliveryChallanList, setPreDeliveryChallanList] = useState([]);
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
    if (deliverychallanId) {
      fetchDeliveryChallanNumbers();
    }
  }, [formData.products]);

  const fetchDeliveryChallanNumbers = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "companies", companyDetails.companyId, "deliveryChallan")
      );
      const noList = querySnapshot.docs.map(
        (doc) => doc.data().deliveryChallanNo
      );
      if (deliverychallanId) {
        setPreDeliveryChallanList(noList.filter((ele) => ele !== formData.no));
      } else {
        setPreDeliveryChallanList(noList);
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
          setPrefix(companyData.prefix.deliveryChallan || "DC");
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };
    async function fetchDeliveryChallanData() {
      if (!deliverychallanId) {
        return;
      }
      try {
        const docRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "deliveryChallan",
          deliverychallanId
        );
        const getData = (await getDoc(docRef)).data();
        const customerData = (
          await getDoc(getData.customerDetails.customerRef)
        ).data();
        setSelectedCustomerData({
          id: getData.customerDetails.customerRef.id,
          ...customerData,
        });
        setFormData({ no: getData.deliveryChallanNo, ...getData });
      } catch (error) {
        console.log("🚀 ~ fetchDeliveryChallanData ~ error:", error);
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
    if (!deliverychallanId) {
      fetchDeliveryChallanNumbers();
    }
    fetchPrefix();
    fetchDeliveryChallanData();
    customerDetails();
  }, [companyDetails]);

  async function onSetDeliveryChallan(data) {
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

      const createdBy = deliverychallanId
        ? { ...baseCreatedBy, who: formData.createdBy.who }
        : {
            ...baseCreatedBy,
            who: userDetails.selectedDashboard === "staff" ? "staff" : "owner",
          };
      const payload = {
        ...restForm,
        ...rest,
        deliveryChallanNo: no,
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
      let deliveryChallanRef = "";

      let payloadLog = {
        ref: deliveryChallanRef,
        date: serverTimestamp(),
        section: "Delivery Challan",
        action: "Create",
        description: `${prefix}-${no} created by ${payload.createdBy.who}`,
      };
      if (deliverychallanId) {
        deliveryChallanRef = doc(
          db,
          "companies",
          companyDetails.companyId,
          "deliveryChallan",
          deliverychallanId
        );
        await updateDoc(deliveryChallanRef, payload);

        payloadLog.ref = deliveryChallanRef;
        payloadLog.action = "Update";
        payloadLog.description = `${prefix}-${no} updated by ${payload.createdBy.who}`;
      } else {
        deliveryChallanRef = await addDoc(
          collection(
            db,
            "companies",
            companyDetails.companyId,
            "deliveryChallan"
          ),
          payload
        );
        payloadLog.ref = deliveryChallanRef;
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

        // await updateDoc(item.productRef, {
        //   stock: currentQuantity - item.quantity,
        // });
      }

      alert(
        "Successfully " +
          (deliverychallanId ? "Updated" : "Created") +
          " the DeliveryChallan"
      );
      const redirect =
        (userDetails.selectedDashboard === "staff"
          ? "/staff/delivery-challan/"
          : "/delivery-challan/") + deliveryChallanRef.id;

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
      formId={deliverychallanId}
      formName={"DeliveryChallan"}
      personDetails={customersDetails}
      setFormData={setFormData}
      formData={formData}
      onSetForm={onSetDeliveryChallan}
      prefix={prefix}
      userDetails={userDetails}
      preFormList={preDeliveryChallanList}
      selectedPersonData={selectedCustomerData}
      setSelectedPersonData={setSelectedCustomerData}
      companyDetails={companyDetails}
    />
  );
};

export default SetDeliveryChallan;
