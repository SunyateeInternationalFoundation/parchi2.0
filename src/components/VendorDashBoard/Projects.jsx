import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
function Projects() {
  const userDetails = useSelector((state) => state.users);
  const [loading, setLoading] = useState(!true);
  const [projectsList, setProjectsList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modifiedProjectsList, setModifiedProjectsList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProject();
  }, []);
  async function fetchProject() {
    try {
      const asOtherCompanies = userDetails.userAsOtherCompanies.vendor;
      const asVendorsList = asOtherCompanies.map((ele) =>
        doc(db, "vendors", ele.vendorId)
      );
      if (asVendorsList.length === 0) {
        return;
      }
      const projectRef = collection(db, "projects");
      const q = query(
        projectRef,
        where("vendorRef", "array-contains-any", asVendorsList)
      );

      const querySnapshot = await getDocs(q);

      const projectsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const { projectMembers, companyRef, createdAt, ...rest } = doc.data();
          const companyDetails = (await getDoc(companyRef)).data();
          return {
            ...rest,
            projectId: doc.id,
            companyName: companyDetails.name,
            createdAt: DateFormate(createdAt),
            startDate: DateFormate(rest.startDate),
            dueDate: DateFormate(rest.dueDate),
            vendorRef: rest?.vendorRef?.map((ref) => ref.id),
            customerRef: rest?.customerRef?.map((ref) => ref.id),
            staffRef: rest?.staffRef?.map((ref) => ref.id),
          };
        })
      );
      setProjectsList(projectsData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
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

  function isDueDateEnd(timestamp) {
    const timestampDate = new Date(timestamp);

    const currentDate = new Date();
    return timestampDate < currentDate;
  }

  function onViewProject(project) {
    const { projectId } = project;
    navigate(projectId);
  }

  useEffect(() => {
    function onFilterFun() {
      const filterData = projectsList.filter((ele) => {
        const { name, status } = ele;
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
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white p-4 mt-5 rounded-lg ">
          <nav className="flex space-x-4 mb-4 items-center rounded-lg ">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4  border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by invoice #..."
                  className=" w-full focus:outline-none"
                  onChange={(e) => setSearchInput(e.target.value)}
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
