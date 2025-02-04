import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { db } from "../../../../firebase";

function UserSidebar({ isOpen, onClose, projectId, projectDetails, Refresh }) {
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
      const customersNumbers = projectDetails?.customerRef?.map(
        (ele) => ele.phone
      );
      const vendersNumbers = projectDetails?.vendorRef?.map((ele) => ele.phone);
      const staffsNumbers = projectDetails?.staffRef?.map((ele) => ele.phone);
      let phoneNum = [...vendersNumbers, ...staffsNumbers];
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
        phoneNum = [...customersNumbers, ...staffsNumbers];
      } else if (activeNav === "staff") {
        field = {
          name: "staffRef",
          refName: "staff_ref",
          collectionName: "staff",
          user_type: "Staff",
          data: [],
        };
        phoneNum = [...customersNumbers, ...vendersNumbers];
      }

      selectedDataSet.forEach((fieldId) => {
        const ref = doc(db, field.collectionName, fieldId);

        const data = dataSet[activeNav].find((item) => fieldId === item.id);

        phoneNum.push(data?.phone);

        field.data.push(ref);
      });

      const payload = {
        phoneNum,
        [field.name]: field.data,
      };
      await updateDoc(projectDocRef, payload);

      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: projectDocRef,
        date: serverTimestamp(),
        section: "Project",
        action: "Create",
        description: `members added in ${projectDetails?.name}`,
      });
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
        className={`bg-white  pt-2 transform transition-transform  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-sm text-gray-600 ">Project Members</h2>
          <button
            onClick={onClose}
            className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <div className=" p-5">
          <input
            type="text"
            placeholder="Search"
            className="input-tag w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-around mb-4">
            <button
              onClick={() => handleTabClick("customers")}
              className={`btn-outline-black ${
                activeNav === "customers" && "bg-black text-white"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => handleTabClick("vendors")}
              className={`btn-outline-black ${
                activeNav === "vendors" && "bg-black text-white"
              }`}
            >
              Vendors
            </button>
            <button
              onClick={() => handleTabClick("staff")}
              className={`btn-outline-black ${
                activeNav === "staff" && "bg-black text-white"
              }`}
            >
              Staff
            </button>
          </div>
        </div>
        <div className="space-y-2  overflow-y-auto" style={{ height: "84vh" }}>
          {loading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            modifiedData.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b px-5"
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

        <div
          className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
          style={{ height: "8vh" }}
        >
          <button className="w-full btn-add" onClick={onAddSelectedItems}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
UserSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
  projectDetails: PropTypes.object,
  vendorRef: PropTypes.object,
  staffRef: PropTypes.object,
  Refresh: PropTypes.func.isRequired,
};

export default UserSidebar;
