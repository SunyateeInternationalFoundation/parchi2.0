import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import { db } from "../../../firebase";

const DesignationView = () => {
  const location = useLocation();
  const userDetails = useSelector((state) => state.users);
  const companyId =
    userDetails.companies[userDetails.selectedCompanyIndex].companyId;

  const { id } = useParams();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const filteredStaff = staffData.filter(
        (staff) => staff.designation === id
      );
      setStaffData(filteredStaff);
    } catch (error) {
      console.log("fetch selected staff", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStaffData();
  }, [companyId, id]);

  return (
    <div className="px-5 pb-5 bg-gray-100" style={{ width: "100%" }}>
      <header className="flex items-center space-x-3 my-2">
        <Link className="flex items-center " to={"./../../?tab=Designations"}>
          <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500  text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold">Designation's Staff</h1>
      </header>

      <div className="mt-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="list-none space-y-3">
            {staffData.map((staff) => (
              <li key={staff.id} className="bg-white p-4 rounded shadow">
                {staff.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DesignationView;
