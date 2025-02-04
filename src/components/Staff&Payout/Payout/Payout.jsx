import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";


function Payout() {
  const [loading, setLoading] = useState(!true);
  const [staffData, setStaffData] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const memoData = useRef({

  })

  const [selectedData, setSelectedData] = useState(null)

  async function fetchStaffData() {
    try {
      setLoading(true);
      const companyRef = doc(db, "companies", companyId);
      const q = query(
        collection(db, "staff"),
        where("companyRef", "==", companyRef)
      );
      const getData = await getDocs(q);
      const staffData = getData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
    // Month is 0-indexed in JavaScript (0 = January, 11 = December)
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
      let customData = {}
      staffAttendanceData.docs.forEach((doc) => {
        const { date, staffs, ...data } = doc.data();
        for (let staff of staffs) {
          const key = DateFormate(date);

          if (!customData[staff.id]) {
            const staffDetails = staffData.find(ele => ele.id == staff.id)
            const monthYear = key.split("-")
            let salaryPerDay = +staffDetails.paymentDetails;
            if (!staffDetails.isDailyWages) {
              salaryPerDay = +staffDetails.paymentDetails / getDaysInMonth(monthYear[1], monthYear[0] - 1);
            }
            customData[staff.id] = {
              name: staffDetails.name,
              idNo: staffDetails.idNo,
              paymentDetails: +staffDetails.paymentDetails,
              isDailyWages: staffDetails.isDailyWages,
              salaryPerDay,
              [key]: {
                payout: 0,
                allowance: 0,
                overTime: 0,
                deduction: 0,
                lateFine: 0,
                total: 0
              }
            }
          }

          if (staff.status == "absent") {
            return
          }

          const obj = {
            payout: customData[staff.id][key]?.payout + customData[staff.id].salaryPerDay,
            allowance: +((staff?.adjustments?.allowance?.amount * staff?.adjustments?.allowance?.hours) || 0),
            overTime: +((staff?.adjustments?.overTime?.amount * staff?.adjustments?.overTime?.hours) || 0),
            deduction: +((staff?.adjustments?.deduction?.amount * staff?.adjustments?.deduction?.hours) || 0),
            lateFine: +((staff?.adjustments?.lateFine?.amount * staff?.adjustments?.lateFine?.hours) || 0),
          }
          console.log("🚀 ~ staffAttendanceData.docs.forEach ~ obj:", obj)

          const daySalary = obj.payout * staff.shift;

          const extraShiftAmount = (staff.shift !== 0.5 ? daySalary - obj.payout : 0)
          const halfShiftAmount = (staff.shift == 0.5 ? obj.payout / 2 : 0)

          const total = (daySalary + obj.allowance + obj.overTime - obj.deduction - obj.lateFine || 0)

          customData[staff.id][key] = {
            payout: obj.payout,
            allowance: customData[staff.id][key]?.allowance + obj.allowance,
            overTime: customData[staff.id][key]?.overTime + obj.overTime,
            deduction: customData[staff.id][key]?.deduction + obj.deduction,
            lateFine: customData[staff.id][key]?.lateFine + obj.lateFine,
            total: +customData[staff.id][key]?.total + +total,
            extraShiftAmount: +customData[staff.id][key]?.total + +extraShiftAmount,
            halfShiftAmount: +customData[staff.id][key]?.total + +halfShiftAmount
          }
        }

        return {
          id: doc.id,
          ...data,
        };
      });
      memoData.current = customData;
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  function onSelectStaff(id, date = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${new Date().getFullYear()}`) {
    console.log("🚀 ~ onSelectStaff ~ memoData.current[id][date]:", memoData.current[id]["02-2025"])
    setSelectedData({ ...memoData.current[id][date], name: memoData.current[id].name, idNo: memoData.current[id].idNo })

  }

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    if (staffData.length > 0) {
      fetchStaffAttendance();
    }
  }, [staffData])



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
                      className={"border-b border-gray-200 text-center cursor-pointer " + (selectedData?.idNo == staff?.idNo && " bg-blue-100")}
                      onClick={() => {
                        onSelectStaff(staff.id)
                      }
                      }
                    >
                      <td className="px-8 py-4 text-start w-24">
                        {staff.idNo}
                      </td>
                      <td className="px-8 py-4 text-start w-24">
                        {staff.name}
                      </td>
                      <td className="px-5 py-4 ">
                        {staff.phone}
                      </td>
                      <td className="px-5 py-4 ">
                        {staff.paymentDetails}{staff.isDailyWages ? "/perDay" : "/perMonth"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="h-10 text-center py-4 hover:bg-white">
                      <div> No Staff Found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="w-full flex justify-center overflow-y-auto  px-10 py-5" style={{ height: "82vh" }}>
        {selectedData && <div className="w-full bg-white p-5  rounded-lg " >
          <div className="flex items-center w-full">
            <div className="w-full">
              <div className="text-2xl font-bold">{selectedData?.name}
              </div>
              <div className="text-gray-500 text-sm">IdNo: {selectedData?.idNo}</div>
            </div>

            <div className="w-full py-3 flex justify-center ">
              <input
                type="month"
                className=" input-tag w-96"
                onChange={(e) => {
                  const date = e.target.value.split("-");
                  onSelectStaff(selectedData.idNo, `${date[1]}-${date[0]}`);
                }}
                value={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
              />
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-2">Recent Transactions (+)</h2>
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
        </div>}
      </div>
    </div>
  );
}

export default Payout;
