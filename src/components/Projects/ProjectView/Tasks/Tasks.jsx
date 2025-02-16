import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { MdOutlineShowChart } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FormatTimestamp from "../../../../constants/FormatTimestamp";
import { db } from "../../../../firebase";
import { cn, formatDate } from "../../../../lib/utils";
import { Calendar } from "../../../UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../UI/select";
import TaskSideBar from "./TaskSideBar";

function Tasks({ projectName }) {
  const { id } = useParams();
  const projectId = id;
  const userDetails = useSelector((state) => state.users);
  const staffDetails = userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
  const role =
    staffDetails?.roles
      ?.tasks;
  const [filter, setFilter] = useState("All");
  const [tasksDetails, setTasksDetails] = useState([]);
  const [filterTasksDetails, setFilterTasksDetails] = useState([]);
  const [selectedTask, setSelectedTask] = useState({});
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressRange, setProgressRange] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [sideBarType, setSideBarType] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [taskMessagesData, setTaskMessagesData] = useState({});
  const containerRef = useRef(null);

  async function fetchTaskData() {

    if (userDetails.selectedDashboard === "staff" && !staffDetails?.phone) {
      return
    }
    try {
      const projectRef = collection(db, "projects", projectId, "tasks");
      let querySnapshot
      if (userDetails.selectedDashboard === "staff") {
        const q = query(projectRef, where("addedStaffs", "array-contains", staffDetails?.phone))
        querySnapshot = await getDocs(q);
      } else {
        querySnapshot = await getDocs(projectRef);
      }
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("🚀 ~ tasksData ~ tasksData:", tasksData)
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
    } catch (error) {
      console.log("🚀 ~ fetchTaskData ~ error:", error);
    }
  }

  async function modifiedTask(field, value) {
    try {
      const taskRef = doc(db, "projects", projectId, "tasks", selectedTask.id);
      await updateDoc(taskRef, { [field]: value });
      await addDoc(
        collection(
          db,
          "companies",
          userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
            .companyDetails.companyId,
          "audit"
        ),
        {
          ref: taskRef,
          date: serverTimestamp(),
          section: "Project",
          action: "Update",
          description: `${value} task updated in ${projectName}`,
        }
      );
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
        senderPhone: userDetails.phone,
        msg: taskMessage,
      };

      await addDoc(collection(taskRef, "taskMessages"), payloadTaskMSG);

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
      onSnapshot(q, (snapshot) => {
        const fetchTaskMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTaskMessagesData((val) => ({
          ...val,
          [selectedTask.id]: fetchTaskMessages,
        }));
      });
    } catch (error) {
      console.log("🚀 ~ fetchTaskMessagesData ~ error:", error);
    }
  }

  useEffect(() => {
    fetchTaskData();
  }, [staffDetails]);

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
    fetchTaskMessagesData();
    setProgressRange(0);
    setIsProgressOpen(false);
    setTaskMessage("");
  }, [selectedTask]);


  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [taskMessagesData[selectedTask.id]]);

  return (
    <div className="w-full bg-gray-100 overflow-y-auto">
      <div
        className="w-full grid grid-cols-2 overflow-y-auto"
        style={{ height: "82vh" }}
      >
        <div
          className="p-3 border-r-2  overflow-y-auto bg-white"
          style={{ height: "82vh" }}
        >
          <div className="flex justify-between  py-2 ">
            <div className="flex space-x-3">
              <h2 className="text-xl font-semibold ">TASKS</h2>
            </div>

            {(userDetails.selectedDashboard === "" || role?.access) && (
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
            )}
          </div>
          <div className="bg-white py-4 border-y ">
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
          <div className="flex justify-between my-2 ">
            <div className="flex justify-around text-gray-600 space-x-4">
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (filter === "All" ? " bg-black text-white rounded-full" : "")
                }
                onClick={() => setFilter("All")}
              >
                All
              </button>
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (filter === "Delay"
                    ? " bg-black text-white rounded-full"
                    : "")
                }
                onClick={() => setFilter("Delay")}
              >
                Delay
              </button>
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (filter === "On-Going"
                    ? " bg-black text-white rounded-full"
                    : "")
                }
                onClick={() => setFilter("On-Going")}
              >
                On-Going
              </button>
              <button
                className={
                  "px-4 py-1 text-gray-600  rounded-md border hover:bg-black hover:text-white " +
                  (filter === "Completed"
                    ? " bg-black text-white rounded-full"
                    : "")
                }
                onClick={() => setFilter("Completed")}
              >
                Completed
              </button>
            </div>
            <FaFilter />
          </div>
          <div
            className="bg-white rounded-lg overflow-y-auto"
            style={{ height: "50vh" }}
          >
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Task
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Date
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-start">
                    Status
                  </td>
                </tr>
              </thead>
              <tbody>
                {filterTasksDetails.length > 0 ? (
                  filterTasksDetails.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                      }}
                    >
                      <td className="px-8 py-3 text-start">{task.name}</td>

                      <td className="px-5 py-3 text-start">
                        <FormatTimestamp timestamp={task.startDate} />
                      </td>

                      <td className="px-5 py-3 text-start">{task.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="h-24 text-center py-4">
                      No Tasks Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {selectedTask.id ? (
          <div
            className="px-4 overflow-y-auto bg-white"
            style={{ height: "82vh" }}
          >
            <div className="mt-2 flex justify-between items-center cursor-pointer border-b">
              <div className="text-lg">{selectedTask.name}</div>
              <Select
                defaultValue={selectedTask.status}
                onValueChange={(val) => {
                  modifiedTask("status", val);
                }}
              >
                <SelectTrigger className="w-48 h-8 mb-2">
                  <SelectValue placeholder=" Select PurchasePriceTaxType" />
                </SelectTrigger>
                <SelectContent className="h-18">
                  <SelectItem value="On-Going">On-Going</SelectItem>
                  <SelectItem value="Delay">Delay</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className=" p-2 border-b">
              <div className="flex justify-between ">
                <div className="flex items-center">
                  <div className="w-32">Start Date: </div>
                  <div className="w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            (!selectedTask.startDate?.seconds &&
                              " text-muted-foreground")
                          )}
                        >
                          {selectedTask.startDate?.seconds ? (
                            formatDate(
                              new Date(
                                selectedTask.startDate?.seconds * 1000 +
                                selectedTask.startDate?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span className="text-gray-600">Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              selectedTask.startDate?.seconds * 1000 +
                              selectedTask.startDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            modifiedTask(
                              "startDate",
                              Timestamp.fromDate(new Date(val))
                            );
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 ">End Date: </div>
                  <div className="w-full ">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !selectedTask.endDate?.seconds &&
                            "text-muted-foreground"
                          )}
                        >
                          {selectedTask.endDate?.seconds ? (
                            formatDate(
                              new Date(
                                selectedTask.endDate?.seconds * 1000 +
                                selectedTask.endDate?.nanoseconds / 1000000
                              ),
                              "PPP"
                            )
                          ) : (
                            <span className="text-gray-600">Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 " />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="">
                        <Calendar
                          mode="single"
                          selected={
                            new Date(
                              selectedTask.endDate?.seconds * 1000 +
                              selectedTask.endDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            modifiedTask(
                              "endDate",
                              Timestamp.fromDate(new Date(val))
                            );
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <div className="w-full border-r-2">
                  <div className="flex items-center justify-between mr-2">
                    <span className="text-blue-700 font-bold">Progress</span>
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
            <div className="p-4  my-2 border-b" style={{ height: "48vh" }}>
              <div
                ref={containerRef}
                className="flex  flex-col-reverse  overflow-y-auto"
                style={{ height: "44vh" }}
              >
                <div>
                  <div className="space-y-3">
                    {taskMessagesData[selectedTask.id]?.length > 0 ? (
                      taskMessagesData[selectedTask.id].map((item, index) => (
                        <div
                          key={index}
                          className={
                            "bg-blue-300  p-2 rounded-lg flex justify-between" +
                            (item.senderId == userDetails.userId
                              ? " ms-64"
                              : " me-64")
                          }
                        >
                          <div>
                            {item.senderId !== userDetails.userId && <div className="text-xs text-gray-500">{item.senderPhone}</div>}
                            <div>{item.msg}</div>
                          </div>
                          <div className="flex items-end  text-end">
                            <div className="text-xs text-gray-500 ">
                              {new Date(
                                item.createdAt.seconds * 1000 +
                                item.createdAt.nanoseconds / 1000000
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>No Messages</div>
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
                  className="w-full p-2 border rounded-lg "
                  value={taskMessage}
                  onChange={(e) => {
                    setTaskMessage(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSendProgress();
                    }
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
            projectName={projectName}
          />
        </div>
      )}
    </div>
  );
}

export default Tasks;
