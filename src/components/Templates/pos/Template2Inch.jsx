import React, { forwardRef } from "react";

const Template2Inch = forwardRef((props, ref) => {
  const { dataSet, size } = props;
  if (Object.keys(dataSet).length === 0) {
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
    <div className={`w-[${size}in] mx-auto border p-4 text-xs font-mono bg-white`} ref={ref}>
      <div className="text-center">
        <h2 className="text-2xl">{dataSet.createdBy.name}</h2>

        <p>Welcome to {dataSet.createdBy.name} {dataSet.createdBy.address} - {dataSet.createdBy.city}!</p>
      </div>

      <hr className="my-2 border-t-2 border-dashed" />
      <p className="text-center">Original for Recipient</p>

      <div className="mt-2">
        <p>{dataSet.createdBy.name},</p>
        <p>{dataSet.createdBy.email}</p>
        <p>{dataSet.createdBy.phone}</p>
        <p>{dataSet.createdBy.address}</p>
        <p>{dataSet.createdBy.city} {dataSet.createdBy.zipCode}</p>
        {/* <p>GSTIN: 36AADCI3006N1ZL</p> */}
      </div>

      {/* <hr className="my-2 border-t border-dashed" /> */}

      <p className="mt -1 text-center">Tax Invoice</p>
      <div className="mt-2">
        <p>
          <span className="">Date:</span>{DateFormate(dataSet.dueDate)}
        </p>
        <p>
          <span className="">Number:</span> {dataSet.no}
        </p>
        <p>
          <span className="">Place of Supply:</span>
          <p>{dataSet?.userTo.name}</p>
          <p>{dataSet?.userTo.phone}</p>
          <p>{dataSet?.userTo.address}</p>
          <p> {dataSet?.userTo.city}</p>
          <p> {dataSet?.userTo.zipCode}</p>
        </p>
      </div>


      <div className="mt-2">

        {dataSet.items.map((item, index) => (
          <div key={index} className="mt-2">
            <div className="flex justify-between">
              <span>{item.name}</span>
            </div>

            <p className="flex justify-between text-xs">
              <span>
                ({item.quantity} pcs * {item.sellingPrice.toFixed(2)})
              </span>
              <span>{item.totalAmount.toFixed(2)}</span>
            </p>

            <p className="text-xs">
              Discount {item.discountType ? `${item.discount}%` : `₹${item.discount}`}
            </p>
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
          {dataSet.shippingCharges > 0 && (
            <>
              <p className="text-gray-600">Shipping Charges:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.shippingCharges}
              </p>
            </>
          )}

          {dataSet.packagingCharges > 0 && (
            <>
              <p className="text-gray-600">Packaging Charges:</p>
              <p className="text-gray-800 font-medium">
                ₹{dataSet.packagingCharges}
              </p>
            </>
          )}
          {dataSet.extraDiscount > 0 && (
            <>
              <p className="text-gray-600">Extra Discount:</p>
              <p className="text-gray-800 font-medium">
                {dataSet.extraDiscountType ? `${dataSet.extraDiscount}%` : `₹${dataSet.extraDiscount}`}
              </p>
            </>
          )}
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
