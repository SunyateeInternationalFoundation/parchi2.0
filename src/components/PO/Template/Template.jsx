import React, { forwardRef } from "react";

const Template = forwardRef((props, ref) => {
  const { poData, bankDetails } = props;
  if (!poData) {
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
  const ModifiedPoData = {
    ...poData,
    items: poData.products.map((item) => {
      let discount = +item.discount || 0;

      if (item.discountType) {
        discount = (+item.sellingPrice / 100) * item.discount;
      }
      const netAmount = item.sellingPrice - (discount || 0);
      const taxRate = item.tax || 0;
      const sgst = taxRate / 2;
      const cgst = taxRate / 2;
      const taxAmount = netAmount * (taxRate / 100);
      const sgstAmount = netAmount * (sgst / 100);
      const cgstAmount = netAmount * (cgst / 100);
      return {
        ...item,
        sgst,
        cgst,
        taxAmount,
        sgstAmount,
        cgstAmount,
        totalAmount: netAmount * item.quantity,
        netAmount,
      };
    }),
  };

  const totalTaxableAmount = ModifiedPoData.items.reduce(
    (sum, product) => sum + product.netAmount * product.quantity,
    0
  );

  const totalSgstAmount_2_5 = ModifiedPoData.items.reduce(
    (sum, product) =>
      product.sgst === 2.5 ? sum + product.sgstAmount * product.quantity : sum,
    0
  );

  const totalCgstAmount_2_5 = ModifiedPoData.items.reduce(
    (sum, product) =>
      product.cgst === 2.5 ? sum + product.cgstAmount * product.quantity : sum,
    0
  );

  const totalSgstAmount_6 = ModifiedPoData.items.reduce(
    (sum, product) =>
      product.sgst === 6 ? sum + product.sgstAmount * product.quantity : sum,
    0
  );

  const totalCgstAmount_6 = ModifiedPoData.items.reduce(
    (sum, product) =>
      product.cgst === 6 ? sum + product.cgstAmount * product.quantity : sum,
    0
  );

  const totalSgstAmount_9 = ModifiedPoData.items.reduce(
    (sum, product) =>
      product.sgst === 9 ? sum + product.sgstAmount * product.quantity : sum,
    0
  );

  const totalCgstAmount_9 = ModifiedPoData.items.reduce(
    (sum, product) =>
      product.cgst === 9 ? sum + product.cgstAmount * product.quantity : sum,
    0
  );

  const totalAmount =
    totalTaxableAmount +
    totalSgstAmount_2_5 +
    totalCgstAmount_2_5 +
    totalSgstAmount_6 +
    totalCgstAmount_6 +
    totalSgstAmount_9 +
    totalCgstAmount_9;

  return (
    <div
      className="invoice"
      ref={ref}
      style={{ width: "595px", padding: "20px" }}
    >
      <div className="flex justify-between">
        <div>
          <div className="text-lg font-bold text-start">
            {ModifiedPoData?.createdBy?.name}
          </div>
          <div>Mobile : {ModifiedPoData?.createdBy?.phoneNo}</div>
        </div>
        <div>
          <h3 className="font-bold">TAX INVOICE</h3>
        </div>
      </div>
      <div className="flex justify-between text-start">
        <div className="mt-2 text-start">
          <strong>Bill To :</strong>
          <div>{ModifiedPoData.vendorDetails.name}</div>
          <div>Ph : {ModifiedPoData.vendorDetails.phone}</div>
        </div>
        <div>
          <div>
            <strong>PO # :</strong> {ModifiedPoData.poNo}
          </div>
          <div>
            <strong>PO Date :</strong> {DateFormate(ModifiedPoData.date)}
          </div>

          <div>
            <strong>Place of Supply :</strong> -
          </div>
        </div>
      </div>
      <div className="w-full">
        <table className="w-full mt-5 text-sm">
          <thead>
            <tr className="bg-blue-700 text-white text-center ">
              <th className="border border-black pb-2">Sl. No</th>
              <th className="border border-black pb-2">Description</th>
              <th className="border border-black pb-2">Unit Price</th>
              <th className="border border-black pb-2">Discount</th>
              <th className="border border-black pb-2">Qty</th>
              <th className="border border-black pb-2">Net Amount</th>
              <th className="border border-black pb-2">Tax Rate</th>
              <th className="border border-black pb-2">Tax Type</th>
              <th className="border border-black pb-2">Tax Amount</th>
              <th className="border border-black pb-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {ModifiedPoData.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {index + 1}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.name}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.sellingPrice.toFixed(1)}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.discount.toFixed(1)}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.quantity}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.sellingPrice.toFixed(1)}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.tax}%
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  CGST SGST
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.taxAmount.toFixed(2)}
                </td>
                <td className="border border-black pt-2 pb-2 pl-1">
                  {item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-end">
        {ModifiedPoData.shippingCharges > 0 && (
          <div>
            Delivery/Shipping Charges :
            <span className="ml-5"> {ModifiedPoData.shippingCharges}</span>
          </div>
        )}
        {ModifiedPoData.packagingCharges > 0 && (
          <div>
            Packaging Charges :
            <span className="ml-5"> {ModifiedPoData.packagingCharges}</span>
          </div>
        )}
      </div>

      <div className="mt-4 mb-3 text-end">
        {ModifiedPoData.tcs.isTcsApplicable && (
          <div>
            TCS :
            <span className="ml-5">
              {ModifiedPoData.tcs.tcs_amount.toFixed(2)}
            </span>
          </div>
        )}
        {ModifiedPoData.tds.isTdsApplicable && (
          <div>
            TDS :
            <span className="ml-5">
              {ModifiedPoData.tds.tds_amount.toFixed(2)}
            </span>
          </div>
        )}
        {totalCgstAmount_9 > 0 && (
          <div>
            CGST 9.0% :
            <span className="ml-5">{totalCgstAmount_9.toFixed(2)}</span>
          </div>
        )}
        {totalSgstAmount_9 > 0 && (
          <div>
            SGST 9.0% :
            <span className="ml-5">{totalSgstAmount_9.toFixed(2)}</span>
          </div>
        )}
        {totalCgstAmount_2_5 > 0 && (
          <div>
            CGST 2.5% :
            <span className="ml-5">{totalCgstAmount_2_5.toFixed(2)}</span>
          </div>
        )}
        {totalSgstAmount_2_5 > 0 && (
          <div>
            SGST 2.5% :
            <span className="ml-5">{totalSgstAmount_2_5.toFixed(2)}</span>
          </div>
        )}
      </div>
      <hr />
      <div className="text-end font-bold">
        <h3>Total : {+ModifiedPoData.total?.toFixed(2)}</h3>
      </div>

      <div className=" flex justify-between">
        <div>
          <div>
            <strong>Bank Details</strong>
          </div>
          <div>
            Bank : <span className="font-bold">{bankDetails.bankName}</span>{" "}
          </div>
          <div>
            Account # :{" "}
            <span className="font-bold">{bankDetails.accountNo}</span>
          </div>
          <div>
            IFSC Code :{" "}
            <span className="font-bold">{bankDetails.ifscCode}</span>
          </div>
          <div>
            Branch : <span className="font-bold">{bankDetails.branch}</span>
          </div>
        </div>
        <div className="mt-24">
          <div>Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
});

export default Template;
