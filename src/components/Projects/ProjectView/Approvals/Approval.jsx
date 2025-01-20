import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../../../constants/FormatTimestamp";
import { db } from "../../../../firebase"; // Ensure Firebase is configured correctly
import CreateApproval from "./CreateApproval";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationData, setPaginationData] = useState([]);

  const fetchApprovals = async () => {
    const approvalsRef = collection(db, `projects/${projectId}/approvals`);
    const snapshot = await getDocs(approvalsRef);

    const approvalsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setApprovals(approvalsData);
    setTotalPages(Math.ceil(approvalsData.length / 10)); // Set total pages based on the data length
    setPaginationData(approvalsData.slice(0, 10)); // Set initial pagination data
  };
  useEffect(() => {
    fetchApprovals();
  }, [projectId]);

  useEffect(() => {
    // Update pagination data when approvals or currentPage changes
    const filteredApprovals = approvals.filter(
      (approval) => filter === "All" || approval.categories === filter
    );
    setTotalPages(Math.ceil(filteredApprovals.length / 10)); // Update total pages based on filtered approvals length
    setPaginationData(filteredApprovals.slice(currentPage * 10, currentPage * 10 + 10)); // Update pagination data
  }, [approvals, currentPage, filter]);

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
              {paginationData.length > 0 ? (
                paginationData.map((approval) => (
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
                  <td colSpan="7" className="h-24 text-center py-4 ">
                    No Item Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between p-5">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage + 1} of {totalPages || 1} page(s)
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

export default Approval;
