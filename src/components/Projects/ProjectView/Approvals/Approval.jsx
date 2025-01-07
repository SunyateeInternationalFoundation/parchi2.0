import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../../../constants/FormatTimestamp";
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
      <div className="bg-white rounded-lg ">
        {/* Filter Buttons */}
        <div className="flex justify-between p-5 ">
          <div className="flex space-x-2 mb-4">
            {["All", "Customer", "Vendor"].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-5  py-3 text-gray-600  rounded-md border hover:bg-black hover:text-white ${
                  filter === category && "bg-black text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div>
            {(userDetails.selectedDashboard === "" || role?.access) && (
              <button
                className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                onClick={() => setIsSideBarOpen(true)}
              >
                + Create Approval
              </button>
            )}
          </div>
        </div>

        {/* Approval Cards */}
        <div
          className="bg-white rounded-lg   overflow-y-auto"
          style={{ height: "62vh" }}
        >
          <table className="w-full border-collapse text-start  ">
            <thead className=" bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  Date
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  File
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  Approver
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Phone
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Status
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  ApprovalBelongsTo
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Priority
                </td>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map((approval) => (
                  <tr key={approval.id} className="border-b-2 border-gray-200 ">
                    <td className="px-8 py-3 text-start ">
                      <FormatTimestamp timestamp={approval.createdAt} />
                    </td>
                    <td className="px-5 py-3 text-start flex items-center">
                      <img
                        src={
                          approval.imageUrl || "https://via.placeholder.com/50"
                        }
                        alt={approval.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      {approval.name}
                    </td>
                    <td className="px-5 py-3 text-start">
                      {approval.approverName}
                    </td>
                    <td className="px-5 py-3 text-start">
                      {approval.phoneNumber}
                    </td>
                    <td className="px-5 py-3 text-start">{approval.status}</td>
                    <td className="px-5 py-3 text-start">
                      {approval.approvalBelongsTo}
                    </td>
                    <td className="px-5 py-3 text-start">
                      {approval.priority}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="h-24 text-center py-4 ">
                    No Item Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

// const ApprovalCard = ({ approval, isSideBarOpen }) => {
//   return (
//     <div className="bg-white p-4 rounded shadow flex justify-between items-center ">
//       <div className="flex items-center">
//         <div>
//           <h2 className="text-lg font-semibold">{approval.name}</h2>
//           <p className="text-gray-500 text-sm">:</p>
//           <p
//             className={`text-sm ${
//               approval.status === "Pending"
//                 ? "text-yellow-500"
//                 : "text-green-500"
//             }`}
//           >
//             Status: {approval.status}
//           </p>
//         </div>
//       </div>
//       <button className="text-blue-500 hover:text-blue-700">
//         View Details
//       </button>
//     </div>
//   );
// };

export default Approval;
