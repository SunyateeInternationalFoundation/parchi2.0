import React, { useState, useEffect } from "react";
import { IoMdDownload } from "react-icons/io";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useSelector } from "react-redux";

const VendorPO = () => {
  const [loading, setLoading] = useState(false);
  const [companiesId, setCompaniesId] = useState([]);
  const [po, setPo] = useState([]);
  const userDetails = useSelector((state) => state.users);
  const phone = userDetails.phone;

  useEffect(() => {
    async function fetchVendorCompanies() {
      setLoading(true);
      try {
        const customerRef = collection(db, "vendors");
        const q = query(customerRef, where("phone", "==", phone));
        const getData = await getDocs(q);
        const getCompaniesId = getData.docs.map((doc) => {
          const { name, companyRef } = doc.data();
          return {
            id: doc.id,
            name,
            companyId: companyRef.id,
          };
        });
        setCompaniesId(getCompaniesId);
      } catch (error) {
        console.log("🚀 ~ fetchVendorCompanies ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVendorCompanies();
  }, []);

  useEffect(() => {
    setLoading(true);
    async function fetchPO() {
      try {
        const POList = [];
        const phoneNo = phone.startsWith("+91") ? phone.slice(3) : phone;
        for (const company of companiesId) {
          console.log(company.companyId);

          const poRef = collection(
            db,
            "companies",
            company.companyId,
            "purchases"
          );
          const q = query(poRef, where("vendorDetails.phone", "==", phoneNo));
          const getData = await getDocs(q);
          const getAllPO = getData.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });
          POList.push(...getAllPO);
        }
        console.log("🚀 ~ fetchPO ~ POList:", POList);

        setPo(POList);
      } catch (error) {
        console.log("🚀 ~ fetchPO ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPO();
  }, [companiesId]);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">PO</h1>
        </header>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          {loading ? (
            <div className="text-center py-6">Loading PO...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "70vh" }}>
              <table className="w-full border-collapse  h-28 text-center">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b">
                    <th className="p-4">Company Name</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">PO No</th>
                    <th className="p-4">Date / Updated Time</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {po.length > 0 ? (
                    po.map((p) => (
                      <tr key={p.id} className="border-b text-center">
                        <td className="py-3">
                          {p.createdBy?.name} <br />
                          <span className="text-gray-500">
                            {p.vendorDetails.phone}
                          </span>
                        </td>
                        <td className="py-3">{`₹ ${p.total.toFixed(2)}`}</td>
                        <td className="py-3">{p.paymentStatus}</td>
                        <td className="py-3">{p.mode || "Online"}</td>
                        <td className="py-3">{p.poNo}</td>

                        <td className="py-3">
                          {(() => {
                            if (
                              p.date.seconds &&
                              typeof p.date.seconds === "number"
                            ) {
                              const date = new Date(p.date.seconds * 1000);
                              const today = new Date();
                              const timeDiff =
                                today.setHours(0, 0, 0, 0) -
                                date.setHours(0, 0, 0, 0);
                              const daysDiff = Math.floor(
                                timeDiff / (1000 * 60 * 60 * 24)
                              );

                              if (daysDiff === 0) return "Today";
                              if (daysDiff === 1) return "Yesterday";
                              return `${daysDiff} days ago`;
                            } else {
                              return "Date not available";
                            }
                          })()}
                        </td>

                        <td className="py-3 space-x-2">
                          <button className="relative group text-green-500 hover:text-green-700 text-xl">
                            <IoMdDownload />
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-5 px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100">
                              Download
                            </div>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No PO found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPO;
