import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../firebase";

const PREFIX_FIELDS = [
  { name: "invoice", default: "INV" },
  { name: "service", default: "SRE" },
  {
    name: "quotation",
    default: "QTN",
  },
  { name: "purchase", default: "PUR" },
  {
    name: "proformaInvoice",
    default: "PRF",
  },
  { name: "po", default: "PO" },
  { name: "pos", default: "POS" },
  {
    name: "deliveryChallan",
    default: "DC",
  },
  {
    name: "creditNote",
    default: "CN",
  },
  {
    name: "debitNote",
    default: "DN",
  },
];

const Prefix = () => {
  const [formData, setFormData] = useState({});
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const companyDocRef = doc(db, "companies", companyId);
        const companySnapshot = await getDoc(companyDocRef);

        if (companySnapshot.exists()) {
          const companyData = companySnapshot.data();
          setFormData(companyData.prefix || {});
        } else {
          console.error("No company document found.");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedFormData = { ...formData };
      const prefix = PREFIX_FIELDS.reduce((acc, field) => {
        acc[field.name] = updatedFormData?.[field.name] ?? field.default;
        return acc;
      }, {});

      const data = { prefix };
      const ref = doc(db, "companies", companyId);
      await updateDoc(ref, data);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: ref,
        date: serverTimestamp(),
        section: "settings",
        action: "Update",
        description: "prefix details updated",
      });
      alert("Details saved successfully!");
      setFormData(updatedFormData);
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Failed to save details.");
    }
  };

  return (
    <div className="main-container overflow-y-auto " style={{ height: "92vh" }}>
      <h1 className="text-2xl font-bold text-gray-800 px-5">Settings</h1>
      <div className="container2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-700">Prefix</h1>
        </div>
        <div className="space-y-6">
          {PREFIX_FIELDS.map((field) => (
            <div className="flex justify-between" key={field.name}>
              <div className="w-1/4">
                <label className="block text-gray-600 text-sm font-bold mt-1">
                  {field.name.charAt(0).toUpperCase() + field.name.slice(1)} :
                </label>
              </div>
              <div className="w-3/4">
                <input
                  type="text"
                  name={field.name}
                  placeholder={"Enter Prefix of " + field.name}
                  value={formData[field.name] ?? field.default}
                  onChange={handleChange}
                  className="bg-gray-40 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2 hover:border-blue-500 hover:shadow-md hover:shadow-blue-300"
                />
              </div>
            </div>
          ))}
          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
              onClick={handleSave}
            >
              Save & Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prefix;
