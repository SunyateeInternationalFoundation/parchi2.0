import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
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

function TaskSideBar({
  isOpen,
  onClose,
  typeOf,
  fetchTaskData,
  taskId,
  projectId,
  projectName,
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
      let payloadTask = {
        ref: "",
        date: serverTimestamp(),
        section: "Project",
        action: "Create",
        description: `${formData.name} task created in ${projectName}`,
      };
      if (typeOf === "CreateTask") {
        const payload = {
          ...formData,
          projectRef,
          createdAt: Timestamp.fromDate(new Date()),
        };
        const taskRef = collection(db, "projects", projectId, "tasks");
        const ref = await addDoc(taskRef, payload);

        payloadTask.ref = ref;
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
        payloadTask.ref = taskRef;
        payloadTask.action = "Update";
        payloadTask.description = `${formData.name} task updated in ${projectName}`;
        alert("Successfully Updated");
      }
      await addDoc(
        collection(
          db,
          "companies",
          userDetails.companies[userDetails.selectedCompanyIndex].companyId,
          "audit"
        ),
        payloadTask
      );
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
        className={`bg-white  pt-2 transform transition-transform  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxHeight: "100vh", width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center border-b px-5 py-3"
          style={{ height: "6vh" }}
        >
          <h2 className="text-xl font-semibold ">{typeOf}</h2>
          <button
            onClick={onClose}
            className=" text-2xl text-gray-800 hover:text-gray-900 cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <form className="space-y-1.5" onSubmit={onSubmit}>
          <div
            className="space-y-2 px-5 overflow-y-auto"
            style={{ height: "84vh" }}
          >
            {typeOf === "CreateTask" && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Task Name</label>
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
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Description</label>
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
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Priority</label>

                  <Select
                    value={formData?.priority}
                    onValueChange={(val) => {
                      setFormData((pre) => ({
                        ...pre,
                        priority: val,
                      }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent className=" h-18">
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Start Date</label>

                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !formData.startDate?.seconds &&
                              "text-muted-foreground"
                          )}
                        >
                          {formData.startDate?.seconds ? (
                            formatDate(
                              new Date(
                                formData.startDate?.seconds * 1000 +
                                  formData.startDate?.nanoseconds / 1000000
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
                              formData.startDate?.seconds * 1000 +
                                formData.startDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setFormData((pre) => ({
                              ...pre,
                              startDate: Timestamp.fromDate(new Date(val)),
                            }));
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">End Date</label>

                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex justify-between items-center input-tag ",
                            !formData.endDate?.seconds &&
                              "text-muted-foreground"
                          )}
                        >
                          {formData.endDate?.seconds ? (
                            formatDate(
                              new Date(
                                formData.endDate?.seconds * 1000 +
                                  formData.endDate?.nanoseconds / 1000000
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
                              formData.endDate?.seconds * 1000 +
                                formData.endDate?.nanoseconds / 1000000
                            )
                          }
                          onSelect={(val) => {
                            setFormData((pre) => ({
                              ...pre,
                              endDate: Timestamp.fromDate(new Date(val)),
                            }));
                          }}
                          initialFocus
                          required
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
            {typeOf === "AddMileStone" && (
              <div className="mt-10 space-y-2">
                {milestoneData.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b-2 my-2 items-center"
                  >
                    <div className="space-y-1">
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
              <div className="mt-10 space-y-2">
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
          </div>
          <div
            className="w-full border-t bg-white sticky bottom-0 px-5 py-3"
            style={{ height: "6vh" }}
          >
            <button type="submit" className="w-full btn-add">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskSideBar;
