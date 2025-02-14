import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import circleUser from "../../assets/dashboard/circleUser.png";
import creditNoteLogo from "../../assets/dashboard/Credit.png";
import customerLogo from "../../assets/dashboard/customers.png";
import debitNoteLogo from "../../assets/dashboard/Debit.png";
import deliveryLogo from "../../assets/dashboard/Delivery.png";
import estimateLogo from "../../assets/dashboard/Estimate.png";
import expenseLogo from "../../assets/dashboard/Expense.png";
import inventoryLogo from "../../assets/dashboard/Inventory.png";
import invoiceLogo from "../../assets/dashboard/invoice.png";
import notification from "../../assets/dashboard/notification.png";
import plansLogo from "../../assets/dashboard/Plans.png";
import purchaseOrderLogo from "../../assets/dashboard/Po.png";
import pos from "../../assets/dashboard/Point.png";
import profLogo from "../../assets/dashboard/ProForma.png";
import projectLogo from "../../assets/dashboard/projects.png";
import purchase from "../../assets/dashboard/Purchase.png";
import staffLogo from "../../assets/dashboard/Staff.png";
import subscription from "../../assets/dashboard/Subscriptions.png";
import vendorLogo from "../../assets/dashboard/Vendors.png";
import SunyaLogo from "../../assets/SunyaLogo.jpg";
import { db } from "../../firebase";
import { setUserLogout } from "../../store/UserSlice";
import Notifications from "./notifications";
import SelectDashboard from "./SelectDashboard";

