import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrintOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { db, storage } from "../../../firebase";

function Payout() {
  const [loading, setLoading] = useState(!true);
  const [staffData, setStaffData] = useState([]);
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;
  const memoData = useRef({});
  const selectDate = useRef(
    `${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}-${new Date().getFullYear()}`
  );
  const [selectedData, setSelectedData] = useState(null);

  const printRef = useRef();
  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
  });

  async function fetchStaffData() {
    try {
      setLoading(true);
      const companyRef = doc(db, "companies", companyId);
      const q = query(
        collection(db, "staff"),
        where("companyRef", "==", companyRef)
      );
      const getData = await getDocs(q);
      let customData = {}
      const staffData = getData.docs.map((doc) => {
        const data = doc.data()
        const id = doc.id;
        customData[id] = {
          name: data.name,
          idNo: data.idNo,
          phone: data.phone,
          paymentDetails: +data.paymentDetails,
          isDailyWages: data.isDailyWages,
        }
        return {
          id,
          ...data
        }
      });
      memoData.current = customData;
      setStaffData(staffData);
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  function DateFormate(timestamp) {
    if (!timestamp) {
      return;
    }
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const getMonth = String(date.getMonth() + 1).padStart(2, "0");
    const getFullYear = date.getFullYear();

    return `${getMonth}-${getFullYear}`;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  async function fetchStaffAttendance() {
    setLoading(true);
    try {
      const staffAttendanceRef = collection(
        db,
        "companies",
        companyId,
        "staffAttendance"
      );
      const staffAttendanceData = await getDocs(staffAttendanceRef);
      let customData = memoData.current;

      staffAttendanceData.docs.forEach((doc) => {
        const { date, staffs } = doc.data();
        const key = DateFormate(date);
        const [month, year] = key.split("-").map(Number);

        staffs.forEach((staff) => {
          if (!customData[staff.id][key]) {
            const salaryPerDay = customData[staff.id].isDailyWages
              ? +customData[staff.id].paymentDetails
              : +customData[staff.id].paymentDetails / getDaysInMonth(year, month - 1);

            customData[staff.id][key] = {
              salaryPerDay,
              payout: 0,
              allowance: 0,
              overTime: 0,
              deduction: 0,
              lateFine: 0,
              total: 0,
              extraShiftAmount: 0,
              halfShiftAmount: 0,
              noLeaves: 0,
              noPresent: 0,
              noAbsent: 0,
              noHolidays: 0,
              workingDates: getDaysInMonth(year, month - 1),
            };
          }

          const staffData = customData[staff.id][key];

          if (staff.status === "absent") {
            staffData.noAbsent += 1;
            return;
          }

          const adjustments = staff.adjustments || {};
          const getAmount = (type) => +(adjustments[type]?.amount * adjustments[type]?.hours || 0);

          const daySalary = staffData.salaryPerDay * staff.shift;
          const extraShiftAmount = staff.shift !== 0.5 ? daySalary - staffData.salaryPerDay : 0;
          const halfShiftAmount = staff.shift === 0.5 ? staffData.salaryPerDay / 2 : 0;
          const total = daySalary + getAmount("allowance") + getAmount("overTime") - getAmount("deduction") - getAmount("lateFine");

          Object.assign(staffData, {
            payout: staffData.payout + staffData.salaryPerDay,
            allowance: staffData.allowance + getAmount("allowance"),
            overTime: staffData.overTime + getAmount("overTime"),
            deduction: staffData.deduction + getAmount("deduction"),
            lateFine: staffData.lateFine + getAmount("lateFine"),
            total: staffData.total + total,
            extraShiftAmount: staffData.extraShiftAmount + extraShiftAmount,
            halfShiftAmount: staffData.halfShiftAmount + halfShiftAmount,
            noLeaves: staffData.noLeaves + (staff.status === "leave" ? 1 : 0),
            noPresent: staffData.noPresent + (staff.status === "present" ? 1 : 0),
          });
        });
      });

      memoData.current = customData;
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  function onSelectStaff(id, date = selectDate.current) {
    setSelectedData({
      id,
      ...memoData.current[id][date],
      name: memoData.current[id].name,
      idNo: memoData.current[id].idNo,
      phone: memoData.current[id].phone,
    });
    console.log("🚀 ~ onSelectStaff ~ memoData.current:", memoData.current[id][date])
    selectDate.current = date;
  }

  const handleWhatsAppShare = async () => {
    try {
      // const doc = new jsPDF("p", "pt", "a4");

      // doc.html(printRef.current, {
      //   callback: function (doc) {
      //     doc.save(`${selectedData?.name}'s payout.pdf`);
      //   },
      //   x: 0,
      //   y: 0,
      //   width: 600,
      //   windowWidth: printRef.current.scrollWidth,
      // });

      const doc = new jsPDF("p", "pt", "a4");
      doc.html(printRef.current, {
        callback: async function (doc) {
          const pdfBlob = doc.output("blob");
          const fileName = `payout/${selectedData?.name}.pdf`;
          const fileRef = ref(storage, fileName);

          await uploadBytes(fileRef, pdfBlob);
          const downloadURL = await getDownloadURL(fileRef);
          const mobileNumber = selectedData?.phone;

          const url =
            import.meta.env.VITE_FIREBASE_WHATSAPP_URL + "91" + mobileNumber;
          const token = import.meta.env.VITE_FIREBASE_WHATSAPP_TOKEN;
          try {
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json-patch+json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                template_name: "invoice_pdf",
                broadcast_name: "invoice_pdf",
                parameters: [
                  {
                    name: "pdflink",
                    value: downloadURL,
                  },
                  {
                    name: "name",
                    value: "payout",
                  },
                ],
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            alert("payout As Send to " + selectedData?.name + ".");
          } catch (err) {
            console.log("🚀 ~ err:", err);
          }
        },
        x: 0,
        y: 0,
        width: 600,
        windowWidth: printRef.current.scrollWidth,
      });
    } catch (error) {
      console.error("Error uploading or sharing the PDF:", error);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    if (staffData.length > 0) {
      fetchStaffAttendance();
    }
  }, [staffData]);

  return (
    <div className="flex  overflow-hidden" style={{ height: "82vh" }}>
      <div className="border-r w-3/4 bg-white pt-5">
        {loading ? (
          <div className="text-center py-6">Loading Expenses...</div>
        ) : (
          <div className="overflow-y-auto border-t" style={{ height: "80vh" }}>
            <table className="w-full border-collapse text-start">
              <thead className=" bg-white">
                <tr className="border-b">
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Id
                  </td>
                  <td className="px-8 py-1 text-gray-400 font-semibold text-start ">
                    Name
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Mobile
                  </td>
                  <td className="px-5 py-1 text-gray-400 font-semibold text-center">
                    Salary
                  </td>
                </tr>
              </thead>
              <tbody>
                {staffData.length > 0 ? (
                  staffData.map((staff) => (
                    <tr
                      key={staff.id}
                      className={
                        "border-b border-gray-200 text-center cursor-pointer " +
                        (selectedData?.idNo == staff?.idNo && " bg-blue-100")
                      }
                      onClick={() => {
                        onSelectStaff(staff.id);
                      }}
                    >
                      <td className="px-8 py-4 text-start w-24">
                        {staff.idNo}
                      </td>
                      <td className="px-8 py-4 text-start w-24">
                        {staff.name}
                      </td>
                      <td className="px-5 py-4 ">{staff.phone}</td>
                      <td className="px-5 py-4 ">
                        {staff.paymentDetails}
                        {staff.isDailyWages ? "/perDay" : "/perMonth"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="h-10 text-center py-4 hover:bg-white"
                    >
                      <div> No Staff Found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div
        className="w-full flex justify-center overflow-y-auto px-10 py-5"
        style={{ height: "82vh" }}
      >
        {selectedData && (
          <div className="container2" style={{ minHeight: "82vh" }}>
            <div className="flex space-x-4 border-b px-5 pb-3">
              <button
                className="px-4 py-1 text-gray-600  rounded-md flex items-center  border hover:bg-black hover:text-white"
                onClick={handleWhatsAppShare}
              >
                <FaWhatsapp /> &nbsp; Share on WhatsApp
              </button>
              <button
                className="px-4 py-1 text-gray-600 rounded-md flex items-center  border hover:bg-black hover:text-white"
                onClick={() => reactToPrintFn()}
              >
                <IoPrintOutline /> &nbsp; Print
              </button>
            </div>
            <div className="w-full p-5" ref={printRef}>
              <div className="flex items-center w-full">
                <div className="w-full">
                  <div className="text-2xl font-bold">{selectedData?.name}</div>
                  <div className="text-gray-500 text-sm">
                    IdNo: {selectedData?.idNo}
                  </div>
                </div>

                <div className="w-full py-3 flex justify-center ">
                  <input
                    type="month"
                    className=" input-tag w-96"
                    defaultValue={`${new Date().getFullYear()}-${String(
                      new Date().getMonth() + 1
                    ).padStart(2, "0")}`}
                    onChange={(e) => {
                      const date = e.target.value.split("-");
                      onSelectStaff(selectedData.id, `${date[1]}-${date[0]}`);
                    }}
                  />
                </div>
              </div>
              <div className="w-full">

                <div className="flex justify-between">

                  <div className=" mb-2">
                    Total Working Days
                  </div>
                  <div className=" mb-2">
                    {selectedData.noPresent}/{selectedData.workingDates}
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-2">
                  Recent Transactions (+)
                </h2>
                <div className=" mb-4">
                  <div className="flex justify-between py-3 border-b">
                    <span>Payout</span>
                    <span>{selectedData.payout?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span>Allowance</span>
                    <span>{selectedData.allowance?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span>Overtime Payment</span>
                    <span>{selectedData.overTime?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span>Extra Shift Amount</span>
                    <span>{selectedData.extraShiftAmount?.toFixed(2)}</span>
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-2">Deduction (-)</h2>
                <div className="">
                  <div className="flex justify-between py-2 border-b">
                    <span>Deduction</span>
                    <span>{selectedData.deduction?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span>Late Fine</span>
                    <span>{selectedData.lateFine?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span>Half Shift Amount</span>
                    <span>{selectedData.halfShiftAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 font-semibold text-2xl">
                    <span>Total</span>
                    <span>{selectedData.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payout;
