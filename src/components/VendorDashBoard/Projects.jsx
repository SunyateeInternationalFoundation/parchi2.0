import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import addItem from "../../assets/addItem.png";
import { db } from "../../firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";

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
    <div className="main-container" style={{ height: "94vh" }}>
      <div className="flex items-center text-lg font-bold space-x-3">
        <AiOutlineHome
          className="cursor-pointer"
          size={24}
          onClick={() => {
            navigate("/vendor");
          }}
        />
        <div>Projects</div>
      </div>
      <div className="py-5">
        <nav className="flex mb-4 bg-white rounded-lg shadow items-center py-3 px-5  ">
          <div className="space-x-4 w-full flex items-center">
            <div className="flex items-center space-x-4  input-tag w-96">
              <input
                type="text"
                placeholder="Search..."
                className=" w-full focus:outline-none"
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <IoSearch />
            </div>
            <div className="w-56">
              <Select
                value={filterStatus || "All"}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Select Filter"} />
                </SelectTrigger>
                <SelectContent className=" h-26">
                  <SelectItem value="All"> All</SelectItem>
                  <SelectItem value="On-Going">On-Going</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delay">Delay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </nav>
        <div>
          {loading ? (
            <div className="text-center py-6">Loading Projects...</div>
          ) : (
            <div>
              {modifiedProjectsList.length > 0 ? (
                <div className="grid grid-cols-3 gap-5">
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
                <div className="text-center">
                  <div className="w-full flex justify-center">
                    <img src={addItem} alt="add Item" className="w-24 h-24" />
                  </div>
                  <div className="mb-6">No Project Found</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Projects;
