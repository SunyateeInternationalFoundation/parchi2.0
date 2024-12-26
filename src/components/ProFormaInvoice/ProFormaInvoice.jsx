import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

const ProFormaProForma = ({ companyDetails, isStaff }) => {
  const [proForma, setProForma] = useState([]);
  const [isProFormaOpen, setIsProFormaOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProFormaData, setSelectedProFormaData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const userDetails = useSelector((state) => state.users);

  let companyId;
  if (!companyDetails) {
    companyId =
      userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  } else {
    companyId = companyDetails.id;
  }
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProForma = async () => {
      setLoading(true);
      try {
        const proFormaRef = collection(
          db,
          "companies",
          companyId,
          "proFormaInvoice"
        );
        const querySnapshot = await getDocs(proFormaRef);
        const proFormaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // const q = query(proFormaRef, orderBy("date", "desc"));
        // const querySnapshot = await getDocs(q);
        // const proFormaData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        setSelectedProFormaData(proFormaData[0]);
        setProForma(proFormaData);
      } catch (error) {
        console.error("Error fetching proForma:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProForma();
  }, [companyId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const invoiceDoc = doc(
        db,
        "companies",
        companyId,
        "proFormaInvoice",
        invoiceId
      );
      await updateDoc(invoiceDoc, { paymentStatus: newStatus });
      setProForma((prevProForma) =>
        prevProForma.map((invoice) =>
          invoice.id === invoiceId
            ? { ...invoice, paymentStatus: newStatus }
            : invoice
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredProForma = proForma.filter((proForma) => {
    const { customerDetails, proFormaNo, paymentStatus } = proForma;
    const customerName = customerDetails?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proFormaNo?.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredProForma.reduce(
    (sum, proForma) => sum + proForma.total,
    0
  );
  const paidAmount = filteredProForma
    .filter((proForma) => proForma.paymentStatus === "Paid")
    .reduce((sum, proForma) => sum + proForma.total, 0);
  const pendingAmount = filteredProForma
    .filter((proForma) => proForma.paymentStatus === "Pending")
    .reduce((sum, proForma) => sum + proForma.total, 0);

  return (
    <div className="w-full">
      <div
        className="px-8 pb-8 pt-2 bg-gray-100 overflow-y-auto"
        style={{ height: "92vh" }}
      >
        <div className="bg-white rounded-lg shadow mt-4 h-48">
          <h1 className="text-2xl font-bold py-3 px-10 ">ProForma Overview</h1>
          <div className="grid grid-cols-4 gap-12  px-10 ">
            <div className="rounded-lg p-5 bg-[hsl(240,100%,98%)] ">
              <div className="text-lg">Total Amount</div>
              <div className="text-3xl text-[hsl(240,92.20%,70.00%)] font-bold">
                ₹ {totalAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-green-50 ">
              <div className="text-lg"> Paid Amount</div>
              <div className="text-3xl text-emerald-600 font-bold">
                {" "}
                ₹ {paidAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-orange-50 ">
              <div className="text-lg">Pending Amount</div>
              <div className="text-3xl text-orange-600 font-bold">
                ₹ {pendingAmount}
              </div>
            </div>
            <div className="rounded-lg p-5 bg-red-50 ">
              <div className="text-lg">UnPaid Amount</div>
              <div className="text-3xl text-red-600 font-bold">
                ₹ {totalAmount - paidAmount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  py-8 rounded-lg shadow my-6">
          <nav className="flex mb-4 px-5">
            <div className="space-x-4 w-full flex items-center">
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Search by proForma #..."
                  className=" w-full focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <IoSearch />
              </div>
              <div className="flex items-center space-x-4 mb-4 border p-2 rounded-lg ">
                <select onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All"> All Transactions</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="UnPaid">UnPaid</option>
                </select>
              </div>
            </div>
            <div className="w-full text-end ">
              <Link
                className="bg-blue-500 text-white py-2 px-2 rounded-lg"
                to="create-proForma"
              >
                + Create ProForma
              </Link>
            </div>
          </nav>

          {loading ? (
            <div className="text-center py-6">Loading proForma...</div>
          ) : (
            <div className="" style={{ height: "80vh" }}>
              <div className="" style={{ height: "74vh" }}>
                <table className="w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b">
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        ProForma No
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start">
                        Customer
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Date
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-center ">
                        Amount
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-center ">
                        Status
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Mode
                      </td>
                      <td className="px-5 py-1 text-gray-600 font-semibold text-start ">
                        Created By
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProForma.length > 0 ? (
                      filteredProForma.map((proForma) => (
                        <tr
                          key={proForma.id}
                          className="border-b text-center cursor-pointer text-start"
                          onClick={(e) => {
                            navigate(proForma.id);
                          }}
                        >
                          <td className="px-5 py-3 font-bold">
                            {proForma.proFormaNo}
                          </td>

                          <td className="px-5 py-3 text-start">
                            {proForma.customerDetails?.name} <br />
                            <span className="text-gray-500 text-sm">
                              Ph.No {proForma.customerDetails.phone}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            {new Date(
                              proForma.date.seconds * 1000 +
                                proForma.date.nanoseconds / 1000000
                            ).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold text-center">{`₹ ${proForma.total.toFixed(
                            2
                          )}`}</td>
                          <td
                            className="px-5 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            <div
                              className={`px-1 text-center py-2 rounded-lg text-xs font-bold ${
                                proForma.paymentStatus === "Paid"
                                  ? "bg-green-100 "
                                  : proForma.paymentStatus === "Pending"
                                  ? "bg-yellow-100 "
                                  : "bg-red-100 "
                              }`}
                            >
                              <select
                                value={proForma.paymentStatus}
                                onChange={(e) => {
                                  handleStatusChange(
                                    proForma.id,
                                    e.target.value
                                  );
                                }}
                                className={` ${
                                  proForma.paymentStatus === "Paid"
                                    ? "bg-green-100 "
                                    : proForma.paymentStatus === "Pending"
                                    ? "bg-yellow-100 "
                                    : "bg-red-100 "
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="UnPaid">UnPaid</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {proForma.mode || "Online"}
                          </td>

                          <td className="px-5 py-3">
                            {proForma?.createdBy?.name == userDetails.name
                              ? "Owner"
                              : userDetails.name}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="h-24 text-center py-4">
                          No proForma found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center flex-wrap gap-2 justify-between  p-5">
                <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
                  0 of 10 row(s) selected.
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronsLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronLeft className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronRight className="text-sm" />
                      </div>
                    </button>
                    <button className="h-8 w-8 border rounded-lg border-[rgb(132,108,249)] text-[rgb(132,108,249)] hover:text-white hover:bg-[rgb(132,108,249)]">
                      <div className="flex justify-center">
                        <LuChevronsRight className="" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProFormaProForma;
