import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";

function VendorProject({ projectsData }) {
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
    <div
      className="w-full px-8 py-8 bg-gray-100 overflow-y-auto"
      style={{ height: "80vh" }}
    >
      <div className="bg-white p-4  rounded-lg shadow ">
        <nav className="flex space-x-4 mb-4 items-center rounded-lg ">
          <div className="space-x-4 w-full flex items-center">
            <div className="flex items-center space-x-4  border p-2 rounded-lg">
              <input
                type="text"
                placeholder="Search by projects #..."
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
          <div className="">
            {modifiedProjectsList.length > 0 ? (
              <div className="grid grid-cols-3 gap-5">
                {modifiedProjectsList.map((item) => (
                  <div
                    className={` bg-white border cursor-pointer rounded-lg h-56 hover:shadow-lg `}
                    key={item.id}
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
                        <div className="font-bold">
                          {DateFormate(item.startDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-700 text-sm">Due Date : </div>
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
    </div>
  );
}
// <div className=" p-4 rounded-lg">
//   {projectsData.length > 0 ? (
//     <div className="space-y-2 ">
//       {projectsData.map((ele) => (
//         <div className="bg-white rounded-lg shadow border-2" key={ele.id}>
//           <div className="flex justify-between px-4 pt-3">
//             <div className="font-bold">{ele.name}</div>
//             <div>
//               <span className="text-gray-500">Status :</span> {ele.status}
//             </div>
//           </div>
//           <div className=" px-4 py-3">
//             <div>
//               <span className="text-gray-500">Created at :</span>{" "}
//               {ele.createdAt}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   ) : (
//     <div className="flex justify-center">No Projects Found</div>
//   )}
// </div>
VendorProject.propTypes = {
  projectsData: PropTypes.array,
};

export default VendorProject;
