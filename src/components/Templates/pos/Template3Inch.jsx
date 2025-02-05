import React, { forwardRef } from "react";

const Template3Inch = forwardRef((props, ref) => {
  const { dataSet, bankDetails } = props;
  if (Object.keys(dataSet).length === 0) {
    return;
  }
  if (dataSet.type !== "POS") {
    return
  }
  return (
    <div className="w-[288px] mx-auto border p-4 bg-white">
      <div className="text-center">
        <h2 className="font-bold text-lg">{dataSet.createdBy.name}</h2>
        <p>
          {dataSet.createdBy.address}
          <br />
          {dataSet.createdBy.city}, {dataSet.createdBy.zipCode}
          <br />
          {dataSet.createdBy.phoneNo}
        </p>
        <p className="mt-2 font-semibold">Delivery</p>
      </div>

      {/* Server and Order details */}
      <div className="mt-4 text-left text-sm">
        <hr className="my-4 border-t border-dashed" />

        <p className="flex justify-between">
          <span className="font-semibold">Order #:</span> <span>21</span>
        </p>
        <p className="flex justify-between">
          <span className="font-semibold">Delivery To</span>
        </p>
        <p>{dataSet.userTo.address}</p>
        <p>{dataSet.userTo.phone}</p>
      </div>

      {/* Order Settled */}
      <hr className="my-4 border-t border-dashed" />
      <p className="text-center font-bold">&gt;&gt; ORDER SETTLED &lt;&lt;</p>
      <hr className="my-4 border-t border-dashed" />

      {/* Mapped Items list */}
      <div className="mt-4">
        {/* Headings */}
        <div className="flex justify-around font-bold border-b pb-1">
          <span className="w-1/6">Qnty</span>
          <span className="w-1/3">Item</span>
          <span className="w-1/3 ">Price</span>
          <span className="w-1/6 ">Total</span>
        </div>

        {/* Items */}
        {dataSet.items.map((item, index) => (
          <div key={index} className="flex justify-around text-sm">
            <span className="w-1/6">{item.quantity}</span>
            <span className="w-1/3">{item.name}</span>
            <span className="w-1/3 flex flex-col justify-end">
              {item.sellingPrice.toFixed(2)}
            </span>
            <span className="w-1/6 text-right">
              {(item.sellingPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <hr className="my-4 border-t border-dashed" />
      <div className="text-right">
        <p className="flex justify-between">
          SUB TOTAL: <span>${dataSet.subTotal}</span>
        </p>
        <p className="flex justify-between">
          SALES TAX: <span>${dataSet.tax}</span>
        </p>
        <p className="font-bold flex justify-between">
          AMOUNT DUE: <span>${dataSet.total}</span>
        </p>
        <p className=" flex justify-between">
          CGST 9.0% : <span>${dataSet?.totalCgstAmount_9.toFixed(2)}</span>
        </p>
        <p className=" flex justify-between">
          SGST 9.0% : <span>${dataSet?.totalSgstAmount_9.toFixed(2)}</span>
        </p>
        <p className=" flex justify-between">
          CGST 6.0% : <span>${dataSet?.totalCgstAmount_6.toFixed(2)}</span>
        </p>
        <p className=" flex justify-between">
          SGST 6.0% : <span>${dataSet?.totalSgstAmount_6.toFixed(2)}</span>
        </p>
        <p className=" flex justify-between">
          CGST 2.5% : <span>${dataSet?.totalCgstAmount_2_5.toFixed(2)}</span>
        </p>
        <p className=" flex justify-between">
          SGST 2.5% : <span>${dataSet?.totalSgstAmount_2_5.toFixed(2)}</span>
        </p>
      </div>
      <div className="my-4 py-2 border-b border-t border-dashed">
        <p className="flex justify-start">
          <span className="font-semibold">Bank Details</span>
        </p>
        <p>Bank : { }</p>
        <p>Account : { }</p>
        <p>IFSC Code : { }</p>
        <p>Branch : { }</p>
      </div>

      {/* Authorized Signature Section */}
      {/* <div className="my-4 border-dashed">
        <p className="text-end w-full">Authorized Signature</p>
      </div> */}

      {/* Footer */}
      {/* <hr className="my-4  border-dashed" />
      <div className="text-center">
        <p>date {Tiem}</p>
        <p className="mt-4 font-bold">THANK YOU!</p>
      </div> */}
    </div>
  );
})

Template3Inch.displayName = "Template3Inch";
export default Template3Inch;
