import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../constants/FormatTimestamp";
import { db } from "../../firebase"; // Ensure Firebase is configured correctly
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

const Approval = ({ project }) => {
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

  const handleStatusChange = async (data, value) => {
    try {
      const approvalRef = doc(db, `projects/${projectId}/approvals`, data.id);
      const companyDetails = (await getDoc(doc(db, "companies", project.companyRef))).data()
      await updateDoc(approvalRef, { status: value });

      const notificationPayload = {
        date: Timestamp.fromDate(new Date()),
        from: userDetails.phone,
        to: companyDetails.phone,
        subject: "Approval",
        description: `Your ${project.name} project ${data.name} approval status has been updated to ${value}.`,
        companyName: companyDetails.name,
        ref: approvalRef,
        seen: false,
      }
      await addDoc(collection(db, "companies", project.companyRef, "notifications"), notificationPayload)
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="main-container" style={{ height: "82vh" }}>
      <div className="container2">
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
                      {approval.typeOfFile == "Image" ? (
                        <img
                          src={approval.file.image}
                          alt={approval.name}
                          className="w-12 h-12 rounded-full mr-4"
                        />
                      ) : (
                        <FaRegFilePdf size={36} className="mr-4" />
                      )}
                      {approval.name}
                    </td>

                    <td className="px-5 py-3 text-start">
                      <div>
                        <Select
                          defaultValue={approval.status}
                          onValueChange={(val) => {
                            handleStatusChange(approval, val);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder=" Select PurchasePriceTaxType" />
                          </SelectTrigger>
                          <SelectContent className="h-18">
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
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

export default Approval;
