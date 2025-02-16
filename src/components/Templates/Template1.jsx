import PropTypes from "prop-types";
import { forwardRef } from "react";
import { useSelector } from "react-redux";

const Template1 = forwardRef((props, ref) => {
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const { dataSet, bankDetails } = props;
  if (Object.keys(dataSet).length === 0) {
    return;
  }
  const removedColumn = { service: ["QUANTITY"] };

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
      style={{ height: "80vh", width: "600px" }}
    >
      <div ref={ref} style={{ minWidth: "595px", padding: "20px" }}>
        <div className="flex justify-between">
          <div>
            <div className="text-lg font-bold text-start">
              <div className="border w-[89px] h-[89px] shadow flex items-center justify-center">
                {companyDetails?.companyLogo ? (
                  <img
                    src={companyDetails?.companyLogo}
                    className="rounded-md object-contain w-[89px] h-[89px]"
                  />
                ) : (
                  <>{dataSet?.createdBy?.name}</>
                )}
              </div>
            </div>
            <div>Mobile : {dataSet?.createdBy?.phoneNo}</div>
            <div>Email : {dataSet?.createdBy?.email}</div>
          </div>
          <div>
            <h3 className="font-bold uppercase">TAX {dataSet?.type}</h3>
          </div>
        </div>
        <div className="flex justify-between text-start">
          <div className="mt-2 text-start">
            <strong>Bill To :</strong>
            <div>{dataSet?.userTo?.name}</div>
            <div>Ph : {dataSet?.userTo?.phone}</div>
          </div>
          <div>
            <div>
              <strong>{dataSet?.type} # :</strong>
              {dataSet?.prefix}- {dataSet?.no}
            </div>
            <div>
              <strong>GST :</strong>
              {companyDetails?.gst}
            </div>
            <div>
              <strong>{dataSet?.type} Date :</strong>{" "}
              {DateFormate(dataSet?.date)}
            </div>
            <div>
              <strong>Due Date :</strong> {DateFormate(dataSet?.dueDate)}
            </div>
            <div className="text-end">
              <strong>Place of Supply :</strong>
              <p>{dataSet?.userTo.address}</p>
              <p> {dataSet?.userTo.city}</p>
              <p> {dataSet?.userTo.zipCode}</p>
            </div>
          </div>
        </div>
        <div className="w-full">
          <table className="w-full mt-5 text-sm">
            <thead>
              <tr className="bg-blue-700 text-white text-center ">
                <th className="border border-black pb-2">Sl. No</th>
                <th className="border border-black pb-2">Product</th>
                <th className="border border-black pb-2">Unit Price</th>
                <th className="border border-black pb-2">Discount</th>
                {!removedColumn[dataSet?.type.toLowerCase()]?.includes(
                  "QUANTITY"
                ) && <th className="border border-black pb-2">Qty</th>}
                <th className="border border-black pb-2">Net Amount</th>
                <th className="border border-black pb-2">Tax Rate</th>
                <th className="border border-black pb-2">CGST</th>
                <th className="border border-black pb-2">SGST</th>
                <th className="border border-black pb-2">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {dataSet?.items.map((item, index) => (
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
                  {!removedColumn[dataSet?.type.toLowerCase()]?.includes(
                    "QUANTITY"
                  ) && (
                      <td className="border border-black pt-2 pb-2 pl-1">
                        {item.quantity}
                      </td>
                    )}
                  <td className="border border-black pt-2 pb-2 pl-1">
                    {item.sellingPrice.toFixed(1)}
                  </td>
                  <td className="border border-black pt-2 pb-2 pl-1">
                    {item.tax}%
                  </td>
                  <td className="border border-black pt-2 pb-2 pl-1">
                    {item.cgstAmount.toFixed(2)}{" "}
                    {/* Assuming cgstAmount is available in item */}
                  </td>
                  <td className="border border-black pt-2 pb-2 pl-1">
                    {item.sgstAmount.toFixed(2)}{" "}
                    {/* Assuming sgstAmount is available in item */}
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
          {dataSet?.shippingCharges > 0 && (
            <div>
              Delivery/Shipping Charges :
              <span className="ml-5"> {dataSet?.shippingCharges}</span>
            </div>
          )}
          {dataSet?.packagingCharges > 0 && (
            <div>
              Packaging Charges :
              <span className="ml-5"> {dataSet?.packagingCharges}</span>
            </div>
          )}
        </div>

        <div className="mt-4 mb-3 text-end">
          {dataSet?.tcs?.isTcsApplicable && (
            <div>
              TCS :
              <span className="ml-5">
                {dataSet?.tcs?.tcs_amount.toFixed(2)}
              </span>
            </div>
          )}
          {dataSet?.tds?.isTdsApplicable && (
            <div>
              TDS :
              <span className="ml-5">
                {dataSet?.tds?.tds_amount.toFixed(2)}
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
        <hr />
        <div className="text-end font-bold">
          <h3>Total : ₹ {+dataSet?.total?.toFixed(2)}</h3>
        </div>

        <div className=" flex justify-between">
          {bankDetails && (
            <div>
              <div>
                <strong>Bank Details</strong>
              </div>
              <div>
                Bank :{" "}
                <span className="font-bold">{bankDetails?.bankName}</span>{" "}
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
                Branch :{" "}
                <span className="font-bold">{bankDetails?.branch}</span>
              </div>
            </div>
          )}
          <div className="mt-24">
            {dataSet.sign && (
              <img
                src={dataSet.sign}
                alt={dataSet?.createdBy?.name}
                className="w-36 h-14 mix-blend-multiply object-contain"
              />
            )}
            <div>Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
});
Template1.propTypes = {
  dataSet: PropTypes.object,
  bankDetails: PropTypes.object,
};

Template1.displayName = "Template1";

export default Template1;
