import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase"; // Ensure Firebase is configured correctly
import CreateApproval from "./CreateApproval";

const Approval = () => {
  const { id } = useParams();
  const projectId = id;
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState("All");
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  console.log("userDetails", userDetails);
  console.log("companyId", companyId);
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.approvals;
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const fetchApprovals = async () => {
    const approvalsRef = collection(db, `projects/${projectId}/approvals`);
    const snapshot = await getDocs(approvalsRef);

    const approvalsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setApprovals(approvalsData);
  };
  useEffect(() => {
    fetchApprovals();
  }, [projectId]);

  // Filter approvals based on selected category
  const filteredApprovals = approvals.filter(
    (approval) => filter === "All" || approval.categories === filter
  );

  return (
    <div className="px-8 py-4">
      <div className="flex space-x-3 mb-4">
        <h1 className="text-xl font-bold">Approvals</h1>
      </div>
      {/* Filter Buttons */}
      <div className="flex justify-between">
        <div className="flex space-x-2 mb-4">
          {["All", "Customer", "Vendor"].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full ${
                filter === category
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div>
          {(userDetails.selectedDashboard === "" || role?.access) && (
            <button
              className="bg-blue-500 text-white py-1 px-2 rounded"
              onClick={() => setIsSideBarOpen(true)}
            >
              + Create Approval
            </button>
          )}
        </div>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4 overflow-y-auto " style={{ height: "64vh" }}>
        {filteredApprovals.map((approval) => (
          <ApprovalCard key={approval.id} approval={approval} />
        ))}
      </div>
      {isSideBarOpen && (
        <div>
          <CreateApproval
            isOpen={isSideBarOpen}
            projectId={projectId}
            onClose={() => {
              setIsSideBarOpen(false);
            }}
            newApprovalAdded={fetchApprovals}
          />
        </div>
      )}
    </div>
  );
};

const ApprovalCard = ({ approval, isSideBarOpen }) => {
  return (
    <div className="bg-white p-4 rounded shadow flex justify-between items-center ">
      <div className="flex items-center">
        <img
          src={approval.imageUrl || "https://via.placeholder.com/50"}
          alt={approval.name}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2 className="text-lg font-semibold">{approval.name}</h2>
          <p className="text-gray-500 text-sm">
            Approver: {approval.approvalBelongsTo}
          </p>
          <p
            className={`text-sm ${
              approval.status === "Pending"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            Status: {approval.status}
          </p>
        </div>
      </div>
      <button className="text-blue-500 hover:text-blue-700">
        View Details
      </button>
    </div>
  );
};

export default Approval;
