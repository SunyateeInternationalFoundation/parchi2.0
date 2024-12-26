import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Ensure Firebase is configured correctly
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";

const Approval = () => {
  const { id } = useParams();
  const projectId = id;
  const [approvals, setApprovals] = useState([]);
  const userDetails = useSelector((state) => state.users);

  const fetchApprovals = async () => {
    const approvalsRef = collection(db, `projects/${projectId}/approvals`);
    const q = query(
      approvalsRef,
      where("phoneNumber", "==", userDetails.phone)
    );

    const snapshot = await getDocs(q);

    const approvalsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setApprovals(approvalsData);
  };

  useEffect(() => {
    fetchApprovals();
  }, [projectId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Link
          className="flex items-center bg-gray-300 text-gray-700 py-2 px-5 rounded-full hover:bg-gray-400 hover:text-white transition duration-200"
          to={"./../"}
        >
          <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Approvals</h1>
      </div>
      <div className="space-y-6">
        {approvals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            projectId={projectId}
            onUpdate={fetchApprovals}
          />
        ))}
      </div>
    </div>
  );
};

const ApprovalCard = ({ approval, projectId, onUpdate }) => {
  const [status, setStatus] = useState(approval.status);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    try {
      const approvalRef = doc(db, `projects/${projectId}/approvals`, approval.id);
      await updateDoc(approvalRef, { status: newStatus });
      onUpdate(); // Refresh the approvals list after the update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <img
          src={approval.imageUrl || "https://via.placeholder.com/50"}
          alt={approval.name}
          className="w-16 h-16 rounded-full border-2 border-gray-200 mr-4"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{approval.name}</h2>
          <p className="text-sm text-gray-600">
            Approver: <span className="font-medium">{approval.approvalBelongsTo}</span>
          </p>
          <p
            className={`text-sm font-medium ${
              status === "Pending"
                ? "text-yellow-600"
                : status === "Accepted"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Status: {status}
          </p>
        </div>
      </div>
      <div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          value={status}
          onChange={handleStatusChange}
        >
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
};

export default Approval;
