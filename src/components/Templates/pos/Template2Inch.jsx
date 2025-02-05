import React, { forwardRef } from "react";

const Template2Inch = forwardRef((props, ref) => {
  const { dataSet, bankDetails } = props;
  if (Object.keys(dataSet).length === 0) {
    return;
  }

  return (
    <div className="w-[288px] mx-auto border p-4 text-xs font-mono bg-white">
      <div className="text-center">
        <h2 className=" text-sm">{dataSet.createdBy.name}</h2>
        <p>Welcome to {dataSet.createdBy.name} Hyderabad - Nanakraguda!</p>
        <p>EVERY DAY 10:00 AM - 11:00 PM</p>
        <p>RESTAURANT 09:30 AM - 10:15 PM</p>
      </div>

      <hr className="my-2 border-t border-dashed" />
      <p className="text-center">Original for Recipient</p>

      <div className="mt-2">
        <p>{dataSet.createdBy.name}.</p>
        <p>Plot no 25,26(P) and 29(P) Hitec Main Rd</p>
        <p>{dataSet.createdBy.address}</p>
        {/* <p>Serilingampally Mandal, Ranga Reddy Dst</p> */}
        <p>Hyderabad 500081</p>
        <p>State: TELANGANA</p>
        <p>State Code: 36</p>
        <p>GSTIN: 36AADCI3006N1ZL</p>
      </div>

      {/* <hr className="my-2 border-t border-dashed" /> */}

      <p className="mt -1 text-center">Tax Invoice</p>
      <div className="mt-2">
        <p>
          <span className="">Date:</span> 09/08/2018
        </p>
        <p>
          <span className="">Number:</span> S50117A000060936
        </p>
        <p>
          <span className="">Place of Supply:</span> TELANGANA
        </p>
      </div>

      {/* <hr className="my-2 border-t border-dashed" /> */}

      <div className="mt-2">
        {/* <div className="flex justify-between font-semibold">
          <span>Item</span>
        </div> */}

        {dataSet.items.map((item, index) => (
          <div key={index} className="mt-2">
            {/* Product Name */}
            <div className="flex justify-between">
              <span>{item.name}</span>
            </div>

            {/* Quantity * Price Calculation */}
            <p className="flex justify-between text-xs">
              <span>
                ({item.quantity} pcs * {item.sellingPrice.toFixed(2)})
              </span>
              <span>{(item.quantity * item.sellingPrice).toFixed(2)}</span>
            </p>

            {/* CGST and SGST */}
            <p className="text-xs">
              {item.sellingPriceTaxType ? "incl" : "excl"}. CGST {item.cgst}%
            </p>
            <p className="text-xs">
              {item.sellingPriceTaxType ? "incl" : "excl"}. SGST {item.sgst}%
            </p>
          </div>
        ))}
      </div>

      <div className="text-right mt-4 border-t border-dashed pt-2">
        <p className="font-semibold">
          Sub Total:{" "}
          <span className="ml-2">₹{dataSet.subTotal.toFixed(2)}</span>
        </p>

        <div className="grid grid-cols-2 gap-1 text-xs mt-2">
          {dataSet.totalCgstAmount_9 > 0 && (
            <>
              <p className="text-gray-600">CGST 9.0%:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.totalCgstAmount_9.toFixed(2)}
              </p>
            </>
          )}

          {dataSet.totalSgstAmount_9 > 0 && (
            <>
              <p className="text-gray-600">SGST 9.0%:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.totalSgstAmount_9.toFixed(2)}
              </p>
            </>
          )}

          {dataSet.totalCgstAmount_6 > 0 && (
            <>
              <p className="text-gray-600">CGST 6.0%:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.totalCgstAmount_6.toFixed(2)}
              </p>
            </>
          )}

          {dataSet.totalSgstAmount_6 > 0 && (
            <>
              <p className="text-gray-600">SGST 6.0%:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.totalSgstAmount_6.toFixed(2)}
              </p>
            </>
          )}

          {dataSet.totalCgstAmount_2_5 > 0 && (
            <>
              <p className="text-gray-600">CGST 2.5%:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.totalCgstAmount_2_5.toFixed(2)}
              </p>
            </>
          )}

          {dataSet.totalSgstAmount_2_5 > 0 && (
            <>
              <p className="text-gray-600">SGST 2.5%:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.totalSgstAmount_2_5.toFixed(2)}
              </p>
            </>
          )}
        </div>

        <p className="font-bold text-lg mt-2 border-t border-dashed pt-2">
          Total Amount:{" "}
          <span className="ml-2">₹{dataSet.total.toFixed(2)}</span>
        </p>
      </div>
      <div className="my-4 py-2 border-b border-t border-dashed">
        <p className="flex justify-start">
          <span className="">Bank Details</span>
        </p>
        <p>Bank : { }</p>
        <p>Account : { }</p>
        <p>IFSC Code : { }</p>
        <p>Branch : { }</p>
      </div>

      <hr className="my-2 border-t border-dashed" />

      <div className="text-center font-bold">
        <p>THANK YOU!</p>
      </div>
    </div>
  );
}
)
Template2Inch.displayName = "Template2Inch";

export default Template2Inch;
