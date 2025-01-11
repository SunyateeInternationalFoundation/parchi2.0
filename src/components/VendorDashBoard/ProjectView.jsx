import { MdDateRange } from "react-icons/md";

function ProjectView({ project }) {
  return (
    <div className="main-container" style={{ width: "100%" }}>
      <div className="container  px-6 py-4  flex">
        <div className="uppercase rounded-lg border text-6xl bg-[rgb(159,142,247)] flex justify-center items-center w-40 h-40">
          {project.name?.slice(0, 2)}
        </div>
        <div className="px-3 w-full">
          <div className="flex items-center">
            <div className="text-xl font-semibold w-full">
              <div className="w-full px-2 py-1 rounded">{project?.name}</div>
            </div>
            <div className="w-24 flex item-center justify-center text-xs h-fit ">
              <div
                className={
                  "rounded-lg  w-fit p-2 text-xs me-2 " +
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
            <div className="w-24 flex item-center justify-center text-xs h-fit ">
              <div
                className={
                  "rounded-lg  w-fit p-2 text-xs " +
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
          </div>
          <div className="text-sm text-gray-500">
            <div className="text-ellipsis mt-1 max-h-12 min-h-12 w-full px-2 py-1">
              {project.description}
            </div>
          </div>
          <div className="flex items-center space-x-5 mt-3">
            <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
              <MdDateRange size={30} className="text-gray-700" />
              <div>
                <div className="text-gray-700 text-sm">Assigned Date</div>
                <div className="font-semibold text-sm">{project.startDate}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
              <MdDateRange size={30} className="text-gray-700" />
              <div>
                <div className="text-gray-700 text-sm">Due Date</div>
                <div className="font-semibold text-sm">{project.dueDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="p-5 bg-white shadow rounded-lg mt-4">
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
        </div> */}
    </div>
  );
}

export default ProjectView;
