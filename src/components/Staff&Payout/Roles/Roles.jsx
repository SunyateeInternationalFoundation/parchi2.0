import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";

const Roles = () => {
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const [staffData, setStaffData] = useState([]);

  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  async function fetchStaffData() {
    try {
      setLoading(true);
      const companyRef = doc(db, "companies", companyDetails.companyId);

      const q = query(
        collection(db, "staff"),
        where("companyRef", "==", companyRef)
      );
      const getData = await getDocs(q);
      const staffData = await getData.docs.map((doc) => {
        const staffId = doc.id;
        const staff = doc.data();

        return {
          id: staffId,
          ...staff,
          isExpand: false,
        };
      });
      setStaffData(staffData);
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    }
    setLoading(false);
  }

  async function handleRoleToggle(staff, roleName, action, isChecked) {
    try {
      const staffRef = doc(db, "staff", staff.id);
      const updatedRoles = {
        ...staff.roles,
        [roleName]: {
          ...staff.roles[roleName],
          [action]: isChecked,
        },
      };
      await updateDoc(staffRef, { roles: updatedRoles });

      setStaffData((prevData) =>
        prevData.map((item) => {
          if (item.id === staff.id) {
            return {
              ...item,
              roles: updatedRoles,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.log("Error in handleRoleToggle:", error);
    }
  }

  useEffect(() => {
    fetchStaffData();
  }, [companyDetails.companyId]);

  const rolesList = [
    "CreateInvoice",
    "CreateServices",
    "CreateQuotation",
    "CreatePurchase",
    "CreateCustomers",
    "CreateVendors",
    "CreateProject",
    "CreatePo",
    "CreatePOS",
    "CreateProFormaInvoice",
    "CreateCreditNote",
    "CreateDeliveryChallan",
  ];

  const actions = ["create", "edit", "view", "delete"];

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

            <h1 className="text-2xl font-bold">Roles</h1>
          </div>
        </header>
        <div>
          {loading ? (
            <div className="text-center py-6">Loading Roles...</div>
          ) : staffData.length > 0 ? (
            staffData.map((ele) => (
              <div
                className="border-2 shadow bg-white cursor-pointer rounded-lg p-3 mt-3"
                key={ele.id}
              >
                <div className="px-5 space-y-3">
                  <div
                    className="font-bold"
                    onClick={() =>
                      setStaffData((prevData) =>
                        prevData.map((staff) => {
                          if (staff.id === ele.id) {
                            return { ...staff, isExpand: !staff.isExpand };
                          }
                          return staff;
                        })
                      )
                    }
                  >
                    {ele.name}
                  </div>

                  {ele.isExpand &&
                    rolesList.map((roleName) => (
                      <div key={roleName} className="mt-3">
                        <h2 className="font-semibold">{roleName}</h2>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                          {actions.map((action) => (
                            <div
                              key={action}
                              className="flex justify-between items-center"
                            >
                              <span className="capitalize">{action}</span>
                              <label className="relative inline-block w-14 h-8">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={
                                    ele.roles?.[roleName]?.[action] || false
                                  }
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleRoleToggle(
                                      ele,
                                      roleName,
                                      action,
                                      e.target.checked
                                    );
                                  }}
                                />
                                <span className="absolute cursor-pointer inset-0 bg-[#9fccfa] rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] peer-focus:ring-2 peer-focus:ring-[#0974f1] peer-checked:bg-[#0974f1]"></span>
                                <span className="absolute top-0 left-0 h-8 w-8 bg-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center peer-checked:translate-x-[1.6em]"></span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
    </div>
  );
};

export default Roles;

