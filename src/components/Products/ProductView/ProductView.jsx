import { useEffect, useState } from "react";

const ProductView = ({ productData }) => {
  const [product, setProduct] = useState(productData);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productData?.id) {
      return;
    }
    setLoading(true);
    setProduct(productData);
    setLoading(false);
  }, [productData]);
  console.log("produt", productData);

  const subTotal = product?.sellingPrice * product?.stock;
  const taxAmount = (subTotal * product?.tax) / 100;
  const total = subTotal + taxAmount;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading product...
      </div>
    );
  }

  return (
    <div className="main-container" style={{ height: "80vh" }}>
      <div className="container2">
        <div>
          <div className="border-b space-y-3 ">
            <div className="border-b py-3 px-5 space-y-2">
              <div className="">Product Information</div>
              <div className="space-y-1">
                <label className="  text-gray-600">Item Name</label>
                <p type="text" name="name" className="input-tag w-full ">
                  {product?.name || ""}{" "}
                </p>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Category</label>
                <div className="flex justify-center items-center">
                  <p className="input-tag w-full">{product?.category || ""} </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Selling Price</label>

                <div className="flex items-center justify-center">
                  <p
                    className="w-1/2 input-tag "
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  >
                    {" "}
                    ₹ {product?.sellingPrice || ""}{" "}
                  </p>{" "}
                  <p
                    className="w-1/2 input-tag"
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  >
                    {product?.sellingPriceTaxType
                      ? "Tax Included"
                      : "Tax not Included"}{" "}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Purchase Price</label>

                <div className="flex items-center justify-center">
                  <p
                    className="w-1/2 input-tag"
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  >
                    {" "}
                    ₹ {product?.purchasePrice ?? ""}{" "}
                  </p>{" "}
                  <p
                    className="w-1/2 input-tag"
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  >
                    {product?.purchasePriceTaxType
                      ? "Tax Included"
                      : "Tax not Included"}{" "}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Discount</label>

                <div className="flex items-center justify-center ">
                  <p
                    className="w-full input-tag"
                    style={{
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  >
                    {" "}
                    {product?.discountType
                      ? `${product?.discount}%`
                      : `₹ ${product?.discount}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div>Product Media</div>
              <div className="space-y-1">
                <div className="grid w-full mb-2 items-center gap-1.5">
                  <label className=" text-gray-600">Product Image</label>

                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product?.name || "Product"}
                      className="w-32 h-32 rounded-md object-contain"
                    />
                  ) : (
                    <div className="bg-red-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      {product?.name?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div className="">Inventory</div>
              <div className="flex space-x-3">
                <div className="space-y-1 w-full">
                  <label className="  text-gray-600">SKU ID</label>
                  <p className="w-full input-tag">{product?.skuId || ""} </p>
                </div>
                <div className="space-y-1 w-full">
                  <label className="  text-gray-600">Stock</label>
                  <p className="w-full input-tag"> {product?.stock || ""} </p>
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div className="">Shipping & Tax</div>
              <div className="space-y-1">
                <label className="  text-gray-600">Units</label>
                <p className="w-full input-tag"> {product?.units || ""} </p>
              </div>
              <div className="flex-1">
                <label className="  text-gray-600">HSN Code</label>
                <div className="relative w-full">
                  <p className="w-full input-tag">{product?.hsn ?? ""} </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className=" text-gray-600">GST Tax</label>
                <div className="flex items-center justify-center">
                  <p className="w-full input-tag">{product?.tax ?? ""} </p>
                </div>
              </div>
            </div>
            <div className="border-b py-3 px-5 space-y-2">
              <div className="space-y-1">
                <label className="  text-gray-600 ">Barcode</label>
                <p className="w-full input-tag"> {product?.barcode} </p>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Warehouse</label>
                <div className="flex justify-center items-center">
                  <p className="w-full input-tag"> {product?.warehouse} </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="  text-gray-600">Description </label>
                <p className="w-full input-tag">
                  {product?.description || ""}{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container2 bg-white p-5 mt-10">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <p className="font-medium mr-4">Sub Total:</p>
              <p className="font-medium">₹{subTotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium mr-4">TAX Amount:</p>
              <p className="font-medium">₹{taxAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <p className="font-medium mr-4">Purchase Total:</p>
              <p className="font-medium">
                ₹
                {product
                  ? (product.purchasePrice * product.stock).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium mr-4">Total:</p>
              <p className="font-medium">₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
