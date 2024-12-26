import React, { useState, useEffect } from "react";
import { db } from "../../../../firebase"; // Ensure Firebase is initialized and configured
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";

const Milestone = () => {
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const projectId = id;

  useEffect(() => {
    const fetchMilestones = async () => {
      const milestonesRef = collection(db, `projects/${projectId}/milestone`);
      const snapshot = await getDocs(milestonesRef);

      const milestonesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMilestones(milestonesData);
      const tasksQueryPromises = milestonesData.map((milestone) => {
        const milestoneDocRef = doc(
          db,
          `projects/${projectId}/milestone/${milestone.id}`
        );
        console.log("Milestone Path:", milestoneDocRef);
        const tasksRef = collection(db, `projects/${projectId}/tasks`);
        const tasksQuery = query(
          tasksRef,
          where("milestoneRef", "array-contains", milestoneDocRef)
        );
        return getDocs(tasksQuery);
      });

      const tasksSnapshots = await Promise.all(tasksQueryPromises);
      console.log("Tasks Snapshot Size:", tasksSnapshots.size);
      const tasksData = tasksSnapshots.flatMap((snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setTasks(tasksData);
      console.log(tasksData);
    };
    fetchMilestones();
  }, [projectId]);

  const handleAddMilestone = (newMilestone) => {
    setMilestones((prev) => [...prev, newMilestone]);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <div className="flex space-x-3">
          <Link
            className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
            to={"./../"}
          >
            <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold  text-black">Milestones</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-2 rounded hover:bg-blue-600 transition"
        >
          + Create Milestone
        </button>
      </div>
      <div className="space-y-4">
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
              <div key={index} className="bg-gray-100 p-2 rounded">
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
      <div className="bg-white w-full max-w-sm p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Milestone</h2>
        <div className="mb-4">
          <label htmlFor="milestoneName" className="block text-gray-700 mb-2">
            Milestone Name
          </label>
          <input
            id="milestoneName"
            type="text"
            className="w-full p-2 border rounded"
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMilestone}
            className={`${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            } text-white px-4 py-2 rounded hover:bg-blue-600 transition`}
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
