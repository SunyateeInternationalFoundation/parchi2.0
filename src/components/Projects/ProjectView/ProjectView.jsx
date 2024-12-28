import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import {
  BsBank,
  BsCalendar4,
  BsFileEarmarkCheck,
  BsFolderPlus,
} from "react-icons/bs";
import { FaArrowDown, FaArrowUp, FaTasks } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { IoWalletOutline } from "react-icons/io5";
import { LuUsersRound } from "react-icons/lu";
import { MdDateRange } from "react-icons/md";
import { RiDeleteBin6Line, RiUserAddLine } from "react-icons/ri";
import { TbEdit } from "react-icons/tb";
import { TiMessages } from "react-icons/ti";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";

function ProjectView() {
  const { id } = useParams();
  const [filter, setFilter] = useState("All");
  const [project, setProject] = useState({});
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
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }
  let role =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]?.roles
      ?.approvals;

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
      fetchData();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update the project.");
    }
  };

  function DateFormate(timestamp, format = "dd/mm/yyyy") {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return format === "yyyy-mm-dd"
      ? `${getFullYear}-${getMonth}-${getDate}`
      : `${getDate}/${getMonth}/${getFullYear}`;
  }

  useEffect(() => {
    fetchData();
    fetchBankBooks();
    fetchIncomeAndExpense();
  }, [id]);

  async function fetchData() {
    const getData = await getDoc(doc(db, "projects", id));
    const data = getData.data();
    const payload = {
      ...data,
      companyRef: data.companyRef.id,
      createdAt: DateFormate(data.createdAt),
      startDate: DateFormate(data.startDate, "yyyy-mm-dd"),
      dueDate: DateFormate(data.dueDate, "yyyy-mm-dd"),
      vendorRef: data?.vendorRef?.map((ref) => ref.id),
      customerRef: data?.customerRef?.map((ref) => ref.id),
      staffRef: data?.staffRef?.map((ref) => ref.id),
      book: data?.book,
    };
    setFormData({
      name: payload.name || "",
      description: payload.description || "",
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      book: payload.book,
    });
    setProject(payload);
    setTotalPersons(
      (payload.vendorRef?.length || 0) +
        (payload.customerRef?.length || 0) +
        (payload.staffRef?.length || 0)
    );
  }

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
  const manageProjectItems = [
    {
      name: "Users",
      icon: <RiUserAddLine />,
      onClick: () => navigate("user"),
    },
    {
      name: "Milestones",
      icon: <BsCalendar4 />,
      onClick: () => {
        navigate("milestones");
      },
    },
    {
      name: "Tasks",
      icon: <FaTasks />,
      onClick: () => {
        navigate("tasks");
      },
    },
    {
      name: "Files",
      icon: <BsFolderPlus />,
      onClick: () => {
        navigate("files");
      },
    },
    {
      name: "Approvals",
      icon: <BsFileEarmarkCheck />,
      onClick: () => {
        navigate("approvals");
      },
    },
    {
      name: "Chat",
      icon: <TiMessages />,
      onClick: () => {
        navigate("chats");
      },
    },
    {
      name: "Payments",
      icon: <IoWalletOutline />,
      onClick: () => {
        if (!project?.book?.id) {
          alert("Please select a bank book before proceeding to payments.");
        } else {
          navigate("payments");
        }
      },
    },

    {
      name: "Items",
      icon: <HiOutlineShoppingCart />,
      onClick: () => {
        navigate("items");
      },
    },
  ];
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
    <div
      className="w-full overflow-y-auto"
      style={{ width: "100%", height: "92vh" }}
      onClick={() => {
        if (isOutlineDotsOpen) {
          setIsOutlineDotsOpen(false);
        }
      }}
    >
      <div className="px-8 pb-8 pt-2 bg-gray-100" style={{ width: "100%" }}>
        <div className="bg-white rounded-lg">
          <div className="flex justify-between items-center p-4">
            <div className="text-2xl font-semibold flex">
              <Link className="flex items-center px-2" to="./../">
                <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
              </Link>
              {project.name}
            </div>
            <div className="relative">
              <div
                className="bg-gray-100 p-2 rounded-lg"
                onClick={() => {
                  setIsOutlineDotsOpen(!isOutlineDotsOpen);
                }}
              >
                <HiOutlineDotsHorizontal className="w-6 h-6 " />
              </div>
              {isOutlineDotsOpen && (
                <div className="absolute bg-white  p-1 right-1 cursor-pointer border-2 rounded-lg">
                  <div
                    className="pe-14 py-1 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                    onClick={() => setIsEdit(true)}
                  >
                    <TbEdit className="text-green-600" />
                    <div>Edit</div>
                  </div>
                  <div
                    className="py-1 pe-14 ps-2 hover:bg-gray-300 rounded-lg space-x-1 flex items-center"
                    onClick={handleDelete}
                  >
                    <RiDeleteBin6Line className="text-red-500" />
                    <div> Delete</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t-2 px-6 py-4 flex">
            <div className="uppercase rounded-lg border p-8 text-6xl bg-[rgb(159,142,247)] flex justify-center items-center">
              {project.name?.slice(0, 2)}
            </div>
            <div className="px-3 w-full">
              <div className="flex">
                <div className="text-xl font-semibold w-full">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={
                      "w-full px-2 py-1 rounded focus:outline-none " +
                      (isEdit && "border-2")
                    }
                    readOnly={!isEdit}
                  />
                </div>
                {!isEdit ? (
                  <div className="w-24 flex item-center justify-center text-xs h-fit ">
                    <div
                      className={
                        "rounded-full px-2 py-1 font-bold " +
                        (project.priority == "Low"
                          ? "bg-green-100"
                          : project.priority == "Medium"
                          ? "bg-blue-100"
                          : "bg-red-100")
                      }
                    >
                      {project.priority}
                    </div>
                  </div>
                ) : (
                  <select
                    className="px-2 py-1 border-2 rounded-lg ms-2"
                    name="priority"
                    defaultValue={project.priority}
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
                        (project.status == "Completed"
                          ? "bg-green-100"
                          : project.status == "On-Going"
                          ? "bg-blue-100"
                          : "bg-red-100")
                      }
                    >
                      {project.status}
                    </div>
                  </div>
                ) : (
                  <select
                    className="px-2 py-1 border-2 rounded-lg ms-2"
                    name="status"
                    onChange={handleChange}
                    defaultValue={project.status}
                  >
                    <option value="On-Going">On-Going</option>
                    <option value="Delay">Delay</option>
                    <option value="Completed">Completed</option>
                  </select>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {!isEdit ? (
                  <div className="text-ellipsis mt-1 max-h-12 min-h-12 w-full px-2 py-1">
                    {formData.description}
                  </div>
                ) : (
                  <textarea
                    name="description"
                    value={formData.description}
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
                        project.startDate
                      ) : (
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className={
                            "w-full rounded focus:outline-none border-2"
                          }
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
                        project.dueDate
                      ) : (
                        <input
                          type="date"
                          value={formData.dueDate}
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
                          value={formData.book?.id || ""}
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
                onClick={() => setIsEdit(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className=" bg-white shadow rounded-lg mt-4">
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
                    (filter === "Today" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Today")}
                >
                  Today
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Week" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Week")}
                >
                  Week
                </button>
                <button
                  className={
                    "px-4 py-1" +
                    (filter === "Month" ? " bg-gray-300 rounded-full" : "")
                  }
                  onClick={() => setFilter("Month")}
                >
                  Month
                </button>
              </div>
              <FaFilter />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="">
                <div className="flex items-center py-2">
                  <div className="text-green-500 p-3 bg-sky-100 rounded-lg">
                    <FaArrowDown />
                  </div>
                  <span className="font-bold ml-5">Income</span>
                </div>
                <div>{totalAmounts.income}</div>
              </div>
              <div className="">
                <div className="flex items-center py-2">
                  <span className=" font-bold mr-5">Expense</span>
                  <div className="text-red-500 p-3 bg-red-200 rounded-lg">
                    <FaArrowUp />
                  </div>
                </div>

                <div className="text-end">{totalAmounts.expense}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between bg-green-500  text-center mt-4 p-2 rounded-b-lg">
            <div>Balance</div>
            <div>{totalAmounts.balance}</div>
          </div>
        </div>

        <div className="p-5 bg-white shadow rounded-lg mt-4">
          <div className="mb-4">Manage Project</div>
          <div className="grid grid-cols-4 gap-4 gap-y-8">
            {manageProjectItems.map((item) => (
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
        </div>
      </div>
    </div>
  );
}

export default ProjectView;
