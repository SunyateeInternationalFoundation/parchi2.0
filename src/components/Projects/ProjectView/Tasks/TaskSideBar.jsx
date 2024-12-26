import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../../firebase";
import { useSelector } from "react-redux";

function TaskSideBar({
  isOpen,
  onClose,
  typeOf,
  fetchTaskData,
  taskId,
  projectId,
}) {
  const userDetails = useSelector((state) => state.users);
  const [formData, setFormData] = useState({
    addedStaffs: [],
    createdAt: "",
    description: "",
    endDate: "",
    name: "",
    priority: "",
    progressPercentage: 0,
    projectRef: {},
    startDate: "",
    stat: "",
    status: "on-Going",
    milestoneRef: [],
  });
  const [milestoneData, setMilestoneData] = useState([]);
  const [staffData, setstaffData] = useState([]);
  const [selectStaffData, setSelectStaffData] = useState([]);
  const [selectMileStoneData, setSelectMileStoneData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (typeOf === "AddMileStone") {
          const milestoneRef = collection(
            db,
            "projects",
            projectId,
            "milestone"
          );
          const querySnapshot = await getDocs(milestoneRef);
          const MilestonesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMilestoneData(MilestonesData);
        } else if (typeOf === "AddStaff") {
          const staffRef = collection(db, "staff");
          const companyRef = doc(
            db,
            "companies",
            userDetails.companies[userDetails.selectedCompanyIndex].companyId
          );

          const q = query(staffRef, where("companyRef", "==", companyRef));
          const querySnapshot = await getDocs(q);
          const staffsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setstaffData(staffsData);
        }
        if (typeOf !== "CreateTask") {
          const taskRef = doc(db, "projects", projectId, "tasks", taskId);
          const querySnapshot = await getDoc(taskRef);
          const taskData = querySnapshot.data();
          const milestoneData = taskData.milestoneRef.map(
            (eleRef) => eleRef.id
          );

          setSelectStaffData(taskData.addedStaffs);
          setSelectMileStoneData(milestoneData);
        }
      } catch (error) {
        console.log("🚀 ~ fetchData ~ error:", error);
      }
    }
    fetchData();
  }, []);

  function ResetForm() {
    setFormData({
      addedStaffs: [],
      createdAt: "",
      description: "",
      endDate: "",
      name: "",
      priority: "",
      progressPercentage: 0,
      projectRef: {},
      startDate: "",
      stat: "",
      status: "on-Going",
      milestoneRef: [],
    });
  }

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const projectRef = doc(db, "projects", projectId);
      if (typeOf === "CreateTask") {
        const payload = {
          ...formData,
          projectRef,
          createdAt: Timestamp.fromDate(new Date()),
        };
        const taskRef = collection(db, "projects", projectId, "tasks");
        await addDoc(taskRef, payload);
        alert("Successfully Created the Task");
        ResetForm();
      } else {
        const taskRef = doc(db, "projects", projectId, "tasks", taskId);
        let payload =
          typeOf === "AddStaff" ? { addedStaffs: selectStaffData } : {};

        if (typeOf === "AddMileStone") {
          payload = {
            milestoneRef: selectMileStoneData.map((ele) => {
              return doc(db, `/projects/${projectId}/milestone/${ele}`);
            }),
          };
        }
        await updateDoc(taskRef, payload);
        alert("Successfully Updated");
      }
      fetchTaskData();
      onClose();
    } catch (error) {
      console.log("🚀 ~ onCreateProduct ~ error:", error);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-96 p-3 pt-2 transform transition-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold ">{typeOf}</h2>
        <button
          onClick={onClose}
          className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <IoMdClose />
        </button>
        <form className="space-y-1.5" onSubmit={onSubmit}>
          {typeOf === "CreateTask" && (
            <div>
              <div>
                <label className="text-sm block font-semibold mt-2">
                  Task Name
                </label>
                <input
                  type="text"
                  name="taskName"
                  className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
                  placeholder="Task Name"
                  required
                  onChange={(e) =>
                    setFormData((val) => ({ ...val, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm block font-semibold mt-2">
                  Description
                </label>
                <textarea
                  name="des"
                  className="w-full border border-gray-300 p-2 rounded-md  max-h-44 min-h-44 focus:outline-none "
                  placeholder="Description"
                  required
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm block font-semibold mt-2">
                  Priority
                </label>

                <select
                  className="w-full border border-gray-300 p-2 rounded-md  focus:outline-none"
                  onChange={(e) =>
                    setFormData((val) => ({
                      ...val,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option disabled>Select Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="text-sm block font-semibold mt-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="border p-2 rounded w-full  cursor-pointer"
                  onChange={(e) => {
                    setFormData((val) => ({
                      ...val,
                      startDate: Timestamp.fromDate(new Date(e.target.value)),
                    }));
                  }}
                />
              </div>
              <div>
                <label className="text-sm block font-semibold mt-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="border p-2 rounded w-full  cursor-pointer"
                  onChange={(e) => {
                    setFormData((val) => ({
                      ...val,
                      endDate: Timestamp.fromDate(new Date(e.target.value)),
                    }));
                  }}
                />
              </div>
            </div>
          )}
          {typeOf === "AddMileStone" && (
            <div className="mt-10">
              {milestoneData.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b-2 my-2 items-center"
                >
                  <div>
                    <div>{item.name}</div>
                    <div>{DateFormate(item.createdAt)}</div>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={selectMileStoneData.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectMileStoneData((val) => [...val, item.id]);
                        } else {
                          setSelectMileStoneData((val) =>
                            val.filter((ele) => ele !== item.id)
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {typeOf === "AddStaff" && (
            <div className="mt-10">
              {" "}
              {staffData.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b-2 my-2 items-center"
                >
                  <div>{item.name}</div>
                  <div>
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={selectStaffData.includes(item.phone)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectStaffData((val) => [...val, item.phone]);
                        } else {
                          setSelectStaffData((val) =>
                            val.filter((ele) => ele !== item.phone)
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <button
              type="submit"
              className="w-full bg-purple-500 text-white p-2 rounded-md mt-4"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskSideBar;
