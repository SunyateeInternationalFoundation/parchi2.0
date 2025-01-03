import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { db } from "../../../firebase";

const Roles = () => {
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const [staffData, setStaffData] = useState([]);
  const [tempRoles, setTempRoles] = useState({});

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
      const staffData = getData.docs.map((doc) => {
        const staffId = doc.id;
        const staff = doc.data();
        const roles = staff.roles || {};
        return {
          id: staffId,
          ...staff,
          roles,
          isExpand: false,
        };
      });
      setStaffData(staffData);
      const initialTempRoles = staffData.reduce((acc, staff) => {
        acc[staff.id] = { ...staff.roles };
        return acc;
      }, {});
      setTempRoles(initialTempRoles);
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    }
    setLoading(false);
  }

  async function handleUpdateRoles(staff) {
    try {
      const staffRef = doc(db, "staff", staff.id);
      const updatedRoles = tempRoles[staff.id];
      await updateDoc(staffRef, { roles: updatedRoles });
      setStaffData((prevData) =>
        prevData.map((item) =>
          item.id === staff.id ? { ...item, roles: updatedRoles } : item
        )
      );
    } catch (error) {
      console.log("Error in handleUpdateRoles:", error);
    }
  }

  function handleRoleChange(staffId, roleName, action, isChecked) {
    setTempRoles((prevRoles) => ({
      ...prevRoles,
      [staffId]: {
        ...prevRoles[staffId],
        [roleName]: {
          ...prevRoles[staffId][roleName],
          [action]: isChecked,
        },
      },
    }));
  }

  useEffect(() => {
    fetchStaffData();
  }, [companyDetails.companyId]);

  const rolesList = [
    "invoice",
    "services",
    "quotation",
    "purchase",
    "customers",
    "vendors",
    "project",
    "po",
    "pos",
    "proFormaInvoice",
    "creditNote",
    "debitNote",
    "deliveryChallan",
  ];

  const projectsList = ["users", "milestones", "tasks", "files", "approvals"];

  const actions = ["view", "create", "edit", "delete"];

  return (
    <div className="w-full h-full bg-gray-100 py-3 px-10 overflow-y-auto">
      <header className="flex items-center mb-6">
        <Link to={"./../"} className="flex items-center">
          <AiOutlineArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold ml-3">Roles</h1>
      </header>

      {loading ? (
        <div className="text-center py-6">Loading Roles...</div>
      ) : staffData.length > 0 ? (
        staffData.map((staff) => (
          <div
            key={staff.id}
            className="mb-6 bg-white shadow-lg rounded-lg px-8 pb-3 pt-5"
          >
            <div
              className="flex justify-between items-center mb-4 "
              onClick={() =>
                setStaffData((prevData) =>
                  prevData.map((pre) => {
                    if (staff.id === pre.id) {
                      return { ...pre, isExpand: !pre.isExpand };
                    }
                    return pre;
                  })
                )
              }
            >
              <h2 className="text-xl font-bold">{staff.name}</h2>
              {staff.isExpand && (
                <button
                  onClick={() => handleUpdateRoles(staff)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                >
                  <TbEdit className="inline mr-2" />
                  Update Roles
                </button>
              )}
            </div>
            {staff.isExpand && (
              <div className="border-t pt-3">
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Role
                      </th>
                      {actions.map((action) => (
                        <th
                          key={action}
                          className="border border-gray-300 px-4 py-2"
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rolesList.map((role) => (
                      <tr key={role} className="hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">
                          {role?.charAt(0).toUpperCase() + role?.slice(1)}
                        </td>
                        {actions.map((action) => (
                          <td
                            key={action}
                            className="border border-gray-300 px-4 py-2 text-center"
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5"
                              checked={
                                tempRoles[staff.id]?.[role]?.[action] || false
                              }
                              onChange={(e) =>
                                handleRoleChange(
                                  staff.id,
                                  role,
                                  action,
                                  e.target.checked
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-6">
                  <h3 className="font-semibold text-xl mb-4">Projects</h3>
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Role
                        </th>

                        <th className="border border-gray-300 px-4 py-2">
                          Access
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsList.map((role) => (
                        <tr key={role} className="hover:bg-gray-100">
                          <td className="border border-gray-300 px-4 py-2">
                            {role?.charAt(0).toUpperCase() + role?.slice(1)}
                          </td>

                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              className="h-5 w-5"
                              checked={
                                tempRoles[staff.id]?.[role]?.access || false
                              }
                              onChange={(e) =>
                                handleRoleChange(
                                  staff.id,
                                  role,
                                  "access",
                                  e.target.checked
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No Staff Found</div>
      )}
    </div>
  );
};

export default Roles;
