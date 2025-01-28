import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { setAsAStaffCompanies } from "../../store/UserSlice";

const StaffCompaniesModel = ({
  onClose,
  phone,
  onSwitchCompanyStaffDashboard,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [staffDetails, setStaffDetails] = useState(null);
  useEffect(() => {
    if (phone) {
      fetchCompanyDetails();
    }
  }, [location, phone]);

  const fetchCompanyDetails = async () => {
    try {
      const staffQuery = query(
        collection(db, "staff"),
        where("phone", "==", phone)
      );
      const staffSnapshot = await getDocs(staffQuery);

      if (!staffSnapshot.empty) {
        const staffDoc = await Promise.all(
          staffSnapshot.docs.map(async (doc) => {
            const { companyRef, ...data } = doc.data();
            const companyDoc = await getDoc(companyRef);
            const { userRef, ...companyData } = companyDoc.data();
            return {
              id: doc.id,
              ...data,
              companyDetails: {
                companyId: companyDoc.id,
                ...companyData,
              },
            };
          })
        );
        setStaffDetails(staffDoc);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Company Details{" "}
        </h2>
        {staffDetails && staffDetails.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {staffDetails.map((staff, index) => (
              <div
                key={staff.companyDetails.companyId}
                className="p-2 cursor-pointer hover:bg-gray-100 border-2 rounded-lg h-46"
                onClick={() => {
                  navigate("invoice");
                  onSwitchCompanyStaffDashboard();
                  dispatch(
                    setAsAStaffCompanies({
                      asAStaffCompanies: staffDetails,
                      selectedStaffCompanyIndex: index,
                    })
                  );
                  onClose();
                }}
              >
                <div className="font-bold text-5xl text-center py-6 flex items-center justify-center shadow  rounded-full bg-sky-100">
                  {staff.companyDetails.name?.slice(0, 2).toUpperCase() || "YC"}
                </div>
                <p className="h-fit text-center text-xs font-bold pt-2">
                  {staff.companyDetails.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No company details found for this staff member.
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

StaffCompaniesModel.propTypes = {
  phone: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSwitchCompanyStaffDashboard: PropTypes.func.isRequired,
};
export default StaffCompaniesModel;
