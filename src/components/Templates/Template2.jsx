import React, { forwardRef } from "react";

const Template2 = forwardRef((props, ref) => {
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
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="">
            <span className="text-3xl font-bold text-primary-600">
              {dataSet?.createdBy?.name}
            </span>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold uppercase"># {dataSet?.type}</h1>
            <p>
              {dataSet?.type}:{" "}
              <span className="font-medium">{dataSet?.no}</span>
            </p>
            <p>
              Date:{" "}
              <span className="font-medium">
                {DateFormate(dataSet?.dueDate)}
              </span>
            </p>
            <p>
              Status:{" "}
              <span className="font-medium">{dataSet?.paymentStatus}</span>
            </p>
          </div>
        </div>

        {/* Seller and Buyer Info */}
        <div className="grid grid-cols-2 border-2">
          <div>
            <h2 className="font-semibold bg-gray-800 text-white p-1 px-3">
              Seller
            </h2>
            <div className="p-4">
              <p> {dataSet?.createdBy?.name}</p>
              <p>{dataSet?.createdBy.email}</p>
              <p>{dataSet?.createdBy.phoneNo}</p>
            </div>
          </div>
          <div>
            <h2 className="font-semibold bg-gray-800 text-white p-1 px-3">
              Buyer
            </h2>
            <div className="p-4">
              <p>{dataSet?.userTo?.name}</p>
              <p>
                {dataSet?.userTo.address}
                {dataSet?.userTo.city}
                {dataSet?.userTo.zipCode}
              </p>
              <p>{dataSet?.userTo.phone}</p>
              <p>{dataSet?.userTo.email}</p>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <table className="w-full border border-collapse mb-6">
          <thead>
            <tr className="bg-gray-800 border text-white">
              <th className="border">#</th>
              <th className="border">Product</th>
              <th className="border">Quantity</th>
              <th className="border">MRP</th>
              <th className="border">Unit Price</th>
              <th className="border">Total</th>
            </tr>
          </thead>
          <tbody>
            {dataSet?.products.map((item, index) => (
              <tr key={index}>
                <td className="border py-2 pl-1">{index + 1}</td>
                <td className="border py-2 pl-1">{item.name}</td>
                <td className="border py-2 pl-1">{item.quantity}</td>
                <td className="border py-2 pl-1">
                  {item.sellingPrice.toFixed(1)}
                </td>
                <td className="border py-2 pl-1">
                  {item.netAmount.toFixed(2)}
                </td>
                <td className="border  py-2 pl-1">
                  {item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Payment Status */}
        <div className="border w-full flex justify-between mb-6">
          <div className="p-4">
            <h3 className="font-semibold">
              Payment Status: {dataSet?.paymentStatus}
            </h3>
            {/* <p>Paid Amount: $317</p>
          <p>Due Amount: $256.97</p> */}
            <p>Payment Mode: {dataSet?.mode}</p>
          </div>

          {/* Total and Summary */}
          <div className="">
            <table className="">
              <tbody>
                <tr>
                  <td className="border px-2 py-1"> Subtotal</td>
                  <td className="border px-2 py-1">₹{dataSet?.subTotal}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1"> Tax </td>
                  <td className="border px-2 py-1">{dataSet?.tax}%</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1"> Discount </td>
                  <td className="border px-2 py-1">
                    {!dataSet?.extraDiscountType && "₹"}
                    {dataSet?.extraDiscount}
                    {dataSet?.extraDiscountType && "%"}
                  </td>
                </tr>

                {dataSet?.packagingCharges > 0 && (
                  <tr>
                    <td className="border px-2 py-1">Packaging </td>
                    <td className="border px-2 py-1">
                      ₹{dataSet?.packagingCharges}
                    </td>
                  </tr>
                )}
                {dataSet?.shippingCharges > 0 && (
                  <tr>
                    <td className="border px-2 py-1"> Shipping </td>
                    <td className="border px-2 py-1">
                      {" "}
                      ₹{dataSet?.shippingCharges}
                    </td>
                  </tr>
                )}
                <tr className="font-semibold border">
                  <td className="border px-2 py-1">Total </td>
                  <td className="border px-2 py-1">
                    ₹{+dataSet?.total?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-between pb-4">
          <div className="">
            <div className="">Note:</div>
            <div className="">{dataSet?.notes || "No Notes"}</div>
          </div>
          <div className="">Authorized Person</div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-between">
          <div className=" text-gray-600">
            <p>Terms & Conditions</p>
            <p>{dataSet?.terms || "No Terms & Conditions"}</p>
          </div>
          <div className="pe-3">
            <div>
              <strong>Bank Details</strong>
            </div>
            <div>
              Bank : <span className="font-bold">{bankDetails?.bankName}</span>{" "}
            </div>
            <div>
              Account # :{" "}
              <span className="font-bold">{bankDetails?.accountNo}</span>
            </div>
            <div>
              IFSC Code :{" "}
              <span className="font-bold">{bankDetails?.ifscCode}</span>
            </div>
            <div>
              Branch : <span className="font-bold">{bankDetails?.branch}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Template2;
