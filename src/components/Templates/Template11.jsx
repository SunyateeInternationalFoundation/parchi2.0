import PropTypes from "prop-types";
import { forwardRef } from "react";
import { useSelector } from "react-redux";

const Template11 = forwardRef((props, ref) => {
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
      className=" border border-gray-300 rounded-md shadow-md overflow-y-auto"
      style={{ height: "90vh", width: "700px" }}
    >
      <div ref={ref} style={{ width: "595px" }}>
        <div className="bg-white" style={{ padding: "20px" }}>
          <header className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-gray-700">
              {dataSet?.type}
            </h1>
            <div>
              <span className="text-3xl font-bold text-primary-600">
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
              </span>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-8 mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-600 uppercase">
                {dataSet?.type} NUMBER #
              </h2>
              <p className="text-sm text-gray-700 bg-blue-100 w-fit pe-3">
                {dataSet?.prefix}- {dataSet?.no}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-600 uppercase">GST</h2>
              <p className="text-sm text-gray-700 bg-blue-100 w-fit pe-3">
                {companyDetails?.gst}
              </p>
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
                <p>{dataSet?.createdBy.phoneNo}</p>
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
                  CGST
                </th>
                <th className="bg-blue-100  me-2 p-2 text-left text-sm font-bold text-gray-600">
                  SGST
                </th>
                <th className="bg-blue-100  me-2 p-2 text-left text-sm font-bold text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {dataSet?.items.map((item, index) => (
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
                    {item.cgstAmount.toFixed(2)}
                  </td>
                  <td className="bg-blue-100 p-2 text-sm text-gray-700">
                    {item.sgstAmount.toFixed(2)}
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
            <div className="flex justify-end ">
              <div className="">
                {dataSet.sign && (
                  <img
                    src={dataSet.sign}
                    alt={dataSet?.createdBy?.name}
                    className="w-36 h-14 mix-blend-multiply object-contain"
                  />
                )}
                <div className="text-end px-4">Authorized Person</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
});
Template11.propTypes = {
  dataSet: PropTypes.object.isRequired,
};

Template11.displayName = "Template11";
export default Template11;
