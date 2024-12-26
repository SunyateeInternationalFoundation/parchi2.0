import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { MdOutlineShowChart } from "react-icons/md";
import { db } from "../../../../firebase";
import { Link, useParams } from "react-router-dom";
import { IoMdClose, IoMdSend } from "react-icons/io";
import TaskSideBar from "./TaskSideBar";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector } from "react-redux";

function Tasks() {
  const { id } = useParams();
  const projectId = id;
  const userDetails = useSelector((state) => state.users);
  const [filter, setFilter] = useState("All");
  const [tasksDetails, setTasksDetails] = useState([]);
  const [filterTasksDetails, setFilterTasksDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState({});
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressRange, setProgressRange] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [sideBarType, setSideBarType] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [taskMessagesData, setTaskMessagesData] = useState({});

  async function fetchTaskData() {
    try {
      const projectRef = collection(db, "projects", projectId, "tasks");
      const querySnapshot = await getDocs(projectRef);
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const ProgressPercentage = tasksData.reduce(
        (sum, task) => sum + (task.progressPercentage || 0),
        0
      );
      const ProgressPercentage1 =
        tasksData.length > 0 ? ProgressPercentage / tasksData.length : 0;

      setProgressPercent(ProgressPercentage1);
      setTasksDetails(tasksData);
      setFilterTasksDetails(tasksData);
      if (selectedTask.id) {
        const taskData = tasksData.find((ele) => ele.id === selectedTask.id);
        setSelectedTask(taskData);
      }
      setLoading(false);
    } catch (error) {
      console.log("🚀 ~ fetchTaskData ~ error:", error);
    }
  }

  useEffect(() => {
    fetchTaskData();
  }, []);

  function DateFormate(timestamp, formate = "dd/mm/yyyy") {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return formate === "yyyy-mm-dd"
      ? `${getFullYear}-${getMonth}-${getDate}`
      : `${getDate}/${getMonth}/${getFullYear}`;
  }

  async function modifiedTask(field, value) {
    try {
      const taskRef = doc(db, "projects", projectId, "tasks", selectedTask.id);
      await updateDoc(taskRef, { [field]: value });
      const modifiedData = tasksDetails.map((task) => {
        if (selectedTask.id === task.id) {
          task[field] = value;
        }
        return task;
      });
      setTasksDetails(modifiedData);

      if (filter !== "All") {
        const modifiedFilterData = filterTasksDetails.map((task) => {
          if (selectedTask.id === task.id) {
            task[field] = value;
          }
          return task;
        });
        setFilterTasksDetails(modifiedFilterData);
      } else {
        setFilterTasksDetails(modifiedData);
      }
    } catch (error) {
      console.log("🚀 ~ ModifiedTask ~ error:", error);
    }
  }
  async function onSendProgress() {
    try {
      if (taskMessage === "") {
        alert("!Please Enter Task Message!  ");
        return;
      }
      const taskRef = doc(db, "projects", projectId, "tasks", selectedTask.id);
      const payloadTaskMSG = {
        createdAt: Timestamp.fromDate(new Date()),
        senderId: userDetails.userId,
        senderName: userDetails.name,
        msg: taskMessage,
      };

      await addDoc(collection(taskRef, "taskMessages"), payloadTaskMSG);

      setTaskMessagesData((val) => ({
        ...val,
        [selectedTask.id]: [...val[selectedTask.id], payloadTaskMSG],
      }));
      if (progressRange !== 0 && !isProgressOpen) {
        await updateDoc(taskRef, {
          progressPercentage: +(
            selectedTask.progressPercentage + +progressRange
          ),
        });
        const ProgressPercentage1 = progressRange / tasksDetails.length;
        const updatedTaskData = tasksDetails.map((ele) => {
          if (ele.id == selectedTask.id) {
            ele.progressPercentage += +progressRange;
          }
          return ele;
        });
        setTasksDetails(updatedTaskData);
        setProgressPercent((val) => val + ProgressPercentage1);
      }
      setProgressRange(0);
      setTaskMessage("");
      alert("successfully Sended The MSG");
    } catch (error) {
      console.log("🚀 ~ onSendProgress ~ error:", error);
    }
  }

  useEffect(() => {
    function filterTasksData() {
      if (filter !== "All") {
        const filterTasks = tasksDetails.filter((ele) => ele.status === filter);
        setFilterTasksDetails(filterTasks);
      } else {
        setFilterTasksDetails(tasksDetails);
      }
    }
    filterTasksData();
  }, [filter]);

  useEffect(() => {
    async function fetchTaskMessagesData() {
      if (!selectedTask.id) {
        return;
      }
      try {
        const q = query(
          collection(
            db,
            "projects",
            projectId,
            "tasks",
            selectedTask.id,
            "taskMessages"
          ),
          orderBy("createdAt", "asc")
        );
        const getData = await getDocs(q);

        const fetchTaskMessages = getData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTaskMessagesData((val) => ({
          ...val,
          [selectedTask.id]: fetchTaskMessages,
        }));
      } catch (error) {
        console.log("🚀 ~ fetchTaskMessagesData ~ error:", error);
      }
    }
    fetchTaskMessagesData();
    setProgressRange(0);
    setIsProgressOpen(false);
    setTaskMessage("");
  }, [selectedTask]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [taskMessagesData[selectedTask.id]]);
  return (
    <div
      className="w-full bg-gray-100"
      style={{ width: "100%", height: "92vh" }}
    >
      <div className="w-full grid grid-cols-2 h-full">
        <div className="p-3 border-r-2 ">
          <div className="flex justify-between border-r-2">
            <div className="flex space-x-3">
              <Link
                className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
                to={"./../"}
              >
                <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
              </Link>
              <h2 className="text-xl font-semibold ">TASKS</h2>
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white py-1 px-2 rounded"
              onClick={() => {
                setIsSideBarOpen(true);
                setSideBarType("CreateTask");
              }}
            >
              + Create Task
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow my-4">
            <div>
              <span className="text-blue-700 font-bold">Progress</span>(status)
            </div>
            <div className="text-5xl flex">
              <div className=" text-green-700 mr-3">
                <MdOutlineShowChart />
              </div>
              <div>
                {progressPercent.toFixed(1)}
                <span className="text-2xl">/100%</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between mb-2">
              <div className="flex justify-around text-gray-600">
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "All" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("All")}
                >
                  All
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Delay" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Delay")}
                >
                  Delay
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "On-Going" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("On-Going")}
                >
                  On-Going
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Completed" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Completed")}
                >
                  Completed
                </button>
              </div>
              <FaFilter />
            </div>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : filterTasksDetails.length > 0 ? (
            filterTasksDetails.map((task) => (
              <div
                className="bg-white p-4 rounded-lg shadow  flex justify-between items-center my-2 cursor-pointer"
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                }}
              >
                <div>
                  <div>{task.name}</div>
                  <div>Date {DateFormate(task.endDate)}</div>
                </div>
                <div
                  className={`px-3 py-1 rounded-bl-lg rounded-tr-lg ${
                    task.status === "Delay"
                      ? "bg-red-500"
                      : task.status === "Completed"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                >
                  Status {task.status}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-lg shadow  flex justify-between items-center my-2">
              No Tasks Found
            </div>
          )}
        </div>
        {selectedTask.id ? (
          <div className="px-4">
            <div className="mt-4 flex justify-between cursor-pointer">
              <div className="text-lg">{selectedTask.name}</div>
              <div
                className="text-3xl cursor-pointer"
                onClick={() => setSelectedTask({})}
              >
                <IoMdClose />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow my-2">
              <div className="flex justify-between ">
                <div className="flex items-center">
                  <div className="w-full">Start Date: </div>
                  <input
                    type="date"
                    className="border p-2 rounded w-full mx-3 cursor-pointer"
                    defaultValue={DateFormate(
                      selectedTask.startDate,
                      "yyyy-mm-dd"
                    )}
                    onChange={(e) =>
                      modifiedTask(
                        "startDate",
                        Timestamp.fromDate(new Date(e.target.value))
                      )
                    }
                  />
                </div>
                <div className="flex items-center">
                  <div className="w-full ">End Date: </div>
                  <input
                    type="date"
                    className="border p-2 rounded w-full mx-3 cursor-pointer"
                    defaultValue={DateFormate(
                      selectedTask.endDate,
                      "yyyy-mm-dd"
                    )}
                    onChange={(e) =>
                      modifiedTask(
                        "endDate",
                        Timestamp.fromDate(new Date(e.target.value))
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <div className="w-full border-r-2">
                  <div className="flex items-center justify-between mr-2">
                    <span className="text-blue-700 font-bold">Progress</span>
                    <select
                      className="border p-2 rounded cursor-pointer"
                      defaultValue={selectedTask.status}
                      onChange={(e) => modifiedTask("status", e.target.value)}
                    >
                      <option value="On-Going">On-Going</option>
                      <option value="Delay">Delay</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="text-5xl flex w-full ">
                    <div className=" text-green-700 mr-3">
                      <MdOutlineShowChart />
                    </div>
                    <div>
                      {selectedTask.progressPercentage.toFixed(1) || 0.0}
                      <span className="text-2xl">/100%</span>
                    </div>
                  </div>
                </div>
                <div className="w-3/4 text-lg ml-2">
                  <div
                    className="flex bg-purple-200 px-3 py-2 rounded-lg mb-1 text-center cursor-pointer"
                    onClick={() => {
                      setIsSideBarOpen(true);
                      setSideBarType("AddMileStone");
                    }}
                  >
                    <div className="w-full">Milestones</div>
                    <div className="w-full">
                      {selectedTask.milestoneRef.length}
                    </div>
                  </div>
                  <div
                    className="flex bg-pink-200 px-3 py-2 rounded-lg mt-1 text-center cursor-pointer"
                    onClick={() => {
                      setIsSideBarOpen(true);
                      setSideBarType("AddStaff");
                    }}
                  >
                    <div className="w-full">Staff</div>
                    <div className="w-full">
                      {selectedTask.addedStaffs.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="bg-white p-4 rounded-lg shadow my-4"
              style={{ height: "50vh" }}
            >
              <div
                ref={containerRef}
                className="flex  flex-col-reverse  overflow-y-auto"
                style={{ height: "44vh" }}
              >
                <div className="">
                  <div className="space-y-3">
                    {taskMessagesData[selectedTask.id]?.length > 0 ? (
                      taskMessagesData[selectedTask.id].map((item, index) => (
                        <div
                          key={index}
                          className={
                            "bg-blue-300  p-2 rounded-lg flex justify-between items-center" +
                            (item.senderId == userDetails.userId
                              ? " ms-64"
                              : " me-64")
                          }
                        >
                          <div>{item.msg}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              item.createdAt.seconds * 1000 +
                                item.createdAt.nanoseconds / 1000000
                            ).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="">No Messages</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex ">
              <div className="relative w-2/4">
                {isProgressOpen && (
                  <div
                    className="absolute bg-gray-300 w-full p-2 rounded-lg"
                    style={{ top: "-80px" }}
                  >
                    <div className="flex">
                      <input
                        type="range"
                        className="w-full"
                        value={progressRange}
                        min={0}
                        max={100 - selectedTask.progressPercentage}
                        onChange={(e) => setProgressRange(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        className="p-1 bg-blue-500 rounded-lg"
                        onClick={() => {
                          setIsProgressOpen(false);
                          if (progressRange != 0) {
                            setTaskMessage(progressRange);
                          } else {
                            setTaskMessage("");
                          }
                        }}
                      >
                        <span>{progressRange}</span> Add
                      </button>
                    </div>
                  </div>
                )}
                <button
                  className="w-full rounded-lg bg-green-500 px-4 py-2"
                  onClick={() => setIsProgressOpen((val) => !val)}
                >
                  Progress %
                </button>
              </div>
              <div className="flex w-full px-4">
                <input
                  type="text"
                  className="w-full py-2 border rounded-lg"
                  value={taskMessage}
                  onChange={(e) => {
                    setTaskMessage(e.target.value);
                  }}
                />
                <button className="ml-3 w-5 text-4xl" onClick={onSendProgress}>
                  <IoMdSend />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3">No Task selected</div>
        )}
      </div>
      {isSideBarOpen && (
        <div>
          <TaskSideBar
            isOpen={isSideBarOpen}
            projectId={projectId}
            onClose={() => {
              setIsSideBarOpen(false);
              setSideBarType("");
            }}
            fetchTaskData={fetchTaskData}
            typeOf={sideBarType}
            taskId={selectedTask.id}
          />
        </div>
      )}
    </div>
  );
}

export default Tasks;
