import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import UserSidebar from "./UserSidebar";

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
      setModifiedProjectData(filterData);
    }
  }, [activeNav, projectDetails, searchTerm]);

  return (
    <div className="px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-3">
          <h2 className="text-2xl font-bold">Project Members</h2>
        </div>

        {(userDetails.selectedDashboard === "" || role?.access) && (
          <button
            className="bg-blue-500 text-white px-4 pb-1 rounded-lg ml-4 "
            onClick={() => setIsSideBarOpen(true)}
          >
            + Add Members
          </button>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <nav className="flex space-x-4 mb-4">
          <button
            className={
              "px-4 py-1" +
              (activeNav === "customers" ? " bg-green-300 rounded-full" : "")
            }
            onClick={() => setActiveNav("customers")}
          >
            Customers
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeNav === "vendors" ? " bg-green-300 rounded-full" : "")
            }
            onClick={() => setActiveNav("vendors")}
          >
            Vendors
          </button>
          <button
            className={
              "px-4 py-1" +
              (activeNav === "staff" ? " bg-green-300 rounded-full" : "")
            }
            onClick={() => setActiveNav("staff")}
          >
            Staff
          </button>
        </nav>

        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by Name, Mobile Number..."
            className="border p-2 rounded w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <div className="overflow-y-auto" style={{ height: "50vh" }}>
            {modifiedProjectData.length > 0 ? (
              modifiedProjectData.map((item) => (
                <div
                  key={item.id}
                  className="border-2 shadow cursor-pointer rounded-lg p-3 mt-3"
                >
                  <div className="font-bold">{item.name}</div>
                  <div className="text-gray-500">{item.email}</div>
                  <div className="text-gray-500">{item.phone}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">No users found.</div>
            )}
          </div>
        )}
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
