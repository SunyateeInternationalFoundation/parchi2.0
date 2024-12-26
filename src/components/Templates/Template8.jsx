import React, { forwardRef } from "react";

const Template8 = forwardRef((props, ref) => {
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
        <div className="border border-black ">
          {/* Header */}
          <div className="relative flex justify-center items-center border-b border-black px-2 pb-4">
            <div className="absolute text-3xl left-1  w-30 font-bold text-green-500">
              {dataSet?.createdBy?.name}
            </div>
            <div className="text-center w-full">
              <p className="text-gray-800">
                <p className="font-bold uppercase">
                  {dataSet?.createdBy?.name}
                </p>
                <p>{dataSet.createdBy.address}</p>
                <p>{dataSet.createdBy.city}</p>
                <p>{dataSet.createdBy.zipCode}</p>
                <p>Mobile: {dataSet.createdBy.phoneNo}</p>
              </p>
            </div>
          </div>
          {/* {dataSet.type} Details */}
          <div className="grid grid-cols-2 px-2 gap-4 border-b border-black">
            <div className="border-r border-black">
              <h3 className="font-bold text-gray-800">User Details:</h3>
              <p>{dataSet.userTo.name} </p>
              <p>{dataSet.userTo.address} </p>
              <p>{dataSet.userTo.city} </p>
              <p>{dataSet.userTo.zipCode} </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {dataSet.type} Details:
              </h3>
              <div className="grid grid-cols-2">
                <div>{dataSet.type} #:</div>
                <div> {dataSet.no}</div>
                <div>{dataSet.type} Date:</div>
                <div> {DateFormate(dataSet.date)}</div>
                <div>Due Date:</div>
                <div>{DateFormate(dataSet.dueDate)}</div>
                <div>Place of Supply:</div>
                <div> {dataSet.userTo.city}</div>
              </div>
            </div>
          </div>
          {/* Items Table */}
          <div className="">
            <table className="w-full border-collapse border-b border-black text-gray-800">
              <thead>
                <tr className="">
                  <th className="border-b border-r border-black pl-1 text-left">
                    #
                  </th>
                  <th className="border-b border-r border-black pl-1 text-left">
                    Item
                  </th>
                  <th className="border-b border-r border-black pl-1 text-left">
                    Unit Price
                  </th>
                  <th className="border-b border-r border-black pl-1 text-right">
                    Tax
                  </th>
                  <th className="border-b border-r border-black pl-1 text-center">
                    Discount
                  </th>
                  <th className="border-b border-r border-black pl-1 text-center">
                    Qty
                  </th>
                  <th className="border-b border-r border-black pl-1 text-right">
                    Rate
                  </th>
                  <th className="border-b  border-black pl-1 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataSet.products.map((item, index) => (
                  <tr key={index}>
                    <td className="text-left border-r border-black  pl-1">
                      {index + 1}
                    </td>
                    <td className="text-left border-r border-black  pl-1">
                      {item.name}
                    </td>
                    <td className="text-left border-r border-black  pl-1">
                      {item.sellingPrice.toFixed(1)}
                    </td>
                    <td className="text-right border-r border-black  pl-1">
                      {item.tax}%
                    </td>
                    <td className="text-center border-r border-black  pl-1">
                      {item.discount.toFixed(1)}
                    </td>
                    <td className="text-center border-r border-black  pl-1">
                      {item.quantity}
                    </td>
                    <td className="text-right border-r border-black  pl-1">
                      {item.sellingPrice.toFixed(1)}
                    </td>

                    <td className="text-right pl-1">
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="">
                  <td className="text-left border-r border-black  pl-1"></td>
                  <td className="text-end border-r border-black  pl-1">
                    <p>SGST 2.5%</p>
                    <p>CGST 2.5%</p>
                    <p>SGST 6.0%</p>
                    <p>CGST 6.0%</p>
                    <p>SGST 9.0%</p>
                    <p>CGST 9.0%</p>
                    <p>TDS</p>
                    <p>TCS</p>
                    <p>Delivery/Shipping</p>
                    <p>Packaging</p>
                  </td>
                  <td className="text-left border-r border-black  pl-1"></td>
                  <td className="text-right border-r border-black  pl-1"></td>
                  <td className="text-center border-r border-black  pl-1"></td>
                  <td className="text-center border-r border-black  pl-1"></td>
                  <td className="text-right border-r border-black  pl-1"></td>
                  <td className="text-right   pl-1">
                    <p>{dataSet.totalSgstAmount_2_5.toFixed(2)}%</p>
                    <p>{dataSet.totalCgstAmount_2_5.toFixed(2)}%</p>
                    <p>{dataSet.totalSgstAmount_6.toFixed(2)}%</p>
                    <p>{dataSet.totalCgstAmount_6.toFixed(2)}%</p>
                    <p>{dataSet.totalSgstAmount_9.toFixed(2)}%</p>
                    <p>{dataSet.totalCgstAmount_9.toFixed(2)}%</p>
                    <p>{dataSet.tds.tds_amount.toFixed(2)}%</p>
                    <p>{dataSet.tcs.tcs_amount.toFixed(2)}%</p>
                    <p>{dataSet.shippingCharges}</p>
                    <p>{dataSet.packagingCharges}</p>
                  </td>
                </tr>
                <tr className="border-t-2 border-black">
                  <td className="text-left border-r border-black  pl-1"></td>
                  <td className="text-end border-r border-black  pl-1">
                    Total
                  </td>
                  <td className="text-left border-r border-black  pl-1"></td>
                  <td className="text-right border-r border-black  pl-1"></td>
                  <td className="text-center border-r border-black  pl-1"></td>
                  <td className="text-center border-r border-black  pl-1"></td>
                  <td className="text-right border-r border-black  pl-1"></td>
                  <td className="text-right   pl-1">
                    ₹{+dataSet.total?.toFixed(2)}
                  </td>
                </tr>
                {/* Repeat rows for more items */}
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between">
            <div className="w-full border-r-2 border-black px-2">
              <h3 className="font-bold text-gray-800">Bank Details:</h3>
              <p>Bank: {bankDetails?.bankName}</p>
              <p>Account #: {bankDetails?.accountNo}</p>
              <p>IFSC: {bankDetails?.ifscCode}</p>
              <p>Branch: {bankDetails?.branch}</p>
            </div>
            <div className="text-sm text-gray-600 w-3/4 px-2">
              <div className="font-bold text-gray-800">Note:</div>
              <div className="">{dataSet.notes || "No Notes"}</div>
              <div className="font-bold text-gray-800">
                Terms and Conditions:
              </div>
              <p>{dataSet.terms || "No Terms & Conditions"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Template8;
