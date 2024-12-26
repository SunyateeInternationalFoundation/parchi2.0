import React, { forwardRef } from "react";

const Template9 = forwardRef((props, ref) => {
  const { dataSet, bankDetails } = props;
  if (!dataSet) {
    return;
  }
  function DateFormate(timestamp) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getDate = String(date.getDate()).padStart(2, "0");
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getDate}.${getMonth}.${getFullYear}`;
  }
  return (
    <div
      className=" bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto"
      style={{ height: "80vh" }}
    >
      <div ref={ref} style={{ width: "595px", padding: "20px" }}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-3xl font-bold text-green-500">
            {dataSet?.createdBy?.name}
          </h1>
          <h1 className="text-xl">{dataSet?.type}</h1>
        </div>
        <div className="flex justify-end bg-blue-50 p-2 rounded-lg">
          <div className="text-end grid grid-cols-2 w-1/3">
            <span className="font-bold"> Date:</span>
            <span>{DateFormate(dataSet?.dueDate)}</span>
            <span className="font-bold">{dataSet?.type} No:</span>
            <span> #{dataSet?.no}</span>
          </div>
        </div>

        {/* Billing & Pay To Section */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm text-gray-800">
          <div>
            <h3 className="font-bold">To:</h3>
            <p>{dataSet?.userTo?.name}</p>
            <p>
              {dataSet?.userTo.address}
              {dataSet?.userTo.city}
              {dataSet?.userTo.zipCode}
            </p>
            <p>{dataSet?.userTo.phone}</p>
            <p>{dataSet?.userTo.email}</p>
          </div>
          <div className="">
            <h3 className="font-bold">Author:</h3>
            <p> {dataSet?.createdBy?.name}</p>
            <p>
              {dataSet?.createdBy.address}
              {dataSet?.createdBy.city}
              {dataSet?.createdBy.zipCode}
            </p>
            <p>{dataSet?.createdBy.email}</p>
            <p>{dataSet?.createdBy.phoneNo}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6">
          <table className="w-full mt-5 border">
            <thead>
              <tr className="bg-blue-50  text-start ">
                <th className=" text-start pl-1 pb-2">Item</th>
                <th className=" text-start pl-1 pb-2">Description</th>
                <th className=" text-start pl-1 pb-2">Qty</th>
                <th className=" text-end pr-1 pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {dataSet?.products.map((item, index) => (
                <tr key={index} className="border-t-2">
                  <td className=" pt-2 pb-2 pl-1">{item.name}</td>
                  <td className=" pt-2 pb-2 pl-1">{item.description}</td>
                  <td className=" pt-2 pb-2 pl-1">{item.quantity}</td>
                  <td className="text-end  pt-2 pb-2 pr-1">
                    {item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end bg-blue-50 border font-bold text-gray-800">
            <div className="w-1/3 flex justify-between px-1 py-1">
              <span>Total :</span>
              <span> ₹{+dataSet?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-sm text-gray-600 py-2">
          <div>
            <span className="font-bold">NOTE:</span>{" "}
            {dataSet?.notes || "No notes"}
          </div>
          <div className=" text-gray-600">
            <p>
              <span className="font-bold">Terms & Conditions: </span>
              {dataSet?.terms || "No Terms & Conditions"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Template9;
