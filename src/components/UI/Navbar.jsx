import { useState, useEffect, useRef } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SunyaLogo from "../../assets/SunyaLogo.jpg";
import circleUser from "../../assets/dashboard/circleUser.png";
import notification from "../../assets/dashboard/notification.png";
import { setUserLogout } from "../../store/UserSlice";
import SelectDashboard from "./SelectDashboard";
import { IoSearch } from "react-icons/io5";
import invoiceLogo from "../../assets/dashboard/invoice.png";
import projectLogo from "../../assets/dashboard/projects.png";
import customerLogo from "../../assets/dashboard/customers.png";
import estimateLogo from "../../assets/dashboard/Estimate.png";
import purchaseOrderLogo from "../../assets/dashboard/Po.png";
import debitNoteLogo from "../../assets/dashboard/Debit.png";
import creditNoteLogo from "../../assets/dashboard/Credit.png";
import vendorLogo from "../../assets/dashboard/Vendors.png";
import staffLogo from "../../assets/dashboard/Staff.png";
import expenseLogo from "../../assets/dashboard/Expense.png";
import inventoryLogo from "../../assets/dashboard/Inventory.png";
import profLogo from "../../assets/dashboard/ProForma.png";
import deliveryLogo from "../../assets/dashboard/Delivery.png";
import subscription from "../../assets/dashboard/Subscriptions.png";
import plansLogo from "../../assets/dashboard/Plans.png";
import pos from "../../assets/dashboard/Point.png";
import purchase from "../../assets/dashboard/Purchase.png";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const userDetails = useSelector((state) => state.users);
  let companiesList = userDetails?.companies;
  let companyName =
    companiesList &&
    userDetails.companies[userDetails.selectedCompanyIndex]?.name;

  if (userDetails.selectedDashboard === "staff") {
    companiesList =
      userDetails.asAStaffCompanies.map((ele) => ele.companyDetails) ?? [];
    companyName =
      userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex]
        ?.companyDetails.name ?? "";
  }

  const allSuggestions = [
    { display: "Invoice", route: "/invoice", logo: invoiceLogo },
    { display: "Create Invoice", route: "/invoice/create-invoice", logo: invoiceLogo },
    { display: "Projects", route: "/projects", logo: projectLogo },
    { display: "Estimates", route: "/quotation", logo: estimateLogo },
    { display : "Create Estimate", route: "/quotation/create-quotation", logo: estimateLogo },
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
    {display : "Create Delivery Challan", route: "/delivery-challan/create-delivery-challan", logo: deliveryLogo},
    { display: "Subscriptions", route: "/subscriptions", logo: subscription },
    {display: "Create Subscription", route: "/subscriptions/create-subscription", logo: subscription},
    { display: "Plans", route: "/plan-list", logo: plansLogo },
    { display: "Pos", route: "/pos", logo: pos },
    { display: "Create Pos", route: "/pos/create-pos", logo: pos },
    { display: "Purchase", route: "/purchase", logo: purchase },
    { display: "Create Purchase", route: "/purchase/create-purchase", logo: purchase },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    const filteredSuggestions = allSuggestions.filter((suggestion) =>
      suggestion.display.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      navigate(suggestions[0].route);
    } else {
      alert("No matching component found");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.display);
    setSuggestions([]);
    navigate(suggestion.route);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="border-b border-gray-300" style={{ height: "8vh" }}>
        <div className="flex items-center justify-between px-10 w-full">
          <div className="flex items-center space-x-6">
            <Link href="#" className="flex items-center m-3">
              <div>
                <img src={SunyaLogo} width={100} alt="logo" height={100} className="mix-blend-multiply" />
              </div>
            </Link>
          </div>

          {/* Centered Search Bar */}
          {userDetails.selectedDashboard !== "staff" && (
            <div className="flex-grow flex justify-center" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg">
                <div className="flex items-center bg-white rounded-md border shadow-sm px-4 py-2">
                  <IoSearch className="text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search for invoices, projects,...etc"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setIsExpanded(true)}
                    className="flex-grow outline-none text-sm pl-2"
                  />
                </div>
                {suggestions.length > 0 && (
                  <ul className={`absolute bg-white border rounded-md shadow-lg mt-2 w-full ${isExpanded ? 'max-h-80' : 'max-h-40'} overflow-y-auto z-50`}>
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
              </form>
            </div>
          )}
          {userDetails.selectedDashboard === "staff" && (
            <div> You Logged as a Staff in {companyName}'s Company</div>
          )}
          <div className="flex items-center">

            <div
              className="flex items-center space-x-4 group relative cursor-pointer"
              onClick={() => setIsCompanyOpen(!isCompanyOpen)}
            >
              <div className="bg-orange-400 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full border hover:shadow">
                {companyName?.slice(0, 2).toUpperCase() || "YB"}
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-800 text-sm group-hover:text-gray-500 transition-colors duration-300">
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
            >
              <img src={notification} width={30} alt="user" height={30} />
            </button>
            {userDetails.selectedDashboard !== "staff" && (
              <button
                type="button"
                className="relative group px-2 py-1 rounded-full text-gray-600 hover:text-black ml-[3px]"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img src={circleUser} width={30} alt="user" height={30} />
              </button>
            )}
          </div>
        </div>
      </header>

      <SelectDashboard
        isOpen={isCompanyOpen}
        onClose={() => setIsCompanyOpen(false)}
        companiesList={companiesList}
      />
      {isProfileOpen && (
        <div
          className="fixed pr-2 flex items-start justify-end inset-0 bg-black bg-opacity-10"
          style={{ zIndex: 999 }}
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="w-80 bg-white shadow-2xl rounded-lg p-4 text-sm"
            style={{ marginTop: "8vh" }}
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
                setIsProfileOpen(false);
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