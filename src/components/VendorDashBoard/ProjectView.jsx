import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { BsFileEarmarkCheck, BsFolderPlus } from "react-icons/bs";
import { MdDateRange } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { IoMdArrowRoundBack } from "react-icons/io";

function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState({});

  const manageProjectItems = [
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
  ];
  const navigate = useNavigate();

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
  }, []);

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
    };

    setProject(payload);
  }

  return (
    <div className="w-full" style={{ width: "100%" }}>
      <div className="px-8 pb-8 pt-2 bg-gray-100" style={{ width: "100%" }}>
        <div className="bg-white rounded-lg">
          <div className="flex justify-between items-center p-4">
            <div className="text-2xl font-semibold flex">
              <Link className="flex items-center px-2" to="./../">
                <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
              </Link>
              {project.name}
            </div>
          </div>
          <div className="border-t-2 px-6 py-4 flex">
            <div className="uppercase rounded-lg border p-8 text-6xl bg-[rgb(159,142,247)] flex justify-center items-center">
              {project.name?.slice(0, 2)}
            </div>
            <div className="px-3 w-full">
              <div className="flex">
                <div className="text-xl font-semibold w-full px-2 py-1">
                  {project.name}
                </div>
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
                    <div className="font-semibold text-sm">
                      {project.startDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 border-2 p-2 rounded-lg border-dashed w-44">
                  <MdDateRange size={30} className="text-gray-700" />
                  <div>
                    <div className="text-gray-700 text-sm">Due Date</div>
                    <div className="font-semibold text-sm">
                      {project.dueDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
