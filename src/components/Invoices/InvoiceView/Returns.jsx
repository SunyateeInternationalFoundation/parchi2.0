import {
  addDoc,
  collection,
  doc,
  increment,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { db } from "../../../firebase";

function Returns({ invoice }) {
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [isAllReturnsChecked, setIsAllReturnsChecked] = useState(false);

  useEffect(() => {
    setProducts([...invoice.items]);
  }, [invoice]);

  const userDetails = useSelector((state) => state.users);
  let companyId;
  if (userDetails.selectedDashboard === "staff") {
    companyId =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        .companyDetails.companyId;
  } else {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  }

  function handleActionQty(op, productId) {
    let updatedProducts = products.map((product) => {
      if (product.productRef.id === productId) {
        if (!product.actionQty) {
          product.actionQty = 0;
        }
        if (op === "+") {
          if (product.quantity - product.returnQty > product.actionQty) {
            ++product.actionQty;
          }
        } else {
          if (0 < product.actionQty) {
            --product.actionQty;
          }
        }
        product.actionQty = Math.max(product.actionQty, 0);
        product.totalAmount = product.netAmount * product.actionQty;
      }
      return product;
    });
    setIsAllReturnsChecked(false);
    setProducts(updatedProducts);
  }

  function handleCheckBox(value, isAll = false, productId = "") {
    let updatedProducts = products.map((product) => {
      if (isAll) {
        if (value) {
          product.actionQty = product.quantity;
        } else {
          product.actionQty = 0;
        }
        product.totalAmount = product.netAmount * product.actionQty;
        return product;
      }
      if (product.productRef.id === productId) {
        if (value) {
          product.actionQty = product.quantity;
        } else {
          product.actionQty = 0;
        }
      }
      return product;
    });
    if (isAll && value) {
      setIsAllReturnsChecked(true);
    } else {
      setIsAllReturnsChecked(false);
    }
    setProducts(updatedProducts);
  }

  async function onSubmit() {
    try {
      let isUpdated = false;
      let UpdateProduct = [];
      for (const product of products) {
        if (!product.actionQty) {
          UpdateProduct.push(product);
          continue;
        }
        isUpdated = true;
        const payload = {
          createdAt: Timestamp.fromDate(new Date()),
          name: product.name,
          quantity: product.actionQty,
          amount: product.totalAmount,
          productRef: product.productRef,
        };

        await addDoc(
          collection(db, "companies", companyId, "invoices", id, "returns"),
          payload
        );

        await updateDoc(product.productRef, {
          stock: increment(product.actionQty),
        });

        let productPayloadLogs = {
          date: payload.createdAt,
          status: "return",
          quantity: product.actionQty,
          from: "invoice",
          ref: doc(db, "companies", companyId, "invoices", id),
        };

        await addDoc(
          collection(product.productRef, "logs"),
          productPayloadLogs
        );

        UpdateProduct.push({
          ...product,
          quantity: product.quantity - product.actionQty,
          actionQty: 0,
          totalAmount: 0,
        });
      }
      if (!isUpdated) {
        alert("select Product Quantity");
        return;
      }
      setProducts(UpdateProduct);
      alert("successfully return the Product");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  }

  return (
    <div className="main-container " style={{ height: "82vh" }}>
      <div className="container" style={{ height: "72vh" }}>
        <div className="text-end pb-2 space-x-3 px-5">
          <button
            className="px-4 py-2 text-gray-600  rounded-md border hover:bg-black hover:text-white"
            onClick={onSubmit}
          >
            Submit
          </button>

          <button
            className="px-4 py-2 text-gray-600  rounded-md border hover:bg-black hover:text-white"
            onClick={() => {
              setProducts((val) =>
                val.map((item) => {
                  item.actionQty = 0;
                  item.amount = 0;
                  item.totalAmount = 0;
                  return item;
                })
              );
            }}
          >
            Cancel
          </button>
        </div>

        <div className="overflow-y-auto" style={{ height: "62vh " }}>
          <table className="w-full text-center text-gray-500 font-semibold">
            <thead className="border-b ">
              <tr>
                <th className="px-1 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={isAllReturnsChecked}
                    onChange={(e) => {
                      handleCheckBox(e.target.checked, true);
                    }}
                  />
                  &nbsp; All
                </th>
                <th className="px-1 py-4">Product Name</th>
                <th className="px-1 py-4">Quantity</th>
                <th className="px-1 py-4">Unit Price</th>
                <th className="px-1 py-4">Discount</th>
                <th className="px-1 py-4">Net Amount</th>
                <th className="px-1 py-4">Is Tax Included</th>
                <th className="px-1 py-4">Return Amount</th>
                <th className="px-1 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.productRef.id} className="border-b">
                    <td className="px-1 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={product.actionQty === product.quantity}
                        onChange={(e) => {
                          handleCheckBox(
                            e.target.checked,
                            false,
                            product.productRef.id
                          );
                        }}
                      />
                    </td>
                    <td className="px-1 py-4">{product.name}</td>
                    <td className="px-1 py-4">
                      {product.quantity - product.returnQty}
                    </td>
                    <td className="px-1 py-4">₹{product.sellingPrice}</td>
                    <td className="px-1 py-4">₹{product.discount}</td>
                    <td className="px-1 py-4">₹{product.netAmount}</td>
                    <td className="px-1 py-4">
                      {product.sellingPriceTaxType ? "Yes" : "No"}
                    </td>
                    <td className="px-1 py-4">₹{product.totalAmount || 0}</td>
                    <td className="px-1 py-4">
                      <div className="flex justify-center -items-center">
                        {product.actionQty >= 1 && (
                          <>
                            <button
                              className="bg-blue-500 text-white rounded w-1/2"
                              onClick={() =>
                                handleActionQty("-", product.productRef.id)
                              }
                            >
                              -
                            </button>
                            <span className="px-2">{product.actionQty}</span>{" "}
                          </>
                        )}
                        <button
                          className="bg-blue-500 text-white  rounded w-1/2 "
                          onClick={() =>
                            handleActionQty("+", product.productRef.id)
                          }
                          disabled={product.quantity - product.returnQty === 0}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center">
                    No Product Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
Returns.propTypes = {
  invoice: PropTypes.object.isRequired,
};

export default Returns;
