import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdDateRange } from "react-icons/md";
import { BsFolderPlus } from "react-icons/bs";
import { BsFileEarmarkCheck } from "react-icons/bs";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { AiOutlineArrowLeft } from "react-icons/ai";

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

            <div className="flex items-center ">
              <MdDateRange size={30} className="text-gray-700" />
              <span className="text-gray-700">Start Date : </span>{" "}
              {project.startDate}
            </div>

            <div className="flex items-center mx-10">
              <MdDateRange size={30} className="text-gray-700" />{" "}
              <span className="text-gray-700">End Date : </span>{" "}
              {project.dueDate}
            </div>
          </div>

          <div className="border-2 shadow-lg px-3 rounded-lg bg-blue-200">
            {project.status}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow my-4">
          <div className="border-b pb-3 h-8">{project.name}</div>
          <div className="py-3">{project.description}</div>
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
