import React from "react";

function Services({ servicesList }) {
  return (
    <div className=" p-4 rounded-lg">
      {servicesList.length > 0 ? (
        <div className="space-y-2 ">
          {servicesList.map((ele) => (
            <div className="bg-white rounded-lg shadow border-2" key={ele.id}>
              <div className="flex justify-between">
                <div className="p-1.5 bg-blue-200 rounded-tl-lg rounded-br-lg  w-24 text-center">
                  service No:
                </div>
                <div
                  className={
                    "p-1.5 rounded-tr-lg rounded-bl-lg w-24 text-center " +
                    (ele.status === "Active"
                      ? "bg-green-200  text-green-900"
                      : ele.status === "InActive"
                      ? "bg-red-200  text-red-900"
                      : "bg-orange-200  text-orange-900")
                  }
                >
                  {ele.status}
                </div>
              </div>
              <div className="flex justify-between px-4 pt-3">
                <div className="font-bold">{ele.serviceNo || "N/A"}</div>
                <div>₹ {ele.total.toFixed(2)}</div>
              </div>
              <div className="flex justify-between px-4 py-3">
                <div>
                  <span className="text-gray-500">Created By :</span>{" "}
                  {ele.createdBy.name}
                </div>
                <div>
                  <span className="text-gray-500">Date :</span> {ele.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">No Services Found</div>
      )}
    </div>
  );
}

export default Services;
