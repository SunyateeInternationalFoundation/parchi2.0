import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Customers from "../../assets/dashboard/Customers.png";
import Vendors from "../../assets/dashboard/Vendors.png";
import { db } from "../../firebase";
import { setAsAStaffCompanies, setUserLogin } from "../../store/UserSlice";

function SelectDashboard({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("business");
    const userDetails = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [staffDetails, setStaffDetails] = useState([]);

    let companiesList = userDetails?.companies;

    function onSwitchCompany(index, selectedDashboard) {
        const payload = { ...userDetails, selectedCompanyIndex: index, selectedDashboard, };
        dispatch(setUserLogin(payload));
        navigate("/" + selectedDashboard);
    }

    function onSwitchCompanyStaffDashboard() {
        dispatch(
            setUserLogin({
                ...userDetails,
                selectedDashboard: "staff",
            })
        );
    }
    const fetchStaffAsCompanyDetails = async () => {
        if (staffDetails?.length > 0) {
            return
        }
        try {
            const staffQuery = query(
                collection(db, "staff"),
                where("phone", "==", userDetails.phone)
            );
            const staffSnapshot = await getDocs(staffQuery);

            if (!staffSnapshot.empty) {
                const staffDoc = await Promise.all(
                    staffSnapshot.docs.map(async (doc) => {
                        const { companyRef, dateOfJoining, ...data } = doc.data();
                        const companyDoc = await getDoc(companyRef);
                        const { userRef, ...companyData } = companyDoc.data();
                        return {
                            id: doc.id,
                            ...data,
                            dateOfJoining: JSON.stringify(dateOfJoining),
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

    useEffect(() => {
        if (userDetails.phone && activeTab == "staff") {
            fetchStaffAsCompanyDetails();
        }
    }, [activeTab]);

    function DateFormate(timestamp) {
        if (!timestamp) {
            return;
        }
        if (!timestamp?.nanoseconds) {
            timestamp = JSON.parse(timestamp);
        }
        const milliseconds =
            timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
        const date = new Date(milliseconds);
        const getDate = String(date.getDate()).padStart(2, "0");
        const getMonth = String(date.getMonth() + 1).padStart(2, "0");
        const getFullYear = date.getFullYear();

        return `${getDate}/${getMonth}/${getFullYear}`;
    }
    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-25 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            onClick={onClose}
        >
            <div
                className={`bg-white w-1/2 p-3 pt-2 transform transition-transform overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{ maxHeight: "100vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between border-b">
                    <h2 className="font-bold text-xl mb-4"> Select Company</h2>
                    <button className="text-2xl mb-4" onClick={onClose}>
                        <IoMdClose size={24} />
                    </button>
                </div>

                <div className=" flex justify-between bg-white rounded-t-lg px-5 py-4">
                    <button
                        className={
                            "btn-outline-black " + (activeTab == "business" && " bg-black text-white")
                        }
                        onClick={() => {
                            setActiveTab("business")
                        }}
                    >
                        Business Dashboard
                    </button>
                    <button
                        className={
                            "btn-outline-black " + (activeTab == "staff" && " bg-black text-white")
                        }
                        onClick={() => {
                            setActiveTab("staff")
                        }}
                    >
                        Staff Dashboard
                    </button>
                    <button
                        className={
                            "btn-outline-black " + (activeTab == "vendor_customer " && " bg-black text-white")
                        }
                        onClick={() => {
                            setActiveTab("vendor_customer")
                        }}
                    >
                        Vendor/Customer Dashboard
                    </button>
                </div>
                {activeTab == "business" &&
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Logo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companiesList?.length > 0 &&
                                companiesList.map((company, index) => (
                                    <tr
                                        key={company.companyId}
                                        className="cursor-pointer hover:bg-blue-100"
                                        onClick={() => {
                                            onSwitchCompany(index, "");
                                            onClose();
                                        }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {company.companyLogo ? (
                                                <img
                                                    src={company.companyLogo}
                                                    className="rounded-md mix-blend-multiply object-contain w-12 h-12"
                                                />
                                            ) : (
                                                <div className="bg-orange-400 text-white  font-bold w-12 h-12 flex items-center justify-center rounded-full border border-gray-500">
                                                    {company.name?.slice(0, 2).toUpperCase() || "YB"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-800">
                                            <div>
                                                {company.name}
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                {DateFormate(company?.createdAt)}</div>

                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                }
                {activeTab == "staff" &&
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Logo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staffDetails?.length > 0 &&
                                staffDetails.map((staff, index) => (
                                    <tr
                                        key={staff.companyDetails.companyId}
                                        className="cursor-pointer hover:bg-blue-100"
                                        onClick={() => {
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {staff.companyDetails.companyLogo ? (
                                                <img
                                                    src={staff.companyDetails.companyLogo}
                                                    className="rounded-md mix-blend-multiply object-contain w-12 h-12"
                                                />
                                            ) : (
                                                <div className="bg-orange-400 text-white font-bold w-12 h-12 flex items-center justify-center rounded-full border border-gray-500">
                                                    {staff.companyDetails.name?.slice(0, 2).toUpperCase() || "YB"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-800">
                                            <div className="">
                                                {staff.companyDetails.name}
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                {DateFormate(staff?.companyDetails?.createdAt)}</div>

                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                }
                {activeTab == "vendor_customer" &&
                    <div className="flex space-x-9 p-5 text-lg">
                        <div className=" border h-60 w-full rounded-md hover:shadow hover:bg-blue-100 flex justify-center items-center" onClick={() => {
                            onSwitchCompany(0, "customer");
                            onClose()
                        }}>
                            <div className="">
                                <div className="">
                                    <img src={Customers} width={100} height={100} />
                                </div>
                                <div className="">
                                    As a Customer
                                </div>
                            </div>
                        </div>
                        <div className=" border h-60 w-full rounded-md hover:shadow hover:bg-blue-100 flex justify-center items-center" onClick={() => {
                            onSwitchCompany(0, "vendor");
                            onClose()
                        }}>
                            <div className="">
                                <div className="">
                                    <img src={Vendors} width={100} height={100} />
                                </div>
                                <div className="">As a Vender</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default SelectDashboard;
