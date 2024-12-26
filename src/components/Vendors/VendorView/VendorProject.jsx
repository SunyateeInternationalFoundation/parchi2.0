import React from "react";

function VendorProject({ projectsData }) {
  return (
    <div className=" p-4 rounded-lg">
      {projectsData.length > 0 ? (
        <div className="space-y-2 ">
          {projectsData.map((ele) => (
            <div className="bg-white rounded-lg shadow border-2" key={ele.id}>
              <div className="flex justify-between px-4 pt-3">
                <div className="font-bold">{ele.name}</div>
                <div>
                  <span className="text-gray-500">Status :</span> {ele.status}
                </div>
              </div>
              <div className=" px-4 py-3">
                <div>
                  <span className="text-gray-500">Created at :</span>{" "}
                  {ele.createdAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">No Projects Found</div>
      )}
    </div>
  );
}

export default VendorProject;
