import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdDateRange } from "react-icons/md";
import { BsFolderPlus } from "react-icons/bs";
import { RiDeleteBin6Line, RiUserAddLine } from "react-icons/ri";
import { FaTasks } from "react-icons/fa";
import { IoWalletOutline } from "react-icons/io5";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { BsCalendar4 } from "react-icons/bs";
import { BsFileEarmarkCheck } from "react-icons/bs";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";
import {
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  deleteDoc,
  collection,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { TiMessages } from "react-icons/ti";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { TbEdit } from "react-icons/tb";
import { useSelector } from "react-redux";

function ProjectView() {
  const { id } = useParams();
  const [filter, setFilter] = useState("All");
  const [project, setProject] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [bankBooks, setBankBooks] = useState([]);
  const [totalAmounts, setTotalAmounts] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
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
  console.log("total amounts", totalAmounts);
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

  async function onChangeStatus(e) {
    try {
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, {
        status: e.target.value,
      });
      alert("Successfully Updated Status");
    } catch (error) {
      console.log("🚀 ~ onChangeStatus ~ error:", error);
    }
  }

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
    <div className="w-full" style={{ width: "100%" }}>
      <div className="px-8 pb-8 pt-2 bg-gray-100" style={{ width: "100%" }}>
        <div className="flex justify-between mt-5">
          <div className="flex">
            <div className="mr-5">
              <Link
                className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
                to="./../"
              >
                <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
              </Link>
            </div>
            {!isEdit ? (
              <div className="flex items-center ">
                <MdDateRange size={30} className="text-gray-700" />
                <span className="text-gray-700">Start Date : </span>{" "}
                {project.startDate}
              </div>
            ) : (
              <div className="flex items-center">
                <MdDateRange size={30} className="text-gray-700" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="border px-2 py-1 rounded"
                />
              </div>
            )}

            {!isEdit ? (
              <div className="flex items-center mx-10">
                <MdDateRange size={30} className="text-gray-700" />{" "}
                <span className="text-gray-700">End Date : </span>{" "}
                {project.dueDate}
              </div>
            ) : (
              <div className="flex items-center mx-10">
                <MdDateRange size={30} className="text-gray-700" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="border px-2 py-1 rounded"
                />
              </div>
            )}
          </div>

          <div>
            <select
              className="border-b-4 px-2 py-1 bg-transparent"
              onChange={onChangeStatus}
              defaultValue={project.status}
            >
              <option value="On-Going">On-Going</option>
              <option value="Delay">Delay</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {!isEdit ? (
          <div className="bg-white p-4 rounded-lg shadow my-4">
            <div className="border-b pb-3 h-8">Name: {project.name}</div>
            <div className="py-3 border-b">
              Description: {project.description || "-"}
            </div>
            {project?.book?.name ? (
              <div className="py-3 text-gray-600">
                Bank Book: {project.book.name}
              </div>
            ) : (
              <div className="py-3 text-gray-600">No Bank Book</div>
            )}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow my-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border w-full px-2 py-1 rounded"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border w-full px-2 py-1 rounded mt-3"
            />
            <div className="py-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Bank Book
              </label>
              <select
                value={formData.book?.id || ""}
                onChange={onSelectBook}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Bank Book</option>
                {bankBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid justify-items-end">
          {!isEdit ? (
            <div className="flex space-x-3">
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded-full flex items-center"
                onClick={() => setIsEdit(true)}
              >
                <TbEdit /> &nbsp; Edit
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded-full flex items-center"
                onClick={handleDelete}
              >
                <RiDeleteBin6Line />
              </button>
            </div>
          ) : (
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
