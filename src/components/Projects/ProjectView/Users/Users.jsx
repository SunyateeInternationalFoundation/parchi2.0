import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import UserSidebar from "./UserSidebar";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

function Users() {
  const { id } = useParams();
  const projectId = id;
  const userDetails = useSelector((state) => state.users);

  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.users;
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("customers");
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [projectDetails, setProjectDetails] = useState();
  const [modifiedProjectData, setModifiedProjectData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const fetchDetails = async (refs) => {
    try {
      const data = [];
      for (let ref of refs) {
        const docSnapshot = await getDoc(ref);
        if (docSnapshot.exists()) {
          data.push({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          });
        }
      }
      return data;
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const projectRef = doc(db, "projects", projectId);
      const projectSnapshot = await getDoc(projectRef);

      if (projectSnapshot.exists()) {
        const projectData = projectSnapshot.data();

        const customerRef = projectData.customerRef || [];
        const vendorRef = projectData.vendorRef || [];
        const staffRef = projectData.staffRef || [];
        const payload = {
          id: projectId,
          ...projectData,
          customerRef: await fetchDetails(customerRef),
          vendorRef: await fetchDetails(vendorRef),
          staffRef: await fetchDetails(staffRef),
        };

        setProjectDetails(payload);
        let field = "customerRef";
        if (activeNav === "vendors") {
          field = "vendorRef";
        } else if (activeNav === "staff") {
          field = "staffRef";
        }
        setModifiedProjectData(payload[field]);
        setTotalPages(Math.ceil(payload[field].length / 10));
        setPaginationData(payload[field].slice(0, 10)); 
        console.log("🚀 ~ fetchProjectData ~ payload:", payload);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  useEffect(() => {
    if (projectDetails?.id) {
      let field = "customerRef";
      if (activeNav === "vendors") {
        field = "vendorRef";
      } else if (activeNav === "staff") {
        field = "staffRef";
      }
      const filterData = projectDetails[field].filter((val) =>
        `${val.name} ${val.phone}`.toLowerCase().includes(searchTerm)
      );
      setTotalPages(Math.ceil(filterData.length / 10)); 
      setPaginationData(filterData.slice(currentPage * 10, currentPage * 10 + 10)); 
      setModifiedProjectData(filterData);
    }
  }, [activeNav, projectDetails, searchTerm, currentPage]);

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <nav className="flex mb-4 px-5">
          <div className="flex items-center space-x-4 w-full">
            <div className="w-full space-x-4">
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (activeNav === "customers" && " bg-black text-white")
                }
                onClick={() => setActiveNav("customers")}
              >
                Customers
              </button>
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (activeNav === "vendors" && " bg-black text-white")
                }
                onClick={() => setActiveNav("vendors")}
              >
                Vendors
              </button>
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (activeNav === "staff" && " bg-black text-white")
                }
                onClick={() => setActiveNav("staff")}
              >
                Staff
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-4 w-full text-end ">
            <div
              className="flex items-center  space-x-4  border
    px-5  py-3 rounded-md w-1/2"
            >
              <input
                type="text"
                placeholder="Search..."
                className=" w-full focus:outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearch />
            </div>
            {(userDetails.selectedDashboard === "" || role?.access) && (
              <button
                className="bg-[#442799]  text-white text-center  px-5  py-3 font-semibold rounded-md"
                onClick={() => setIsSideBarOpen(true)}
              >
                + Add Members
              </button>
            )}
          </div>
        </nav>

        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <div style={{ height: "96vh" }}>
            <div style={{ height: "92vh" }}>
              <table className="w-full border-collapse text-start">
                <thead className=" bg-white">
                  <tr className="border-b">
                    <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                      Name
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                      Contact Info
                    </td>
                    <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                      Email Id
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {modifiedProjectData.length > 0 ? (
                    modifiedProjectData.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="border-b border-gray-200 text-center "
                      >
                        <td className="px-8 py-3 font-bold">
                          <div className="flex items-center space-x-3">
                            {vendor.profileImage ? (
                              <img
                                src={vendor.profileImage}
                                alt="Profile"
                                className="mt-2 w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="bg-purple-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                                {vendor.name.charAt(0)}
                              </span>
                            )}
                            <div>
                              <div className="text-gray-800 font-semibold">
                                {vendor.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3 font-bold  text-center">
                          {vendor.phone || "N/A"}
                        </td>

                        <td className="px-5 py-3 text-start">
                          {vendor.email || ""}
                        </td>

                        {/* <td className="px-5 py-3 text-center">
                          {vendor?.amount?.toFixed(2) || ""}
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="h-24 text-center py-4">
                        No {activeNav} found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
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
      {isSideBarOpen && !loading && (
        <div>
          <UserSidebar
            isOpen={isSideBarOpen}
            projectId={projectId}
            projectDetails={{
              customerRef: projectDetails.customerRef,
              vendorRef: projectDetails.vendorRef,
              staffRef: projectDetails.staffRef,
            }}
            onClose={() => {
              setIsSideBarOpen(false);
            }}
            Refresh={fetchProjectData}
          />
        </div>
      )}
    </div>
  );
}

export default Users;
