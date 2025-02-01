import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

const Roles = () => {
  const [loading, setLoading] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const [staffData, setStaffData] = useState([]);
  const [tempRoles, setTempRoles] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

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
      
      // Set total pages for pagination
      setTotalPages(Math.ceil(staffData.length / 10));
      setPaginationData(staffData.slice(0, 10)); // Get the first page data
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStaffData();
  }, [companyDetails.companyId]);

  useEffect(() => {
    // Update pagination data when staffData or currentPage changes
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    setPaginationData(staffData.slice(startIndex, endIndex));
  }, [currentPage, staffData]);

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
      alert("successfully Updated");
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

  const rolesList = [
    "invoice",
    "subscription",
    "plan",
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
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <header className="flex items-center px-5 py-3">
          <h1 className="text-2xl font-bold">Roles</h1>
        </header>
        {loading ? (
          <div className="text-center py-6">Loading Roles...</div>
        ) : paginationData.length > 0 ? (
          paginationData.map((staff) => (
            <div key={staff.id} className="border-t py-3">
              <div
                className="flex justify-between items-center mb-4 px-5 cursor-pointer"
                onClick={() =>
                  setPaginationData((prevData) =>
                    prevData.map((pre) => {
                      if (staff.id === pre.id) {
                        return { ...pre, isExpand: !pre.isExpand };
                      }
                      return pre;
                    })
                  )
                }
              >
                <h2 className="text-xl">{staff.name}</h2>
                {staff.isExpand && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateRoles(staff);
                    }}
                    className="btn-add "
                  >
                    <TbEdit className="inline mr-2" />
                    Update Roles
                  </button>
                )}
              </div>
              {staff.isExpand && (
                <div className="border-t py-5 px-5">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
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
                                className="h-5 w-5 cursor-pointer"
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
                        <tr className="bg-gray-50">
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
        
        {/* Pagination Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
            <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
              {currentPage + 1} of {totalPages || 1} row(s) selected.
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage <= 0}
                >
                  <div className="flex justify-center">
                    <LuChevronsLeft className="text-sm" />
                  </div>
                </button>
                <button
                  className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                  onClick={() => setCurrentPage((val) => val - 1)}
                  disabled={currentPage <= 0}
                >
                  <div className="flex justify-center">
                    <LuChevronLeft className="text-sm" />
                  </div>
                </button>
                <button
                  className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                  onClick={() => setCurrentPage((val) => val + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  <div className="flex justify-center">
                    <LuChevronRight className="text-sm" />
                  </div>
                </button>
                <button
                  className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  <div className="flex justify-center">
                    <LuChevronsRight />
                  </div>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Roles;
