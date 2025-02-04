import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../../../firebase";


function Payout() {
  const [loading, setLoading] = useState(!true);
  const [staffData, setStaffData] = useState([]);
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId
  const [memoData, setMemoData] = useState({})
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
      const staffAttendance = staffAttendanceData.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });
      console.log("🚀 ~ staffAttendance ~ staffAttendance:", staffAttendance)
    } catch (error) {
      console.log("🚀 ~ fetchStaffData ~ error:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchStaffData();
    fetchStaffAttendance();
  }, [companyId]);



  return (
    <div className="flex bg-white overflow-hidden" style={{ height: "82vh" }}>
      <div className="border-r w-3/4 ">
        <div className="text-2xl font-bold px-5 " style={{ height: "4vh" }}>Staff</div>
        {loading ? (
          <div className="text-center py-6">Loading Expenses...</div>
        ) : (
          <div className="overflow-y-auto border-t" style={{ height: "78vh" }}>
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
                </tr>
              </thead>
              <tbody>
                {staffData.length > 0 ? (
                  staffData.map((staff) => (
                    <tr
                      key={staff.id}
                      className="border-b border-gray-200 text-center cursor-pointer"
                      onClick={() => { }
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
      <div className="w-full flex justify-center overflow-y-auto" style={{ height: "82vh" }}>
        <div className="w-full px-20">
          <div className="w-full py-5 flex justify-center ">
            <input
              type="month"
              className=" input-tag w-96"
              onChange={(e) => { }
              }
            />
          </div>
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-2">Recent Transactions (+)</h2>
            <div className=" mb-4">
              <div className="flex justify-between py-3 border-b">
                <span>Payout</span>
                <span>0</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span>Allowance</span>
                <span>0</span>
              </div>
              <div className="flex justify-between py-3">
                <span>Overtime Payment</span>
                <span>0</span>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Deductions (-)</h2>
            <div className="">
              <div className="flex justify-between py-2 border-b">
                <span>Deductions</span>
                <span>0</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span>Late fine</span>
                <span>0</span>
              </div>
              <div className="flex justify-between py-3 font-semibold text-2xl">
                <span>Total</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payout;
