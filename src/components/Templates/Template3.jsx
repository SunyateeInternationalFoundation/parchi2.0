import React, { forwardRef } from "react";

const Template3 = forwardRef((props, ref) => {
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

    return `${getDate}/${getMonth}/${getFullYear}`;
  }
  return (
    <div
      className=" bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto"
      style={{ height: "80vh" }}
    >
      <div ref={ref} style={{ width: "595px", padding: "20px" }}>
        {/* Header */}
        <header className="flex justify-between items-center border-b pb-4 mb-3">
          <div>
            <h1 className="text-3xl font-bold text-blue-500">
              {dataSet?.createdBy?.name}
            </h1>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">{dataSet?.type}</h2>
          </div>
        </header>
        <div className="flex justify-between items-center  border-b pb-4 mb-3">
          <div>
            <span className="font-bold"> Date:</span>{" "}
            {DateFormate(dataSet?.dueDate)}
          </div>
          <div>
            <span className="font-bold">{dataSet?.type} No:</span> {dataSet?.no}
          </div>
        </div>

        {/* {dataSet?.type} Details */}
        <section className="flex justify-between  mb-3">
          <div>
            <h3 className="font-bold">{dataSet?.type}d To:</h3>
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
        </section>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 pl-1">#</th>
              <th className=" text-left py-2 pl-1">Product</th>
              <th className=" text-left py-2 pl-1">Quantity</th>
              <th className=" text-left py-2 pl-1">MRP</th>
              <th className=" text-left py-2 pl-1">Unit Price</th>
              <th className=" text-left py-2 pl-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {dataSet?.products.map((item, index) => (
              <tr key={index} className="border-t-2">
                <td className="py-2 pl-1">{index + 1}</td>
                <td className="py-2 pl-1">{item.name}</td>
                <td className="py-2 pl-1">{item.quantity}</td>
                <td className="py-2 pl-1">{item.sellingPrice.toFixed(1)}</td>
                <td className="py-2 pl-1">{item.netAmount.toFixed(2)}</td>
                <td className="py-2 pl-1">{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dataSet?.tcs.isTcsApplicable && (
          <div className="py-2 pe-3 text-end border-x-2 border-b-2 bg-gray-100">
            <span className="font-bold">TCS :</span>
            <span className="ml-5">{dataSet?.tcs.tcs_amount.toFixed(2)}</span>
          </div>
        )}
        {dataSet?.tds.isTdsApplicable && (
          <div className="py-2 pe-3 text-end border-x-2 border-b-2 bg-gray-100">
            <span className="font-bold">TDS :</span>
            <span className="ml-5">{dataSet?.tds.tds_amount.toFixed(2)}</span>
          </div>
        )}

        <div className="py-2 pe-3 text-end border-x-2 border-b-2 bg-gray-100">
          <span className="font-bold">SubTotal :</span>
          <span className="ml-5">{dataSet?.subTotal}</span>
        </div>

        <div className="py-2 pe-3 text-end border-x-2 border-b-2 bg-gray-100">
          <span className="font-bold">Tax :</span>
          <span className="ml-5">{dataSet?.tax}</span>
        </div>

        <div className="py-2 pe-3 text-end border-x-2 border-b-2 bg-gray-100">
          <span className="font-bold">Total :</span>₹
          {+dataSet?.total?.toFixed(2)}
        </div>

        {/* Note */}
        <footer className="mt-6  text-gray-500 text-xs">
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
        </footer>
      </div>
    </div>
  );
});

export default Template3;
