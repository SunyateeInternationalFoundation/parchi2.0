import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
function Projects() {
  const userDetails = useSelector((state) => state.users);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(!true);
  const [projectsList, setProjectsList] = useState([]);
  const [modifiedProjectsList, setModifiedProjectsList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [projectCount, setProjectCount] = useState({
    onGoing: 0,
    completed: 0,
    delay: 0,
    total: 0,
  });
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
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchProjectsList() {
      try {
        if (!companyId) {
          return;
        }
        const companyRef = doc(db, "companies", companyId);
        const projectRef = collection(db, "projects");
        let q;
        if (userDetails.selectedDashboard === "staff") {
          q = query(
            projectRef,
            where("phoneNum", "array-contains", userDetails.phone),
            where("companyRef", "==", companyRef)
          );
        } else {
          q = query(projectRef, where("companyRef", "==", companyRef));
        }

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
  }, [companyId]);

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

  function onSearchFilter(e) {
    setSearchInput(e.target.value);
  }

  useEffect(() => {
    function onFilterFun() {
      const filterData = projectsList.filter((ele) => {
        const { name, status, startDate, dueDate } = ele;
        const matchesSearch = name
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const matchesStatus = filterStatus === "All" || status === filterStatus;
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
    <div className="main-container" style={{ height: "92vh" }}>
      <div className=" mt-4 py-3">
        <h1 className="text-2xl font-bold pb-3">Projects Overview</h1>
        <div className="grid grid-cols-4 gap-12 ">
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg">Total Projects</div>
            <div className="text-3xl text-indigo-600 font-bold p-2">
              {projectCount.total}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> On-Going Projects</div>
            <div className="text-3xl text-emerald-600 font-bold p-2">
              {projectCount.onGoing}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow">
            <div className="text-lg"> Delay Projects</div>
            <div className="text-3xl text-orange-600 font-bold p-2">
              {projectCount.delay}
            </div>
          </div>
          <div className="rounded-lg p-5 bg-white shadow ">
            <div className="text-lg"> Completed Projects</div>
            <div className="text-3xl text-red-600 font-bold p-2">
              {projectCount.completed}
            </div>
          </div>
        </div>
      </div>
      <div className="py-5 ">
        <nav className="flex mb-4 bg-white rounded-lg shadow items-center py-3 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div className="flex items-center space-x-4  border  px-5  py-3  rounded-lg w-full">
              <input
                type="text"
                placeholder="Search by Project #..."
                className=" w-full focus:outline-none"
                onChange={onSearchFilter}
              />
              <IoSearch />
            </div>
            <div className="flex items-center space-x-4 border  px-5  py-3  rounded-lg ">
              <select onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All"> All</option>
                <option value="On-Going">On-Going</option>
                <option value="Completed">Completed</option>
                <option value="Delay">Delay</option>
              </select>
            </div>
          </div>
          <div className="w-full text-end ">
            {(userDetails.selectedDashboard === "" || role?.create) && (
              <Link
                className="bg-[#442799] text-white text-center  px-5  py-3 font-semibold rounded-md"
                to="create-project"
              >
                + Create Project
              </Link>
            )}
          </div>
        </nav>
        <div className="py-5 ">
          {loading ? (
            <div className="text-center py-6">Loading Projects...</div>
          ) : (
            <div>
              {modifiedProjectsList.length > 0 ? (
                <div className="grid grid-cols-3 gap-5 ">
                  {modifiedProjectsList.map((item) => (
                    <div
                      className={` bg-white border cursor-pointer rounded-lg h-56 hover:shadow-lg shadow`}
                      onClick={() => onViewProject(item)}
                      key={item.projectId}
                    >
                      <div className="p-3 h-40">
                        <div
                          className={
                            "rounded-lg  w-fit p-2 text-xs " +
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
                        <div>
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
  );
}

export default Projects;