const Navbar = () => {
  const allSuggestions = [
    { display: "Invoice", route: "/invoice", logo: invoiceLogo },
    { display: "Create Invoice", route: "/invoice/create-invoice", logo: invoiceLogo },
    { display: "Projects", route: "/projects", logo: projectLogo },
    { display: "Estimates", route: "/quotation", logo: estimateLogo },
    { display: "Create Estimate", route: "/quotation/create-quotation", logo: estimateLogo },
    { display: "Purchase Order", route: "/po", logo: purchaseOrderLogo },
    { display: "Create Purchase Order", route: "/po/create-po", logo: purchaseOrderLogo },
    { display: "Debit Note", route: "/debit-note", logo: debitNoteLogo },
    { display: "Create Debit Note", route: "/debit-note/create-debit-note", logo: debitNoteLogo },
    { display: "Credit Note", route: "/credit-note", logo: creditNoteLogo },
    { display: "Create Credit Note", route: "/credit-note/create-credit-note", logo: creditNoteLogo },
    { display: "Customers", route: "/customers", logo: customerLogo },
    { display: "Vendors", route: "/vendors", logo: vendorLogo },
    { display: "Staff & Payout", route: "/staff-payout?tab=Staff", logo: staffLogo },
    { display: "Expense", route: "/expense", logo: expenseLogo },
    { display: "Inventory", route: "/products?tab=Products", logo: inventoryLogo },
    { display: "Pro Forma", route: "/pro-forma-invoice", logo: profLogo },
    { display: "Create Pro Forma", route: "/pro-forma-invoice/create-pro-forma", logo: profLogo },
    { display: "Delivery Challan", route: "/delivery-challan", logo: deliveryLogo },
    { display: "Create Delivery Challan", route: "/delivery-challan/create-delivery-challan", logo: deliveryLogo },
    { display: "Subscriptions", route: "/subscriptions", logo: subscription },
    { display: "Create Subscription", route: "/subscriptions/create-subscription", logo: subscription },
    { display: "Plans", route: "/plan-list", logo: plansLogo },
    { display: "Pos", route: "/pos", logo: pos },
    { display: "Create Pos", route: "/pos/create-pos", logo: pos },
    { display: "Purchase", route: "/purchase", logo: purchase },
    { display: "Create Purchase", route: "/purchase/create-purchase", logo: purchase },
  ];
  const [isSidebarOpen, setIsSidebarOpen] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState(allSuggestions);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userDetails = useSelector((state) => state.users);
  let companiesList = userDetails?.companies;

  let companyName =
    (companiesList.length &&
      userDetails.companies[userDetails.selectedCompanyIndex]?.name)

  if (userDetails.selectedDashboard === "staff") {
    companiesList =
      userDetails.asAStaffCompanies.map((ele) => ele.companyDetails) ?? [];
    companyName =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        ?.companyDetails.name ?? "";
  }

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value == "") {
      setSuggestions(allSuggestions)
    }
    const filteredSuggestions = allSuggestions.filter((suggestion) =>
      suggestion.display.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.display)
    navigate(suggestion.route);
  };

  async function fetchNotifications() {
    try {
      if (userDetails.selectedDashboard === "" || userDetails.selectedDashboard === "staff") {
        let companyId = userDetails.companies[userDetails.selectedCompanyIndex].companyId;
        let collectionName = "companies";

        if (userDetails.selectedDashboard === "staff") {
          companyId = userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex].companyId;
          collectionName = "staff";
        }
        const ref = collection(db, collectionName, companyId, "notifications")
        const q = query(
          ref,
          orderBy("date", "desc")
        );
        onSnapshot(q, (snapshot) => {
          const getNotifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            docId: companyId,
            collectionName,
            ...doc.data(),
          }));
          setNotificationData(getNotifications)
        });

      }

      else if (userDetails.selectedDashboard === "customer" || userDetails.selectedDashboard === "vendor") {
        const customerCompanies = userDetails.userAsOtherCompanies[userDetails.selectedDashboard]
        const allNotificationsData = [];
        let collectionName = "customers";
        if (userDetails.selectedDashboard === "vendor") {
          collectionName = "vendors";
        }
        const promises = customerCompanies.map(async (item) => {
          const ref = collection(db, collectionName, item.customerId, "notifications");
          return new Promise((resolve) => {
            onSnapshot(ref, (snapshot) => {
              const getNotification = snapshot.docs.map((doc) => ({
                id: doc.id,
                docId: item.customerId,
                collectionName,
                ...doc.data(),
              }));
              const newNotifications = getNotification.filter(
                (newNotif) => !allNotificationsData.some((existingNotif) => existingNotif.id === newNotif.id)
              );
              allNotificationsData.push(...newNotifications);
              resolve();
            });
          });
        });
        await Promise.all(promises);
        const sortedNotifications = allNotificationsData.sort((a, b) => b.date - a.date);
        setNotificationData(sortedNotifications);
      }

    } catch (error) {
      console.log("🚀 ~ fetchNotification ~ error:", error)

    }
  }

  function navigationPath(notification) {
    const basePath = userDetails.selectedDashboard !== "" ? ("/" + userDetails.selectedDashboard) : "";
    switch (notification.subject) {
      case "Invoice":
        return `${basePath}/invoice/${notification.ref.id}`;
      case "Approval":
        return `${basePath}/projects/${notification.ref.parent.parent.id}?tab=Approvals`;
      default:
        return "";
    }
  }

  async function onSeenNotification(notification) {
    try {
      const path = navigationPath(notification)
      if (notification.seen) {
        navigate(path)
        return
      }
      await updateDoc(doc(db, notification.collectionName, notification.docId, "notifications", notification.id), { seen: true })
      setNotificationData(notificationData.map(item =>
        item.id === notification.id ? { ...item, seen: true } : item
      ));

      navigate(path)
    } catch (error) {
      console.log("🚀 ~ onSeenNotification ~ error:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userDetails]);

  return (
    <>
      <header className="border-b border-gray-300 flex items-center justify-between" style={{ height: "6vh" }}>
        <div className="flex items-center justify-between px-10 w-full">
          <div className="flex items-center space-x-6">
            <Link href="#" className="flex items-center m-3">
              <div>
                <img src={SunyaLogo} width={100} alt="logo" height={100} className="mix-blend-multiply" />
              </div>
            </Link>
          </div>
          {userDetails.selectedDashboard === "" && (
            <div className="flex-grow flex justify-center">
              <div className="relative flex-grow max-w-lg">
                <div className="flex items-center bg-white rounded-md border shadow-sm px-4 py-2 text-[12px]">
                  <IoSearch className="text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search for invoices, projects,...etc"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => {
                      setIsExpanded(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsExpanded(false);
                      }, 200);
                    }}
                    className="flex-grow outline-none pl-2"
                  />
                </div>
                {(isExpanded && suggestions.length > 0) && (
                  <ul className={`absolute bg-white border rounded-md shadow-lg mt-2 w-full max-h-80 overflow-y-auto z-[999]`}>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <img src={suggestion.logo} alt={suggestion.display} className="w-6 h-6 mr-2" />
                        <span className="text-gray-700">{suggestion.display}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {userDetails.selectedDashboard === "staff" && (
            <div> You Logged as a Staff in {companyName}'s Company</div>
          )}
          <div className="flex items-center">
            <div
              className="flex items-center space-x-4 group relative cursor-pointer"
              onClick={() => setIsSidebarOpen(val => val == "company" ? "" : "company")}
            >
              <div className="bg-orange-400 text-white font-bold w-8 h-8 text-[12px] flex items-center justify-center rounded-full border hover:shadow">
                {companyName?.slice(0, 2).toUpperCase() || "YB"}
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-800 text-[12px] group-hover:text-gray-500 transition-colors duration-300">
                  {companyName}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <button
              type="button"
              className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
              onClick={() => setIsSidebarOpen(val => val == "notification" ? "" : "notification")}
            >
              <img src={notification} width={20} alt="user" height={20} />
            </button>
            {userDetails.selectedDashboard !== "staff" && (
              <button
                type="button"
                className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
                onClick={() => setIsSidebarOpen(val => val == "profile" ? "" : "profile")}
              >
                <img src={circleUser} width={20} alt="user" height={20} />
              </button>
            )}
          </div>
        </div>
      </header>
      <SelectDashboard
        isOpen={isSidebarOpen == "company"}
        onClose={() => setIsSidebarOpen("")}
        companiesList={companiesList}
      />
      <Notifications
        isOpen={isSidebarOpen == "notification"}
        onClose={() => setIsSidebarOpen("")}
        dataSet={notificationData}
        onSeenNotification={onSeenNotification}
      />
      {isSidebarOpen == "profile" && (
        <div
          className="fixed pr-2 flex items-start justify-end inset-0 bg-black bg-opacity-10"
          style={{ zIndex: 999 }}
          onClick={() => setIsSidebarOpen("")}
        >
          <div
            className="w-80 bg-white shadow-2xl rounded-lg p-4 text-sm"
            style={{ marginTop: "6vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-2 space-y-2">
              <div>{userDetails.name}</div>
            </div>
            <hr />
            <div className="py-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{userDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span>{userDetails.email}</span>
              </div>
            </div>
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-black my-2"
              onClick={() => {
                navigate("/settings/user-profile");
                setIsSidebarOpen("")
              }}
            >
              <IoMdSettings />
              <span>Settings</span>
            </button>
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-black my-2"
              onClick={() => {
                dispatch(setUserLogout());
                navigate("/");
              }}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;