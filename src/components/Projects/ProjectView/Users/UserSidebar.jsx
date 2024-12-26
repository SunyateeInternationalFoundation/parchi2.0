import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../../firebase";
import { useSelector } from "react-redux";

function UserSidebar({ isOpen, onClose, projectId, projectDetails, Refresh }) {
  console.log("🚀 ~ UserSidebar ~ projectDetails:", projectDetails);
  const userDetails = useSelector((state) => state.users);

  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const [activeNav, setActiveNavSideBar] = useState("customers");
  const [loading, setLoading] = useState(false);
  const [modifiedData, setModifiedData] = useState([]);
  const [dataSet, setDataset] = useState({
    customers: [],
    vendors: [],
    staff: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDataSet, setSelectedDataSet] = useState([]);
  const [previousSelectedDataSet, setPreviousSelectedDataSet] = useState({
    customers: [],
    vendors: [],
    staff: [],
  });

  const handleTabClick = (tab) => {
    setActiveNavSideBar(tab);
  };
  useEffect(() => {
    const fetch_Cus_Vend_Staff_data = async (collectionName) => {
      setLoading(true);
      try {
        const ref = collection(db, collectionName);

        const companyRef = doc(db, "companies", companyId);
        const q = query(ref, where("companyRef", "==", companyRef));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDataset((val) => ({ ...val, [collectionName]: data }));
        if (activeNav === collectionName) {
          setModifiedData(data);
        }
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };
    if (companyId) {
      fetch_Cus_Vend_Staff_data("staff");
      fetch_Cus_Vend_Staff_data("vendors");
      fetch_Cus_Vend_Staff_data("customers");
    }

    function setPreviousData() {
      const data = {
        customers: projectDetails.customerRef.map((item) => item.id),
        vendors: projectDetails.vendorRef.map((item) => item.id),
        staff: projectDetails.staffRef.map((item) => item.id),
      };
      setPreviousSelectedDataSet(data);
      setSelectedDataSet(data[activeNav]);
    }
    setPreviousData();
  }, [companyId]);

  useEffect(() => {
    const filterData = dataSet[activeNav].filter((val) =>
      val.name?.toLowerCase().includes(searchTerm)
    );
    setModifiedData(filterData);
    setSelectedDataSet(previousSelectedDataSet[activeNav]);
  }, [activeNav, previousSelectedDataSet, searchTerm]);

  async function onAddSelectedItems() {
    try {
      const projectDocRef = doc(db, "projects", projectId);

      let field = {
        name: "customerRef",
        refName: "customer_ref",
        collectionName: "customers",
        user_type: "Customer",
        data: [],
      };
      if (activeNav === "vendors") {
        field = {
          name: "vendorRef",
          refName: "vendor_ref",
          collectionName: "vendors",
          user_type: "Vendor",
          data: [],
        };
      } else if (activeNav === "staff") {
        field = {
          name: "staffRef",
          refName: "staff_ref",
          collectionName: "staff",
          user_type: "Staff",
          data: [],
        };
      }

      // previousSelectedDataSet.customers.map(ele=>)
      let phoneNum = [];

      selectedDataSet.forEach((fieldId) => {
        const ref = doc(db, field.collectionName, fieldId);

        const data = dataSet[activeNav].find((item) => fieldId === item.id);

        console.log("🚀 ~ selectedDataSet.forEach ~ data:", data);
        phoneNum.push(data?.phone);

        field.data.push(ref);
      });

      const payload = {
        phoneNum,
        [field.name]: field.data,
      };
      await updateDoc(projectDocRef, payload);
      alert("Users added successfully!");
      onClose();
      Refresh();
    } catch (error) {
      console.error("Error adding users to project:", error);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5">Project Members</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <div>
          <input
            type="text"
            placeholder="Search"
            className="border p-2 rounded w-full mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-around mb-4">
            <button
              onClick={() => handleTabClick("customers")}
              className={`px-4 py-1 rounded-full ${
                activeNav === "customers"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => handleTabClick("vendors")}
              className={`px-4 py-1 rounded-full ${
                activeNav === "vendors"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Vendors
            </button>
            <button
              onClick={() => handleTabClick("staff")}
              className={`px-4 py-1 rounded-full ${
                activeNav === "staff"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Staff
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-64">
          {loading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            modifiedData.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-gray-500">
                    {item.phone || item.email}
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600"
                  checked={selectedDataSet?.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDataSet((val) => [...val, item.id]);
                    } else {
                      setSelectedDataSet((val) =>
                        val.filter((ele) => ele !== item.id)
                      );
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>

        <button
          className="bg-green-500 text-white w-full mt-4 py-2 rounded-md"
          onClick={onAddSelectedItems}
        >
          Save
        </button>
      </div>
    </div>
  );
}
export default UserSidebar;
