import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import CreateStaff from "./CreateStaff";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";

function Staff() {
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [modifiedStaffData, setModifiedStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  async function fetchStaffData() {
    try {
      setLoading(true);
      const companyRef = doc(db, "companies", companyId);

      const q = query(
        collection(db, "staff"),
        where("companyRef", "==", companyRef)
      );
      const getData = await getDocs(q);
      const staffData = getData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStaffData(staffData);
      setModifiedStaffData(staffData);
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStaffData();
  }, [companyId]);

  useEffect(() => {
    function onFilterFun() {
      const filterData = staffData.filter((ele) => {
        const { name, phone } = ele;
        const matchesSearch = `${name} ${phone}`
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        return matchesSearch;
      });
      setModifiedStaffData(filterData);
    }
    onFilterFun();
  }, [searchInput]);

  const navigate = useNavigate();
  function onViewStaff(staffId) {
    navigate(staffId);
  }
  return (
    <div className="w-full" style={{ width: "100%", height: "92vh" }}>
      <div
        className="px-8 pb-8 pt-5 bg-gray-100"
        style={{ width: "100%", height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <div className="flex space-x-3">
            <Link
              className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
              to={"./../"}
            >
              <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
            </Link>
            <h1 className="text-2xl font-bold">Staff</h1>
          </div>

          <button
            className="bg-blue-500 text-white py-1 px-2 rounded "
            onClick={() => {
              setIsSideBarOpen(true);
            }}
          >
            + Create Staff
          </button>
        </header>
        <div className="flex items-center bg-white space-x-4 mb-4 border p-2 rounded">
          <input
            type="text"
            placeholder="Search by Staff Name, Phone number#..."
            className=" w-full focus:outline-none"
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <IoSearch />
        </div>
        <div>
          <div className="text-4xl text-blue-700 font-bold">
            {staffData.length}
          </div>
          <div>Total Staff</div>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-6">Loading Projects...</div>
          ) : modifiedStaffData.length > 0 ? (
            modifiedStaffData.map((ele) => (
              <div
                className="border-2 shadow bg-white cursor-pointer rounded-lg p-3 mt-3 "
                key={ele.id}
                onClick={() => onViewStaff(ele.id)}
              >
                <div className="flex justify-between items-center px-5">
                  <div className="">
                    <div className="font-bold">{ele.name}</div>
                    <div>
                      <span>{ele.phone}</span>
                    </div>
                  </div>
                  <div className=" rounded-lg bg-cyan-200 p-3">
                    {" "}
                    ₹{ele.paymentDetails}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center border-2 shadow cursor-pointer rounded-lg p-3 mt-3">
              No Staff
            </div>
          )}
        </div>
      </div>
      {isSideBarOpen && (
        <div>
          <CreateStaff
            isOpen={isSideBarOpen}
            onClose={() => {
              setIsSideBarOpen(false);
            }}
            staffAdded={fetchStaffData}
          />
        </div>
      )}
    </div>
  );
}

export default Staff;
