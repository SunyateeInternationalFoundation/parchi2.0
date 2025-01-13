import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

function CreateProject() {
  const { id } = useParams();
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  const navigate = useNavigate();

  const [projectForm, setProjectForm] = useState({
    status: "On-Going",
    location: "",
    description: "",
    name: "",
    dueDate: "",
    startDate: "",
    priority: "Low",
    budget: 0,
  });

  const [isMoreChecked, setIsMoreChecked] = useState(false);
  const [books, setBooks] = useState([]);

  const onSelectBook = (value) => {
    const bookRef = doc(
      db,
      "companies",
      companyDetails.companyId,
      "books",
      value
    );
    const bankBookName = books.find((book) => book.id === value).name;
    setProjectForm((prevData) => ({
      ...prevData,
      book: { bookRef, id: value, name: bankBookName },
    }));
  };

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, dateValue) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: Timestamp.fromDate(new Date(dateValue)),
    }));
  };

  const handleSubmit = async () => {
    if (!projectForm.name) {
      alert("Project name is required");
      return;
    }

    try {
      const companyRef = doc(db, "companies", companyDetails.companyId);
      let payload = {
        ...projectForm,
        companyName: companyDetails.name,
        companyRef,
        createdAt: Timestamp.fromDate(new Date()),
      };
      if (id) {
        await updateDoc(doc(db, "projects", id), projectForm);
      } else {
        await addDoc(collection(db, "projects"), payload);
      }
      alert(`Successfully  ${id ? "Edited" : "Created"} the Project`);
      navigate("./../");
    } catch (err) {
      console.error(err);
      alert(
        `Failed to  ${id ? "Edited" : "Created"} the project. Please try again.`
      );
    }
  };

  async function fetchBooks() {
    try {
      const bookRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "books"
      );
      const getBookData = await getDocs(bookRef);
      const fetchBooks = getBookData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(fetchBooks);
    } catch (error) {
      console.log("🚀 ~ fetchBooks ~ error:", error);
    }
  }

  function DateFormate(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getFullYear}-${getMonth}-${getDate}`;
  }
  useEffect(() => {
    fetchBooks();
  }, [companyDetails.companyId]);

  useEffect(() => {
    if (!id) {
      return;
    }
    async function fetchProject() {
      try {
        const getData = await getDoc(doc(db, "projects", id));
        const data = getData.data();
        console.log("🚀 ~ fetchProject ~ data:", data);

        setProjectForm(data);
      } catch (error) {
        console.log("🚀 ~ fetchProject ~ error:", error);
      }
    }
    fetchProject();
  }, [id]);

  return (
    <div
      className="p-8 pt-3 bg-gray-100"
      style={{ width: "100%", height: "92vh" }}
    >
      <header className="items-center my-2">
        <div className="flex space-x-3">
          <Link className="flex items-center " to={"./../"}>
            <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
          </Link>
          <h1 className="text-2xl font-bold">
            {id ? "Edit" : "Create"} Project
          </h1>
        </div>
      </header>
      <div>
        <div className="bg-white p-4 rounded-lg">
          <div>
            <label className="text-lg text-gray-600">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Project Name"
              className="text-base text-gray-900  border p-3 rounded-lg w-full mt-1"
              value={projectForm.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>
          <div className="my-5">
            <h2 className="mb-2">Timelines</h2>
            <div className="grid grid-cols-3 gap-4 rounded-lg">
              <div>
                <label className="text-gray-600">Start Date</label>
                <input
                  type="date"
                  className="border p-3 rounded-lg w-full mt-1"
                  defaultValue={DateFormate(projectForm.startDate) || ""}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-gray-600">Due Date</label>
                <input
                  type="date"
                  className="border p-3 rounded-lg w-full mt-1"
                  defaultValue={DateFormate(projectForm.dueDate) || ""}
                  onChange={(e) => handleDateChange("dueDate", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-600">Priority</label>
                <Select
                  value={projectForm.priority ?? "Low"}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"Select Priority"} />
                  </SelectTrigger>
                  <SelectContent className=" h-26">
                    <SelectItem value="Low"> Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center my-4">
          <div>More Details</div>
          <div>
            <label className="relative inline-block w-14 h-8">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isMoreChecked}
                onChange={(e) => {
                  setIsMoreChecked(e.target.checked);
                }}
              />
              <span className="absolute cursor-pointer inset-0 bg-[#9fccfa] rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] peer-focus:ring-2 peer-focus:ring-[#0974f1] peer-checked:bg-[#0974f1]"></span>
              <span className="absolute top-0 left-0 h-8 w-8 bg-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center peer-checked:translate-x-[1.6em]"></span>
            </label>
          </div>
        </div>
        {isMoreChecked && (
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg">
            <div className="space-y-1">
              <label className="text-lg text-gray-600">Bank/Book Details</label>
              <div>
                <Select
                  value={projectForm?.book?.id || ""}
                  onValueChange={(value) => onSelectBook(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"Select Filter"} />
                  </SelectTrigger>
                  <SelectContent className=" h-26">
                    {books.length > 0 &&
                      books.map((book, index) => (
                        <SelectItem value={book.id} key={index}>
                          {`${book.name} - ${book.bankName} - ${book.branch}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-lg text-gray-600">Budget</label>
              <input
                type="number"
                placeholder="Enter budget"
                className="text-base text-gray-900  border p-3 rounded-lg w-full mt-1"
                value={projectForm.budget || ""}
                onChange={(e) => handleInputChange("budget", +e.target.value)}
              />
            </div>
            <div>
              <label className="text-lg text-gray-600">Location</label>
              <input
                type="text"
                placeholder="Enter Location"
                className="text-base text-gray-900  border p-3 rounded-lg w-full mt-1"
                value={projectForm.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
            <div>
              <label className="text-lg text-gray-600">Description</label>
              <input
                type="text"
                placeholder="Enter Description"
                className="text-base text-gray-900  border p-3 rounded-lg w-full mt-1"
                value={projectForm.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <div className="flex gap-2">
            <button className="btn-add" onClick={handleSubmit}>
              <span className="text-lg">+</span> {id ? "Edit" : "Create"}{" "}
              Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProject;
