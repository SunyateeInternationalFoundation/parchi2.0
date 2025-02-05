import { Timestamp } from "firebase/firestore";
import React from "react";
function Template3Inch({ dataSet1, bankDetails1 }) {
  const date = Timestamp.fromDate(new Date());
  const dataSet = {
    id: "OHo4nmA95a0xPkRR88b5",
    notes: "",
    shippingCharges: 0,
    dueDate: {
      seconds: 1738643469,
      nanoseconds: 647000000,
    },
    subTotal: 9.5,
    mode: "Cash",
    withoutT_SAmount: 9.5,
    packagingCharges: 0,
    extraDiscountType: true,
    products: [
      {
        discountType: true,
        quantity: 1,
        purchasePriceTaxType: true,
        purchasePrice: 0,
        tax: 5,
        sellingPrice: 10,
        description: "",
        sellingPriceTaxType: true,
        discount: 5,
        name: "lays",
        returnQty: 0,
      },
    ],
    prefix: "POS",
    terms: "",
    tcs: {
      isTcsApplicable: false,
    },
    tds: {
      isTcsApplicable: false,
    },
    createdBy: {
      name: "Rakesh Company",
      address: "Hyderabad",
      city: "Hyderabad",
      zipCode: "500014",
      who: "owner",
      phoneNo: "6303396201",
    },
    book: {},
    paymentStatus: "UnPaid",
    tax: 5,
    date: {
      seconds: 1738643469,
      nanoseconds: 647000000,
    },
    extraDiscount: 0,
    total: 9.5,
    attachments: [],
    warehouse: {},
    discount: 0,
    type: "POS",
    no: "0001",
    userTo: {
      gstNumber: "",
      city: "",
      phone: "7674917417",
      address: "10142 Samoa Ave, Petaluma",
      zipCode: "",
      name: "ramu sif",
    },
    items: [
      {
        discountType: true,
        quantity: 1,
        purchasePriceTaxType: true,
        purchasePrice: 0,
        tax: 5,
        sellingPrice: 1000,
        description: "",
        sellingPriceTaxType: true,
        discount: 5,
        name: "lays",
        returnQty: 0,
        sgst: 2.5,
        cgst: 2.5,
        taxAmount: 0.47500000000000003,
        sgstAmount: 0.23750000000000002,
        cgstAmount: 0.23750000000000002,
        totalAmount: 9.5,
        netAmount: 9.5,
      },
      {
        discountType: true,
        quantity: 1,
        purchasePriceTaxType: true,
        purchasePrice: 0,
        tax: 5,
        sellingPrice: 10,
        description: "",
        sellingPriceTaxType: true,
        discount: 5,
        name: "chips with masala",
        returnQty: 0,
        sgst: 2.5,
        cgst: 2.5,
        taxAmount: 0.47500000000000003,
        sgstAmount: 0.23750000000000002,
        cgstAmount: 0.23750000000000002,
        totalAmount: 9.5,
        netAmount: 9.5,
      },

      {
        discountType: true,
        quantity: 1,
        purchasePriceTaxType: true,
        purchasePrice: 0,
        tax: 5,
        sellingPrice: 10,
        description: "",
        sellingPriceTaxType: true,
        discount: 5,
        name: "bingo",
        returnQty: 0,
        sgst: 2.5,
        cgst: 2.5,
        taxAmount: 0.47500000000000003,
        sgstAmount: 0.23750000000000002,
        cgstAmount: 0.23750000000000002,
        totalAmount: 9.5,
        netAmount: 9.5,
      },
    ],
    totalTaxableAmount: 9.5,
    totalSgstAmount_2_5: 0.23750000000000002,
    totalCgstAmount_2_5: 0.23750000000000002,
    totalSgstAmount_6: 0,
    totalCgstAmount_6: 0,
    totalSgstAmount_9: 0,
    totalCgstAmount_9: 0,
  };

  return (
    <div className="w-[288px] mx-auto border p-4">
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
}

export default Template3Inch;
