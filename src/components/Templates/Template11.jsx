import React, { forwardRef } from "react";

const Template11 = forwardRef((props, ref) => {
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
      className=" border border-gray-300 rounded-md shadow-md overflow-y-auto"
      style={{ height: "80vh" }}
    >
      <div ref={ref} style={{ width: "595px" }}>
        <div className="bg-white" style={{ padding: "20px" }}>
          <header className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-gray-700">
              {dataSet?.type}
            </h1>
            <div className="">
              <span className="text-3xl font-bold text-primary-600">
                {dataSet?.createdBy?.name}
              </span>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-8 mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-600 uppercase">
                {dataSet?.type} NUMBER
              </h2>
              <p className="text-sm text-gray-700 bg-blue-100 w-fit pe-3">
                {dataSet?.no}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-600">DATE OF ISSUE</h2>
              <p className="text-sm text-gray-700 bg-blue-100 w-fit pe-3">
                {" "}
                {DateFormate(dataSet?.dueDate)}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-8 ">
            <div>
              <h2 className="text-sm font-bold text-gray-600">BILLED TO</h2>
              <div className="text-sm text-gray-700 bg-blue-100 w-fit pe-3">
                <p>{dataSet?.userTo?.name}</p>
                <p>{dataSet?.userTo.address}</p>
                <p> {dataSet?.userTo.city}</p>
                <p> {dataSet?.userTo.zipCode}</p>
                <p>{dataSet?.userTo.phone}</p>
                <p>{dataSet?.userTo.email}</p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-600">
                {dataSet?.createdBy?.name}
              </h2>
              <div className="text-sm text-gray-700 bg-blue-100 w-fit pe-3">
                <p>{dataSet?.createdBy.address}</p>
                <p> {dataSet?.createdBy.city}</p>
                <p> {dataSet?.createdBy.zipCode}</p>
                <p>{dataSet?.createdBy.phone}</p>
                <p>{dataSet?.createdBy.email}</p>
              </div>
            </div>
          </section>
        </div>
        <div className="bg-gray-100" style={{ padding: "20px" }}>
          <table className="w-full mb-8 border-separate ">
            <thead>
              <tr>
                <th className="bg-blue-100 me-2 p-2 text-left text-sm font-bold text-gray-600">
                  Description
                </th>
                <th className="bg-blue-100  me-2 p-2 text-left text-sm font-bold text-gray-600">
                  Unit cost
                </th>
                <th className="bg-blue-100  me-2 p-2 text-left text-sm font-bold text-gray-600">
                  QTY/HR Rate
                </th>
                <th className="bg-blue-100  me-2 p-2 text-left text-sm font-bold text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {dataSet?.products.map((item, index) => (
                <tr key={index}>
                  <td className="bg-blue-100 p-2 text-sm text-gray-700">
                    {item.name}
                  </td>
                  <td className="bg-blue-100 p-2 text-sm text-gray-700">
                    {item.sellingPrice.toFixed(1)}
                  </td>
                  <td className="bg-blue-100 p-2 text-sm text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="bg-blue-100 p-2 text-sm text-gray-700">
                    {item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="flex justify-end mb-3">
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span className="w-full">Subtotal</span>
                <span className="bg-blue-100 w-full text-end">
                  ₹{+dataSet?.subTotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span className="w-full">Discount</span>
                <span className="bg-blue-100 w-full text-end">
                  {dataSet?.extraDiscount}
                  {dataSet?.discountType ? "%" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span className="w-full">Tax rate</span>
                <span className="bg-blue-100 w-full text-end">
                  {dataSet?.tax}%
                </span>
              </div>
            </div>
          </section>
          <div className="flex justify-end text-gray-900">
            <div className="  text-gray-900">
              <div className="w-full uppercase">{dataSet?.type} TOTAL</div>
              <div className="bg-blue-100 text-end">
                ₹{+dataSet?.total?.toFixed(2)}
              </div>
            </div>
          </div>

          <footer>
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
    </div>
  );
});

export default Template11;
