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

function Invoice() {
  const userDetails = useSelector((state) => state.users);
  const [loading, setLoading] = useState(false);
  const [companiesId, setCompaniesId] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    async function fetchCustomerCompanies() {
      setLoading(true);
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
    setLoading(true);
    async function fetchInvoices() {
      try {
        const invoiceList = [];
        for (const company of companiesId) {
          console.log(company.companyId);

          const invoiceRef = collection(
            db,
            "companies",
            company.companyId,
            "invoices"
          );
          const q = query(
            invoiceRef,
            where("customerDetails.phone", "==", "1234567890")
          );
          const getData = await getDocs(q);
          const getAllInvoices = getData.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });
          invoiceList.push(...getAllInvoices);
        }
        console.log("🚀 ~ fetchInvoices ~ invoiceList:", invoiceList);

        setInvoices(invoiceList);
      } catch (error) {
        console.log("🚀 ~ fetchInvoices ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [companiesId]);
  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <header className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Invoices</h1>
        </header>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          {loading ? (
            <div className="text-center py-6">Loading invoices...</div>
          ) : (
            <div className="overflow-y-auto" style={{ height: "70vh" }}>
              <table className="w-full border-collapse  h-28 text-center">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b">
                    <th className="p-4">company</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">Date / Updated Time</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b text-center">
                        <td className="py-3">
                          {invoice.createdBy?.name} <br />
                          <span className="text-gray-500">
                            {invoice.customerDetails.phone}
                          </span>
                        </td>
                        <td className="py-3">{`₹ ${invoice.total.toFixed(
                          2
                        )}`}</td>
                        <td className="py-3">{invoice.paymentStatus}</td>
                        <td className="py-3">{invoice.mode || "Online"}</td>
                        <td className="py-3">{invoice.invoiceNo}</td>

                        <td className="py-3">
                          {(() => {
                            if (
                              invoice?.date.seconds &&
                              typeof invoice?.date?.seconds === "number"
                            ) {
                              const date = new Date(
                                invoice?.date?.seconds * 1000
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
                        No invoices found
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

export default Invoice;
