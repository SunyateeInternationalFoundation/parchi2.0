import React, { forwardRef } from "react";

const Template7 = forwardRef((props, ref) => {
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
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className=" text-gray-800">
              <span className="font-bold">{dataSet?.type} No:</span> #
              {dataSet?.no}
            </h1>
            <p className="text-gray-600">
              <span className="font-bold"> Date:</span>{" "}
              {DateFormate(dataSet?.dueDate)}
            </p>
          </div>
          <h1 className="text-3xl font-bold text-green-500">
            {dataSet?.createdBy?.name}
          </h1>
          {/* <img src="/ivonne-logo.png" alt="Ivonne Logo" className="h-12" /> */}
        </div>

        {/* Billing & Pay To Section */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm text-gray-800">
          <div>
            <h3 className="font-bold">{dataSet?.type} To:</h3>
            <p>{dataSet?.userTo?.name}</p>
            <p>
              {dataSet?.userTo.address}
              {dataSet?.userTo.city}
              {dataSet?.userTo.zipCode}
            </p>
            <p>{dataSet?.userTo.phone}</p>
            <p>{dataSet?.userTo.email}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold">Pay To:</h3>
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
              <tr className="bg-gray-200  text-start ">
                <th className=" text-start pl-1 pb-2">Item</th>
                <th className=" text-start pl-1 pb-2">Rate</th>
                <th className=" text-start pl-1 pb-2">Discount</th>
                <th className=" text-start pl-1 pb-2">Unit Price</th>
                <th className=" text-start pl-1 pb-2">Qty</th>
                <th className=" text-start pl-1 pb-2">Tax Type</th>
                <th className=" text-start pl-1 pb-2">Tax Amount</th>
                <th className=" text-start pl-1 pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {dataSet?.products.map((item, index) => (
                <tr key={index} className="border-t-2">
                  <td className=" pt-2 pb-2 pl-1">{item.name}</td>
                  <td className=" pt-2 pb-2 pl-1">{item.tax}%</td>
                  <td className=" pt-2 pb-2 pl-1">
                    {item.discount.toFixed(1)}
                  </td>
                  <td className=" pt-2 pb-2 pl-1">
                    {item.sellingPrice.toFixed(1)}
                  </td>
                  <td className=" pt-2 pb-2 pl-1">{item.quantity}</td>
                  <td className=" pt-2 pb-2 pl-1">CGST SGST</td>
                  <td className=" pt-2 pb-2 pl-1">
                    {item.taxAmount.toFixed(2)}
                  </td>
                  <td className=" pt-2 pb-2 pl-1">
                    {item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-1/2 bg-gray-100">
              <div className="flex justify-between border py-2">
                <span className="font-semibold">Subtotal:</span>
                <span> ₹{+dataSet?.subTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border py-2">
                <span className="font-semibold">Tax:</span>
                <span>{dataSet?.tax}%</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end font-bold text-gray-800 pt-2">
            <div className="w-1/2 flex justify-between ">
              <span>Total Amount:</span>
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

export default Template7;
