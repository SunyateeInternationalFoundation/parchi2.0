import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../constants/FormatTimestamp";
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

  const handleStatusChange = async (id, value) => {
    try {
      const approvalRef = doc(db, `projects/${projectId}/approvals`, id);
      await updateDoc(approvalRef, { status: value });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container">
        <div className=" rounded-lg overflow-y-auto" style={{ height: "80vh" }}>
          <table className="w-full border-collapse text-start  ">
            <thead className=" bg-white">
              <tr className="border-b">
                <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                  Date
                </td>
                <td className="px-5 py-1 text-gray-400 font-semibold text-start ">
                  File
                </td>

                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Status
                </td>

                <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                  Priority
                </td>
              </tr>
            </thead>
            <tbody>
              {approvals.length > 0 ? (
                approvals.map((approval) => (
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
                      <div>
                        <select
                          className="border border-gray-300 rounded px-2 py-1"
                          value={approval.status}
                          onChange={(e) =>
                            handleStatusChange(e.target.value, approval.id)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-start">
                      {approval.priority}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="h-24 text-center py-4 ">
                    No Item Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// const ApprovalCard = ({ approval, projectId, onUpdate }) => {
//   const [status, setStatus] = useState(approval.status);

//   return (
//     <div className="bg-white p-5 rounded-lg shadow-md flex justify-between items-center">
//       <div className="flex items-center">
//         <img
//           src={approval.imageUrl || "https://via.placeholder.com/50"}
//           alt={approval.name}
//           className="w-16 h-16 rounded-full border-2 border-gray-200 mr-4"
//         />
//         <div>
//           <h2 className="text-lg font-semibold text-gray-800">
//             {approval.name}
//           </h2>
//           <p className="text-sm text-gray-600">
//             Approver:{" "}
//             <span className="font-medium">{approval.approvalBelongsTo}</span>
//           </p>
//           <p
//             className={`text-sm font-medium ${
//               status === "Pending"
//                 ? "text-yellow-600"
//                 : status === "Accepted"
//                 ? "text-green-600"
//                 : "text-red-600"
//             }`}
//           >
//             Status: {status}
//           </p>
//         </div>
//       </div>
//       <div>
//         <select
//           className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//           value={status}
//           onChange={handleStatusChange}
//         >
//           <option value="Pending">Pending</option>
//           <option value="Accepted">Accepted</option>
//           <option value="Rejected">Rejected</option>
//         </select>
//       </div>
//     </div>
//   );
// };

export default Approval;
