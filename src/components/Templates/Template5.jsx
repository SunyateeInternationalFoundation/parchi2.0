import PropTypes from "prop-types";
import { forwardRef } from "react";
import { useSelector } from "react-redux";

const Template5 = forwardRef((props, ref) => {
  const { dataSet } = props;
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];
  if (!Object.keys(dataSet).length === 0) {
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
      style={{ height: "90vh", width: "700px" }}
    >
      <div ref={ref} style={{ minWidth: "595px", padding: "20px" }}>
        {/* Header */}
        <div className="flex justify-between items-center ">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-green-500">
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
            </h1>
            <div>
              <div className="font-bold">
                {dataSet?.createdBy?.name} {dataSet?.type}{" "}
              </div>
              {/* <p><span></span>GSTIN: 4828E9B55BD92X6</p> */}
              <p>
                {" "}
                <span className="font-bold">Email: </span>{" "}
                {dataSet?.createdBy?.email}
              </p>
              <p>
                <span className="font-bold">Phone: </span>{" "}
                {dataSet?.createdBy?.phoneNo}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p>
              <span className="font-bold">Total:</span> ₹
              {+dataSet?.total?.toFixed(2)}
            </p>
            <p>
              <span className="font-bold">{dataSet?.type} Date:</span>
              {DateFormate(dataSet?.dueDate)}
            </p>
            <p>
              <span className="font-bold">{dataSet?.type} No #:</span>{" "}
              {dataSet?.prefix}- {dataSet?.no}
            </p>
            <p>
              <span className="font-bold">GST:</span> {companyDetails?.gst}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center my-3">
          <div className="border w-full"></div>
          <div className="text-green-500 w-full text-center uppercase">
            TAX {dataSet?.type}
          </div>
          <div className="border w-full"></div>
        </div>
        {/* Tax {dataSet?.type} Details */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <p className="font-bold">User Name:</p>
            <p>{dataSet?.userTo?.name}</p>
            {/* <p>Customer GSTIN: 4828E9B55BD92X6</p> */}
          </div>
          <div>
            <p className="font-bold">Billing Address:</p>
            <p>
              {" "}
              {dataSet?.createdBy.address}
              {dataSet?.createdBy.city}
              {dataSet?.createdBy.zipCode}
            </p>
          </div>
          <div>
            <p className="font-bold">Shipping Address:</p>
            <p>
              {" "}
              {dataSet?.userTo.address}
              {dataSet?.userTo.city}
              {dataSet?.userTo.zipCode}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6 border-dotted border-black border-y-2 p-2">
          <div>
            <p>
              <span className="font-bold">County of Supply: </span>India
            </p>
          </div>
          <div>
            <p>
              <span className="font-bold">Place of Supply: </span>
              {dataSet?.userTo.city}
            </p>
          </div>
          <div>
            <p>
              <span className="font-bold">Due Date:</span>{" "}
              {DateFormate(dataSet?.dueDate)}
            </p>
          </div>
        </div>

        {/* {dataSet?.type} Table */}
        <table className="w-full mt-5 border">
          <thead>
            <tr className="bg-gray-200 text-start ">
              <th className="text-start pl-1 pb-2">Item</th>
              <th className="text-start pl-1 pb-2">Rate</th>
              <th className="text-start pl-1 pb-2">Discount</th>
              <th className="text-start pl-1 pb-2">Unit Price</th>
              <th className="text-start pl-1 pb-2">Qty</th>
              <th className="text-start pl-1 pb-2">CGST</th>
              <th className="text-start pl-1 pb-2">SGST</th>
              <th className="text-start pl-1 pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {dataSet?.items.map((item, index) => (
              <tr key={index} className="border-t-2">
                <td className="pt-2 pb-2 pl-1">{item.name}</td>
                <td className="pt-2 pb-2 pl-1">{item.tax}%</td>
                <td className="pt-2 pb-2 pl-1">{item.discount.toFixed(1)}</td>
                <td className="pt-2 pb-2 pl-1">
                  {item.sellingPrice.toFixed(1)}
                </td>
                <td className="pt-2 pb-2 pl-1">{item.quantity}</td>
                <td className="pt-2 pb-2 pl-1">
                  {item.cgstAmount.toFixed(2)}
                </td>{" "}
                {/* Assuming cgstAmount is available in item */}
                <td className="pt-2 pb-2 pl-1">
                  {item.sgstAmount.toFixed(2)}
                </td>{" "}
                {/* Assuming sgstAmount is available in item */}
                <td className="pt-2 pb-2 pl-1">
                  {item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between my-3">
          <div className="w-full">
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
          </div>
          <div className="w-1/2">
            <div className="grid grid-cols-2 text-end">
              <div>Sub Total:</div>
              <div>₹{+dataSet?.subTotal?.toFixed(2)}</div>
              <div>Discount:</div>{" "}
              <div>
                {!dataSet?.extraDiscountType && "₹"}
                {dataSet?.extraDiscount}
                {dataSet?.extraDiscountType && "%"}
              </div>
              <div>Tax:</div>
              <div className=" border-b-2  border-black border-dotted">
                {" "}
                {dataSet?.tax}%
              </div>
            </div>
            <div className="font-bold grid grid-cols-2 text-end pt-3">
              <div>Total:</div>
              <div>₹{+dataSet?.total?.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="">
          {dataSet.sign && (
            <img
              src={dataSet.sign}
              alt={dataSet?.createdBy?.name}
              className="w-36 h-14 mix-blend-multiply object-contain"
            />
          )}
          <div className="px-4">Authorized Person</div>
        </div>
      </div>
    </div>
  );
});
Template5.propTypes = {
  dataSet: PropTypes.object.isRequired,
};

Template5.displayName = "Template5";
export default Template5;
