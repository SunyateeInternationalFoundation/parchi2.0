import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
function Projects({ companyDetails, isStaff }) {
  const userDetails = useSelector((state) => state.users);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(!true);
  const [projectsList, setProjectsList] = useState([]);
  const [modifiedProjectsList, setModifiedProjectsList] = useState([]);
  const [projectCount, setProjectCount] = useState({
    onGoing: 0,
    completed: 0,
    delay: 0,
    total: 0,
  });
  // const [filterDate, setFilterDate] = useState({ from: "", to: "" });
  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchProjectsList() {
      try {
        const companyRef = doc(db, "companies", companyId);

        const projectRef = collection(db, "projects");

        const q = query(projectRef, where("companyRef", "==", companyRef));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map((doc) => {
          const { projectMembers, companyRef, createdAt, ...rest } = doc.data();
          return {
            ...rest,
            projectId: doc.id,
            companyRef: companyRef.id,
            createdAt: DateFormate(createdAt),
            startDate: DateFormate(rest.startDate),
            dueDate: DateFormate(rest.dueDate),
            vendorRef: rest?.vendorRef?.map((ref) => ref.id),
            customerRef: rest?.customerRef?.map((ref) => ref.id),
            staffRef: rest?.staffRef?.map((ref) => ref.id),
          };
        });

        setProjectsList(projectsData);
        setModifiedProjectsList(projectsData);
        let onGoing = 0;
        let delay = 0;
        let completed = 0;
        for (const project of projectsData) {
          if (project.status === "On-Going") {
            ++onGoing;
          } else if (project.status === "Delay") {
            ++delay;
          } else {
            ++completed;
          }
        }
        setProjectCount({
          onGoing,
          completed,
          delay,
          total: projectsData.length,
        });
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectsList();
  }, [userDetails.companies]);

  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}/${getMonth}/${getFullYear}`;
  }

  function isDueDateEnd(timestamp) {
    const timestampDate = new Date(timestamp);

    const currentDate = new Date();
    return timestampDate < currentDate;
  }

  const [searchInput, setSearchInput] = useState("");

  function onSearchFilter(e) {
    setSearchInput(e.target.value);
  }

  // function onDateChange(e) {
  //   const { name, value } = e.target;
  //   setFilterDate((prev) => ({ ...prev, [name]: value }));
  // }

  // function resetDateFilter() {
  //   setFilterDate({ from: "", to: "" });
  // }

  useEffect(() => {
    function onFilterFun() {
      const filterData = projectsList.filter((ele) => {
        const { name, status, startDate, dueDate } = ele;
        const matchesSearch = name
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const matchesStatus = filterStatus === "All" || status === filterStatus;
        // const projectStartDate = new Date(startDate.seconds * 1000);
        // const projectDueDate = new Date(dueDate.seconds * 1000);

        // const matchesDateRange =
        //   (filterDate.from === "" ||
        //     projectStartDate >= new Date(filterDate.from)) &&
        //   (filterDate.to === "" || projectDueDate <= new Date(filterDate.to));
        return matchesSearch && matchesStatus;
      });
      setModifiedProjectsList(filterData);
    }
    onFilterFun();
  }, [filterStatus, searchInput, projectsList]);

  function onViewProject(project) {
    const { projectId } = project;
    navigate(projectId);
  }

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 h-48">
          <h1 className="text-2xl font-bold py-3 px-10 ">Projects Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Projects</div>
              <div className="text-3xl text-indigo-600 font-bold">
                {projectCount.total}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg"> On-Going Projects</div>
              <div className="text-3xl text-emerald-600 font-bold">
                {projectCount.onGoing}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg"> Delay Projects</div>
              <div className="text-3xl text-orange-600 font-bold">
                {projectCount.delay}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg"> Completed Projects</div>
              <div className="text-3xl text-red-600 font-bold">
                {projectCount.completed}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 mt-5 rounded-lg ">
          <nav className="flex space-x-4 mb-4 items-center rounded-lg ">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4  border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by invoice #..."
                  className=" w-full focus:outline-none"
                  onChange={onSearchFilter}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 border p-2 rounded-lg ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All</option>
                  <option value="On-Going">On-Going</option>
                  <option value="Completed">Completed</option>
                  <option value="Delay">Delay</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              <Link
                className="bg-blue-500 text-white py-1 px-2 rounded"
                to="create-Project"
              >
                + Create Project
              </Link>
            </div>
          </nav>
          <div className=" ">
            {loading ? (
              <div className="text-center py-6">Loading Projects...</div>
            ) : (
              <div className="">
                {modifiedProjectsList.length > 0 ? (
                  <div className="grid grid-cols-3 gap-5">
                    {modifiedProjectsList.map((item) => (
                      <div
                        className={` bg-white border cursor-pointer rounded-lg h-56 hover:shadow-lg `}
                        onClick={() => onViewProject(item)}
                        key={item.projectId}
                      >
                        <div className="p-3 h-40">
                          <div
                            className={
                              "rounded-lg  w-fit px-2 text-xs font-bold " +
                              (item.status === "Delay"
                                ? " bg-rose-100"
                                : item.status === "Completed"
                                ? " bg-green-100"
                                : " bg-[hsl(250deg_92%_70%_/10%)]")
                            }
                          >
                            {item.status}
                          </div>
                          <div className="py-3 space-y-1">
                            <div className="font-bold">{item.name}</div>
                            <div className="text-xs line-clamp-3">
                              {item.description}
                            </div>
                          </div>
                          {isDueDateEnd(item.dueDate) && (
                            <div className="text-xs">
                              <i>Project due time over kindly check it</i>
                            </div>
                          )}
                          <div className="">
                            Team:{" "}
                            <span className="font-bold">
                              {item.staffRef?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className=" flex justify-between  border-t px-3 py-1">
                          <div>
                            <div className="text-gray-700 text-sm">
                              Assigned Date :{" "}
                            </div>
                            <div className="font-bold">{item.startDate}</div>
                          </div>
                          <div>
                            <div className="text-gray-700 text-sm">
                              Due Date :{" "}
                            </div>
                            <div className="font-bold">{item.dueDate}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">No Project Found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
