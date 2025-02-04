import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { BsBank, BsThreeDotsVertical } from "react-icons/bs";
import { LuUsersRound } from "react-icons/lu";
import { MdDateRange } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

function ProjectView({ projectDetails, refreshProject }) {
  const { id } = useParams();
  const [project, setProject] = useState(projectDetails);
  const [isOutlineDotsOpen, setIsOutlineDotsOpen] = useState(false);
  const [totalPersons, setTotalPersons] = useState(0);
  const [totalAmounts, setTotalAmounts] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        ?.companyDetails?.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.project;

  const handleUpdate = async (value) => {
    try {
      const projectDoc = doc(db, "projects", id);
      await updateDoc(projectDoc, { status: value });
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: projectDoc,
        date: serverTimestamp(),
        section: "Project",
        action: "Update",
        description: `${project?.name} status updated`,
      });
      setProject((val) => ({ ...val, status: value }));
      alert("Project updated successfully!");
      refreshProject();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update the project.");
    }
  };

  useEffect(() => {
    setProject(projectDetails);
    setTotalPersons(
      (projectDetails?.vendorRef?.length || 0) +
        (projectDetails?.customerRef?.length || 0) +
        (projectDetails?.staffRef?.length || 0)
    );
    fetchIncomeAndExpense();
  }, [projectDetails?.id]);

  async function fetchIncomeAndExpense() {
    try {
      const expensesRef = collection(db, "companies", companyId, "expenses");
      const q = query(
        expensesRef,
        where("projectRef", "==", doc(db, "projects", id))
      );
      const querySnapshot = await getDocs(q);
      const totalAmountData = {
        income: 0,
        expense: 0,
        balance: 0,
      };
      querySnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.transactionType === "income") {
          totalAmountData.income += +data.amount;
          totalAmountData.balance += +data.amount;
        } else if (data.transactionType === "expense") {
          totalAmountData.expense += +data.amount;
          totalAmountData.balance -= +data.amount;
        }
      });
      setTotalAmounts(totalAmountData);
    } catch (error) {
      console.log("Error in fetching total balance:", error);
    }
  }

  const navigate = useNavigate();

  async function handleDelete() {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Project?"
      );
      if (!confirmDelete) return;
      const projectRef = doc(db, "projects", id);
      await deleteDoc(projectRef);
      await addDoc(collection(db, "companies", companyId, "audit"), {
        ref: projectRef,
        date: serverTimestamp(),
        section: "Project",
        action: "Delete",
        description: `${project?.name} project deleted`,
      });
      navigate("/projects");
    } catch (error) {
      console.log("🚀 ~ onHandleDeleteVendor ~ error:", error);
    }
  }

  return (
    <div className="w-full ">
      <div
        className="px-8 pb-6 "
        onClick={() => {
          if (isOutlineDotsOpen) {
            setIsOutlineDotsOpen(false);
          }
        }}
      >
        <div className="grid grid-cols-4 gap-8  py-6">
          <div className="rounded-lg p-5 bg-white shadow  ">
            <div className="text-lg">Income Amount</div>
            <div className="text-3xl text-indigo-600 font-bold p-2">
              ₹ {totalAmounts.income}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Expense Amount</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {" "}
              ₹ {totalAmounts.expense}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Current Amount</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              ₹ {totalAmounts.balance}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg">Budget Amount</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              ₹ {project?.budget || 0}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg px-6 py-4 shadow flex">
          <div className="uppercase rounded-lg border text-6xl bg-[rgb(159,142,247)] flex justify-center items-center w-40 h-40">
            {project?.name?.slice(0, 2)}
          </div>
          <div className="ps-3 w-full">
            <div className="flex items-center">
              <div className="text-xl font-semibold w-full">
                <div className="w-full px-2 py-1 rounded">{project?.name}</div>
              </div>

              <div
                className={
                  "rounded-lg  w-fit p-2 text-xs me-2 " +
                  (project?.priority == "Low"
                    ? "bg-green-100"
                    : project?.priority == "Medium"
                    ? "bg-blue-100"
                    : "bg-red-100")
                }
              >
                {project?.priority}
              </div>

              <div
                className={
                  "rounded-lg " +
                  (project?.status == "Completed"
                    ? "bg-green-100"
                    : project?.status == "On-Going"
                    ? "bg-blue-100"
                    : "bg-red-100")
                }
              >
                <Select
                  value={project?.status}
                  onValueChange={(val) => {
                    handleUpdate(val);
                  }}
                  required
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="w-32 h-18">
                    <SelectItem value="On-Going">On-Going</SelectItem>
                    <SelectItem value="Delay">Delay</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative ">
                <div
                  onClick={() => {
                    setIsOutlineDotsOpen(!isOutlineDotsOpen);
                  }}
                >
                  <BsThreeDotsVertical className="w-6 h-6 " />
                </div>
                {isOutlineDotsOpen && (
                  <div className="absolute bg-white  p-1 right-1 cursor-pointer border-2 rounded-lg">
                    {(userDetails.selectedDashboard === "" || role?.edit) && (
                      <div
                        className="pe-14 py-1 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                        onClick={() => navigate("edit-project")}
                      >
                        <TbEdit className="text-green-600" />
                        <div>Edit</div>
                      </div>
                    )}
                    {(userDetails.selectedDashboard === "" || role?.delete) && (
                      <div
                        className="py-1 pe-14 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                        onClick={handleDelete}
                      >
                        <RiDeleteBin6Line className="text-red-500" />
                        <div> Delete</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <div className="text-ellipsis mt-1 max-h-12 min-h-12 w-full px-2 py-1">
                {project.description}
              </div>
            </div>
            <div className="flex items-center space-x-5 mt-3">
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <MdDateRange size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Assigned Date</div>
                  <div className="font-semibold text-sm">
                    {project?.startDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <MdDateRange size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Due Date</div>
                  <div className="font-semibold text-sm">
                    {project?.dueDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <BsBank size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Bank</div>
                  <div className="font-semibold text-sm">
                    {project?.book?.name || "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <LuUsersRound size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Total Person</div>
                  <div className="font-semibold text-sm">{totalPersons}</div>
                </div>
              </div>
              <div>
                <div>
                  <div className="relative w-max-content flex -space-x-3 avatarGroup items-center">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white ring-offset-[2px] ring-offset-white hover:z-10">
                      {/* <img className="aspect-square h-full w-full" src="/_next/static/media/avatar-5.55d8974c.jpg"> */}
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm bg-red-200">
                        A
                      </span>
                    </span>
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white ring-offset-[2px] ring-offset-white hover:z-10">
                      {/* <img className="aspect-square h-full w-full" src="/_next/static/media/avatar-6.513b01f7.jpg"> */}
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm bg-blue-200">
                        B
                      </span>
                    </span>
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white ring-offset-[2px] ring-offset-white hover:z-10">
                      {/* <img className="aspect-square h-full w-full" src="/_next/static/media/avatar-7.82cf057d.jpg"> */}
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm bg-green-300">
                        C
                      </span>
                    </span>
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white ring-offset-[2px] ring-offset-white">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm bg-gray-300">
                        +4
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
ProjectView.propTypes = {
  projectDetails: PropTypes.object,
  refreshProject: PropTypes.func,
};

export default ProjectView;
