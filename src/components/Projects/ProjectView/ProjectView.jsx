import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
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

function ProjectView({ projectDetails, refreshProject }) {
  const { id } = useParams();
  const [project, setProject] = useState(projectDetails);
  const [isEdit, setIsEdit] = useState(false);
  const [isOutlineDotsOpen, setIsOutlineDotsOpen] = useState(false);
  const [bankBooks, setBankBooks] = useState([]);
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

  const handleUpdate = async () => {
    try {
      const projectDoc = doc(db, "projects", id);
      const updatedData = {
        ...formData,
        startDate: formData.startDate
          ? Timestamp.fromDate(new Date(formData.startDate))
          : null,
        dueDate: formData.dueDate
          ? Timestamp.fromDate(new Date(formData.dueDate))
          : null,
        book: formData.book ?? null,
      };
      await updateDoc(projectDoc, updatedData);
      alert("Project updated successfully!");
      setIsEdit(false);
      refreshProject();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update the project.");
    }
  };

  useEffect(() => {
    setFormData({
      name: projectDetails?.name || "",
      description: projectDetails?.description || "",
      startDate: projectDetails?.startDate,
      dueDate: projectDetails?.dueDate,
      book: projectDetails?.book,
    });

    setProject(projectDetails);
    setTotalPersons(
      (projectDetails?.vendorRef?.length || 0) +
        (projectDetails?.customerRef?.length || 0) +
        (projectDetails?.staffRef?.length || 0)
    );
    fetchBankBooks();
    fetchIncomeAndExpense();
  }, [projectDetails?.id]);

  async function fetchBankBooks() {
    const bankBookRef = collection(
      db,
      "companies",
      userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId,
      "books"
    );
    const getBankBooks = await getDocs(bankBookRef);
    const bankBooksData = getBankBooks.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBankBooks(bankBooksData);
  }

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
      const totalData = querySnapshot.docs.map((doc) => {
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

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleDelete() {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Project?"
      );
      if (!confirmDelete) return;
      await deleteDoc(doc(db, "projects", id));
      navigate("/projects");
    } catch (error) {
      console.log("🚀 ~ onHandleDeleteVendor ~ error:", error);
    }
  }

  function onSelectBook(e) {
    const { value } = e.target;
    const bankName = bankBooks.find((ele) => ele.id === value).name;
    const payload = {
      bookRef: doc(
        db,
        "companies",
        userDetails?.companies[userDetails.selectedCompanyIndex]?.companyId,
        "books",
        value
      ),
      id: value,
      name: bankName,
    };
    setFormData((val) => ({ ...val, book: payload }));
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
        <div className="bg-white rounded-lg px-6 py-4  flex">
          <div className="uppercase rounded-lg border p-8 text-6xl bg-[rgb(159,142,247)] flex justify-center items-center">
            {project?.name?.slice(0, 2)}
          </div>
          <div className="ps-3 w-full">
            <div className="flex ">
              <div className="text-xl font-semibold w-full">
                {isEdit ? (
                  <input
                    type="text"
                    name="name"
                    value={formData?.name || ""}
                    onChange={handleChange}
                    className={
                      "w-full px-2 py-1 rounded focus:outline-none border-2"
                    }
                  />
                ) : (
                  <div className="w-full px-2 py-1 rounded">
                    {project?.name}
                  </div>
                )}
              </div>
              {!isEdit ? (
                <div className="w-24 flex item-center justify-center text-xs h-fit ">
                  <div
                    className={
                      "rounded-full px-2 py-1 font-bold " +
                      (project?.priority == "Low"
                        ? "bg-green-100"
                        : project?.priority == "Medium"
                        ? "bg-blue-100"
                        : "bg-red-100")
                    }
                  >
                    {project?.priority}
                  </div>
                </div>
              ) : (
                <select
                  className="px-2 py-1 border-2 rounded-lg ms-2"
                  name="priority"
                  defaultValue={project?.priority}
                  onChange={handleChange}
                >
                  <option value={"Low"}>Low</option>
                  <option value={"Medium"}>Medium</option>
                  <option value={"High"}>High</option>
                </select>
              )}
              {!isEdit ? (
                <div className="w-24 flex item-center justify-center text-xs h-fit ">
                  <div
                    className={
                      "rounded-full px-2 py-1 font-bold " +
                      (project?.status == "Completed"
                        ? "bg-green-100"
                        : project?.status == "On-Going"
                        ? "bg-blue-100"
                        : "bg-red-100")
                    }
                  >
                    {project?.status}
                  </div>
                </div>
              ) : (
                <select
                  className="px-2 py-1 border-2 rounded-lg ms-2"
                  name="status"
                  onChange={handleChange}
                  defaultValue={project?.status}
                >
                  <option value="On-Going">On-Going</option>
                  <option value="Delay">Delay</option>
                  <option value="Completed">Completed</option>
                </select>
              )}
              {!isEdit && (
                <div className="relative ">
                  <div
                    className=""
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
                          onClick={() => setIsEdit(true)}
                        >
                          <TbEdit className="text-green-600" />
                          <div>Edit</div>
                        </div>
                      )}
                      {(userDetails.selectedDashboard === "" ||
                        role?.delete) && (
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
              )}
            </div>
            <div className="text-sm text-gray-500">
              {!isEdit ? (
                <div className="text-ellipsis mt-1 max-h-12 min-h-12 w-full px-2 py-1">
                  {project.description}
                </div>
              ) : (
                <textarea
                  name="description"
                  defaultValue={formData?.description}
                  onChange={handleChange}
                  className={
                    "w-full px-2 py-1 rounded focus:outline-none mt-1 max-h-12 min-h-12 resize-none " +
                    (isEdit
                      ? "border-2"
                      : "overflow-y-hidden hover:overflow-y-auto")
                  }
                  readOnly={!isEdit}
                />
              )}
            </div>
            <div className="flex items-center space-x-5 mt-3">
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <MdDateRange size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Assigned Date</div>
                  <div className="font-semibold text-sm">
                    {!isEdit ? (
                      project?.startDate
                    ) : (
                      <input
                        type="date"
                        defaultValue={formData?.startDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className={"w-full rounded focus:outline-none border-2"}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <MdDateRange size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Due Date</div>
                  <div className="font-semibold text-sm">
                    {!isEdit ? (
                      project?.dueDate
                    ) : (
                      <input
                        type="date"
                        defaultValue={formData?.dueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                        className="w-full rounded focus:outline-none border-2"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                <BsBank size={30} className="text-gray-700" />
                <div>
                  <div className="text-gray-700 text-sm">Bank</div>
                  <div className="font-semibold text-sm">
                    {!isEdit ? (
                      project?.book?.name || "-"
                    ) : (
                      <select
                        defaultValue={formData?.book?.id || ""}
                        onChange={onSelectBook}
                        className={
                          "w-full px-2 py-1 rounded focus:outline-none " +
                          (isEdit && "border-2")
                        }
                      >
                        <option value="" disabled>
                          Select Bank
                        </option>
                        {bankBooks.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.name}
                          </option>
                        ))}
                      </select>
                    )}
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

        <div className="grid justify-items-end pt-2">
          {isEdit && (
            <div>
              <button
                className="px-4 py-1 bg-green-500 text-white rounded-full"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="px-4 py-1 bg-gray-500 text-white rounded-full ml-2"
                onClick={() => {
                  setFormData({
                    name: projectDetails?.name || "",
                    description: projectDetails?.description || "",
                    startDate: projectDetails?.startDate,
                    dueDate: projectDetails?.dueDate,
                    book: projectDetails?.book,
                  });
                  setIsEdit(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* <div className="p-5 bg-white shadow rounded-lg mt-4">
          <div className="mb-4">Manage Project</div>
          <div className="grid grid-cols-4 gap-4 gap-y-8">
            {manageItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center cursor-pointer"
                onClick={item.onClick}
              >
                <div className="text-3xl bg-gray-200 p-3 rounded-lg">
                  {item.icon}
                </div>
                <p className="text-sm text-center mt-1">{item.name}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
ProjectView.propTypes = {
  projectDetails: PropTypes.object,
  refreshProject: PropTypes.func,
};

export default ProjectView;
