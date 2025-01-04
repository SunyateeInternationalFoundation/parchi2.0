import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebase"; // Ensure Firebase is configured correctly

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
    <div className="p-4">
      <div className="flex space-x-3 mb-4">
        <Link className="flex items-center " to={"./../"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
        </Link>
        <h1 className="text-xl font-bold">Approvals</h1>
      </div>
      <div className="space-y-4">
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
      const approvalRef = doc(
        db,
        `projects/${projectId}/approvals`,
        approval.id
      );
      await updateDoc(approvalRef, { status: newStatus });
      onUpdate(); // Refresh the approvals list after the update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow flex justify-between items-center">
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
          <p className="text-gray-500 text-sm">Status: {status}</p>
        </div>
      </div>
      <div>
        <select
          className="border border-gray-300 rounded px-2 py-1"
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
