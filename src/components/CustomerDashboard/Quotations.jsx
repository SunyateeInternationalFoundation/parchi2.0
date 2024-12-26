import React, { useEffect, useState } from "react";
import { IoMdDownload } from "react-icons/io";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";

function Quotations() {
  const [loading, setLoading] = useState(false);
  const [companiesId, setCompaniesId] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const userDetails = useSelector((state) => state.users);

  useEffect(() => {
    setLoading(true);
    async function fetchCustomerCompanies() {
      try {
        const customerRef = collection(db, "customers");
        const q = query(customerRef, where("phone", "==", userDetails.phone));
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
        console.log("🚀 ~ fetchCustomerCompanies ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerCompanies();
  }, []);

  useEffect(() => {
    async function fetchQuotations() {
      setLoading(true);
      try {
        const quotationList = [];
        for (const company of companiesId) {
          console.log(company.companyId);

          const quotationRef = collection(
            db,
            "companies",
            company.companyId,
            "quotations"
          );
          const q = query(
            quotationRef,
            where("customerDetails.phoneNumber", "==", userDetails.phone)
          );
          const getData = await getDocs(q);
          const getAllQuotations = getData.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });
          quotationList.push(...getAllQuotations);
        }
        setQuotations(quotationList);
      } catch (error) {
        console.log("🚀 ~ fetchQuotations ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotations();
  }, [companiesId]);
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Quotations</h1>
        </header>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          {loading ? (
            <div className="text-center py-6">Loading quotations...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "70vh" }}>
              <table className="w-full border-collapse  h-28 text-center">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b">
                    <th className="p-4">company</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Quotation No</th>
                    <th className="p-4">Date / Updated Time</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length > 0 ? (
                    quotations.map((quotation) => (
                      <tr key={quotation.id} className="border-b text-center">
                        <td className="py-3">
                          {quotation.createdBy?.name} <br />
                          <span className="text-gray-500">
                            {quotation.customerDetails.phone}
                          </span>
                        </td>
                        <td className="py-3">{`₹ ${quotation.total.toFixed(
                          2
                        )}`}</td>
                        <td className="py-3">{quotation.paymentStatus}</td>
                        <td className="py-3">{quotation.mode || "Online"}</td>
                        <td className="py-3">{quotation.quotationNo}</td>

                        <td className="py-3">
                          {(() => {
                            if (
                              quotation.date.seconds &&
                              typeof quotation.date.seconds === "number"
                            ) {
                              const date = new Date(
                                quotation.date.seconds * 1000
                              );
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
                        No quotations found
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
}

export default Quotations;
