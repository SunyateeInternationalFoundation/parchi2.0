import React, { forwardRef } from "react";

const Template4 = forwardRef((props, ref) => {
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
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gray-100 border-black py-1  border-b">
              {dataSet?.createdBy?.name}
            </h1>
            <p className=" border-black py-2 border-b ">
              {dataSet?.createdBy.address} {dataSet?.createdBy.city}
              {dataSet?.createdBy.zipCode} {dataSet?.createdBy.email}
              {dataSet?.createdBy.phoneNo}
            </p>
          </div>
          <div className="flex justify-between border-black py-1 border-b px-3">
            <div>Debit Memo</div>
            <div className="font-semibold uppercase">TAX {dataSet?.type}</div>
            <div>Original</div>
          </div>
          {/* {dataSet?.type} Details */}
          <div className="flex justify-between border-black  border-b">
            <div className="w-full py-1 px-3">
              <p>
                <strong>M/s.:</strong> {dataSet?.userTo?.name}
              </p>
              <p>{dataSet?.userTo.address} </p>
              <p> {dataSet?.userTo.city} </p>
              <p> {dataSet?.userTo.zipCode}</p>
              <p>{dataSet?.userTo.phone}</p>
              <p>{dataSet?.userTo.email}</p>
            </div>
            <div className="border-s border-black bg-gray-100 p-2 w-3/4">
              <p>
                <strong>{dataSet?.type} No:</strong> {dataSet?.no}
              </p>
              <p>
                <strong>Date:</strong> {DateFormate(dataSet?.dueDate)}
              </p>
            </div>
          </div>

          {/* Product Table */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 pl-1">SrNo</th>
                <th className=" text-left py-2 pl-1">Product</th>
                <th className=" text-left py-2 pl-1">Qty</th>
                <th className=" text-left py-2 pl-1">Rate</th>
                <th className=" text-left py-2 pl-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {dataSet?.products.map((item, index) => (
                <tr key={index} className="border-t-2">
                  <td className="py-2 pl-1">{index + 1}</td>
                  <td className="py-2 pl-1">{item.name}</td>
                  <td className="py-2 pl-1">{item.quantity}</td>
                  <td className="py-2 pl-1">{item.netAmount.toFixed(2)}</td>
                  <td className="py-2 pl-1">{item.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-y border-black flex justify-between">
            <div>
              {/* <p>
                <strong>GSTIN No.:</strong> 26AKJPG9221EIW5
              </p> */}
            </div>
            <div className="flex justify-between border-gray-400 pt-2 px-3">
              <p>Sub Total:</p>
              <p>₹{+dataSet?.subTotal?.toFixed(2)}</p>
            </div>
          </div>
          <div className="border-b border-black flex justify-between">
            <div className="border-e border-black w-full px-3">
              <strong>Bill Amount:</strong> ₹{+dataSet?.total?.toFixed(2)} Onlys
            </div>
            <div className="w-3/4">
              {dataSet?.tcs.isTcsApplicable && (
                <div>
                  TCS :
                  <span className="ml-5">
                    {dataSet?.tcs.tcs_amount.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.tds.isTdsApplicable && (
                <div>
                  TDS :
                  <span className="ml-5">
                    {dataSet?.tds.tds_amount.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.totalCgstAmount_9 > 0 && (
                <div>
                  CGST 9.0% :
                  <span className="ml-5">
                    {dataSet?.totalCgstAmount_9.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.totalSgstAmount_9 > 0 && (
                <div>
                  SGST 9.0% :
                  <span className="ml-5">
                    {dataSet?.totalSgstAmount_9.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.totalCgstAmount_6 > 0 && (
                <div>
                  CGST 6.0% :
                  <span className="ml-5">
                    {dataSet?.totalCgstAmount_6.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.totalSgstAmount_6 > 0 && (
                <div>
                  SGST 6.0% :
                  <span className="ml-5">
                    {dataSet?.totalSgstAmount_6.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.totalCgstAmount_2_5 > 0 && (
                <div>
                  CGST 2.5% :
                  <span className="ml-5">
                    {dataSet?.totalCgstAmount_2_5.toFixed(2)}
                  </span>
                </div>
              )}
              {dataSet?.totalSgstAmount_2_5 > 0 && (
                <div>
                  SGST 2.5% :
                  <span className="ml-5">
                    {dataSet?.totalSgstAmount_2_5.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between border-b border-black w-full">
            <div className="w-full border-e border-black py-2 px-3">
              <span className="font-bold">Note: </span>
              <span>{dataSet?.notes || "No notes"}</span>
            </div>
            <div className="w-3/4 flex justify-between font-bold py-2 ">
              <div className="px-2">Grand Total:</div>
              <div className="px-2">$285.55</div>
            </div>
          </div>
          <div className="flex justify-between border-b border-black  ">
            <div className="w-full border-e border-black py-2 px-3">
              <span className="font-bold">Terms & Condition: </span>
              <span>{dataSet?.terms || "No Terms & Condition"}</span>
            </div>
            <div className="w-3/4 text-end py-2">
              <p className=" px-3">For,{dataSet?.createdBy?.name}</p>
              <p className="mt-8  px-3">(Authorised Signatory)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Template4;
