import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
function Projects() {
  const userDetails = useSelector((state) => state.users);
  const [loading, setLoading] = useState(!true);
  const [projectsList, setProjectsList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProject();
  }, []);
  async function fetchProject() {
    try {
      const projectRef = collection(db, "projects");
      const q = query(
        projectRef,
        where("phoneNum", "array-contains", userDetails.phone)
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

  return (
    <div className="w-full" style={{ width: "100%", height: "92vh" }}>
      <div
        className="px-8 pb-8 pt-5 bg-gray-100 overflow-y-auto"
        style={{ width: "100%", height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Projects</h1>
        </header>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          {loading ? (
            <div className="text-center py-6">Loading Projects...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "70vh" }}>
              <div className="">
                {projectsList.length > 0 ? (
                  projectsList.map((item) => (
                    <div
                      className={`border-2 shadow cursor-pointer rounded-lg p-3 mt-3 ${
                        isDueDateEnd(item.dueDate) ? "bg-red-400" : " "
                      }`}
                      onClick={() => onViewProject(item)}
                      key={item.projectId}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="font-bold">{item.name}</div>
                        <div>
                          <span>By</span> {item.companyName}
                        </div>
                      </div>
                      <div className="flex justify-between mb-2">
                        <div>
                          <span className="text-gray-700">Start Date : </span>
                          <span>{item.startDate}</span>

                          <span className="text-gray-700 ml-4">
                            End Date :{" "}
                          </span>
                          <span>{item.dueDate}</span>
                        </div>
                        <div
                          className={
                            item.status === "Delay"
                              ? "text-rose-800"
                              : item.status === "Completed"
                              ? "text-green-700"
                              : ""
                          }
                        >
                          {item.status}
                        </div>
                      </div>
                      {isDueDateEnd(item.dueDate) && (
                        <div className="text-xs">
                          <i>Project due time over kindly check it</i>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center">No Project Found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Projects;
