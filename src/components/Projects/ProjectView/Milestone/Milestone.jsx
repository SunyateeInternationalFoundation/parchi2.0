import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../../firebase"; // Ensure Firebase is initialized and configured
const Milestone = () => {
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const projectId = id;
  const userDetails = useSelector((state) => state.users);

  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.milestones;
  useEffect(() => {
    const fetchMilestones = async () => {
      const milestonesRef = collection(db, `projects/${projectId}/milestone`);
      const snapshot = await getDocs(milestonesRef);
      const tasksRef = collection(db, `projects/${projectId}/tasks`);

      const milestonesData = await Promise.all(
        snapshot.docs.map(async (mileDoc) => {
          const tasksQuery = query(
            tasksRef,
            where(
              "milestoneRef",
              "array-contains",
              doc(db, `projects/${projectId}/milestone/${mileDoc.id}`)
            )
          );

          const tasksGetDocs = await getDocs(tasksQuery);
          const tasksData = tasksGetDocs.docs.map(
            (taskDoc) => taskDoc.data().name
          );
          return {
            id: mileDoc.id,
            ...mileDoc.data(),
            tasks: tasksData,
          };
        })
      );
      console.log("🚀 ~ fetchMilestones ~ milestonesData:", milestonesData);
      setMilestones(milestonesData);
    };
    fetchMilestones();
  }, [projectId]);

  const handleAddMilestone = (newMilestone) => {
    setMilestones((prev) => [...prev, newMilestone]);
  };

  return (
    <div className="px-8 py-4">
      <div className="flex justify-between mb-6">
        <div className="flex space-x-3">
          <h1 className="text-2xl font-bold  text-black">Milestones</h1>
        </div>

        {(userDetails.selectedDashboard === "" || role?.access) && (
          <button onClick={() => setIsModalOpen(true)} className="btn-add">
            + Create Milestone
          </button>
        )}
      </div>
      <div className="space-y-4 overflow-y-auto" style={{ height: "70vh" }}>
        {milestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </div>
      {isModalOpen && (
        <AddMilestoneModal
          onClose={() => setIsModalOpen(false)}
          onAddMilestone={handleAddMilestone}
          projectId={projectId}
        />
      )}
    </div>
  );
};

const MilestoneCard = ({ milestone }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{milestone.name}</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-800"
        >
          Tasks {isExpanded ? `▼` : `►`}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {milestone.tasks && milestone.tasks.length > 0 ? (
            milestone.tasks.map((task, index) => (
              <div key={index} className=" bg-gray-100 p-2 rounded">
                {task}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No tasks available</p>
          )}
        </div>
      )}
    </div>
  );
};
const AddMilestoneModal = ({ onClose, onAddMilestone, projectId }) => {
  const [milestoneName, setMilestoneName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMilestone = async () => {
    if (!milestoneName.trim()) {
      alert("Milestone name is required");
      return;
    }
    setIsLoading(true);

    try {
      const milestoneRef = collection(db, `projects/${projectId}/milestone`);
      const newMilestone = {
        name: milestoneName,
        createdAt: serverTimestamp(),
        projectRef: `/projects/${projectId}`,
      };

      const docRef = await addDoc(milestoneRef, newMilestone);

      onAddMilestone({ id: docRef.id, ...newMilestone });
      onClose();
    } catch (error) {
      console.error("Error adding milestone:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
      <div
        className={`bg-white  pt-2 transform transition-transform  `}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-sm text-gray-600 ">Add Milestone</h2>
          <button
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <div
          className="space-y-2 px-5 overflow-y-auto"
          style={{ height: "84vh" }}
        >
          <label htmlFor="milestoneName" className="text-sm text-gray-600">
            Milestone Name
          </label>
          <input
            id="milestoneName"
            type="text"
            className="w-full input-tag"
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
          />
        </div>
        <div
          className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
          style={{ height: "6vh" }}
        >
          <button
            onClick={handleAddMilestone}
            className="w-full btn-add"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Milestone"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Milestone;
