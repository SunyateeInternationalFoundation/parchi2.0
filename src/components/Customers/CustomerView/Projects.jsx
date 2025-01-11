import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

function Projects({ projectsData }) {
  const [modifiedProjectsList, setModifiedProjectsList] =
    useState(projectsData);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    function onFilterFun() {
      const filterData = projectsData.filter((ele) => {
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
  }, [filterStatus, searchInput, projectsData]);

  function isDueDateEnd(timestamp) {
    const timestampDate = new Date(timestamp);
    const currentDate = new Date();
    return timestampDate < currentDate;
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

  return (
    <div className="main-container" style={{ height: "80vh" }}>
      <div className="py-5">
        <nav className="flex mb-4 bg-white rounded-lg shadow items-center py-3 px-5">
          <div className="space-x-4 w-full flex items-center">
            <div className="flex items-center space-x-4 input-tag  rounded-lg w-full">
              <input
                type="text"
                placeholder="Search ..."
                className="w-full "
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <IoSearch />
            </div>
            <div className="w-52">
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
          <div className="w-full text-end"></div>
        </nav>
        <div className="py-5">
          {modifiedProjectsList.length > 0 ? (
            <div className="grid grid-cols-3 gap-5">
              {modifiedProjectsList.map((item) => (
                <div
                  className={` bg-white border cursor-pointer rounded-lg shadow h-56 hover:shadow-md `}
                  key={item.id}
                >
                  <div className="p-3 h-40">
                    <div
                      className={
                        "rounded-lg w-fit p-2 text-xs " +
                        (item.status === "Delay"
                          ? " bg-rose-100"
                          : item.status === "Completed"
                          ? "bg-green-100"
                          : "bg-[hsl(250deg_92%_70%_/10%)]")
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
                  <div className="flex justify-between border-t px-3 py-1">
                    <div>
                      <div className="text-gray-700 text-sm">
                        Assigned Date:
                      </div>
                      <div className="font-bold">
                        {DateFormate(item.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-700 text-sm">Due Date:</div>
                      <div className="font-bold">
                        {DateFormate(item.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">No Project Found</div>
          )}
        </div>
      </div>
    </div>
  );
}
Projects.propTypes = {
  projectsData: PropTypes.array,
};

export default Projects;
