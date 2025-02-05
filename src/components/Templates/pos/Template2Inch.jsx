import React from "react";
import { forwardRef } from "react";
import { Timestamp } from "firebase/firestore";
import { GiKingJuMask } from "react-icons/gi";

function Template2Inch() {
  const date = Timestamp.fromDate(new Date());
  const dataSet = {
    id: "OHo4nmA95a0xPkRR88b5",
    notes: "",
    shippingCharges: 0,
    dueDate: {
      seconds: 1738643469,
      nanoseconds: 647000000,
    },
    subTotal: 900000.5,
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
      address: "502-Rajaushpa Building, wipro cirlce Nanakramaguda",
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
        quantity: 2,
        purchasePriceTaxType: true,
        purchasePrice: 0,
        tax: 5,
        sellingPrice: 1000,
        description: "",
        sellingPriceTaxType: false,
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
    <div className="w-[288px] mx-auto border p-4 text-xs font-mono">
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
        <p>Bank : {}</p>
        <p>Account : {}</p>
        <p>IFSC Code : {}</p>
        <p>Branch : {}</p>
      </div>

      <hr className="my-2 border-t border-dashed" />

      <div className="text-center font-bold">
        <p>THANK YOU!</p>
      </div>
    </div>
  );
}

export default Template2Inch;
