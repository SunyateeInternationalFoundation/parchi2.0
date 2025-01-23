import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Business from "../../assets/dashboard/Business.png";
import Credit from "../../assets/dashboard/Credit.png";
import Customers from "../../assets/dashboard/Customers.png";
import Debit from "../../assets/dashboard/Debit.png";
import Delivery from "../../assets/dashboard/Delivery.png";
import Documents from "../../assets/dashboard/Documents.png";
import Estimate from "../../assets/dashboard/Estimate.png";
import expense from "../../assets/dashboard/expense.png";
import expenseArrow from "../../assets/dashboard/expenseArrow.png";
import heartPartnerHandshake from "../../assets/dashboard/heart-partner-handshake.png";
import hello from "../../assets/dashboard/hello.png";
import incomeArrow from "../../assets/dashboard/incomeArrow.png";
import Inventory from "../../assets/dashboard/Inventory.png";
import Invoice from "../../assets/dashboard/Invoice.png";
import man from "../../assets/dashboard/man.png";
import Plans from "../../assets/dashboard/Plans.png";
import Po from "../../assets/dashboard/Po.png";
import Point from "../../assets/dashboard/Point.png";
import ProForma from "../../assets/dashboard/ProForma.png";
import Projects from "../../assets/dashboard/Projects.png";
import Purchase from "../../assets/dashboard/Purchase.png";
import Reminders from "../../assets/dashboard/Reminders.png";
import Reports from "../../assets/dashboard/Reports.png";
import settings from "../../assets/dashboard/settings.png";
import signOut from "../../assets/dashboard/signOut.png";
import Staff from "../../assets/dashboard/Staff.png";
import Subscriptions from "../../assets/dashboard/Subscriptions.png";
import subscriptionUser from "../../assets/dashboard/subscriptionUser.png";
import userTrust from "../../assets/dashboard/userTrust.png";
import Vendors from "../../assets/dashboard/Vendors.png";
import { setUserLogout } from "../../store/UserSlice";
const Dashboard = () => {
  const navigate = useNavigate();
  const icons = {
    navbar: [
      {
        name: "Support",
        img: heartPartnerHandshake,
        link: "",
      },
      {
        name: "Subscriptions",
        img: subscriptionUser,
        link: "",
      },
      {
        name: "Profile",
        img: userTrust,
        link: "",
      },
      {
        name: "Settings",
        img: settings,
        link: "/settings/user-profile",
      },
    ],
    quick: [
      {
        name: "Expense",
        img: expense,
        link: "/expense",
      },
      {
        name: "Estimate",
        img: Estimate,
        link: "/quotation",
      },
      {
        name: "Invoice",
        img: Invoice,
        link: "/invoice",
      },
      {
        name: "Inventory",
        img: Inventory,
        link: "/products",
      },
      {
        name: "Projects",
        img: Projects,
        link: "/projects",
      },
      {
        name: "Customers",
        img: Customers,
        link: "/customers",
      },
    ],
    manage: [
      {
        name: "Pro Forma",
        img: ProForma,
        link: "/pro-forma-invoice",
      },
      {
        name: "Delivery Challan",
        img: Delivery,
        link: "/delivery-challan",
      },
      {
        name: "Credit Note",
        img: Credit,
        link: "/credit-note",
      },
      {
        name: "Subscriptions",
        img: Subscriptions,
        link: "/services",
      },
      {
        name: "Plans",
        img: Plans,
        link: "/services-list",
      },
      {
        name: "Point-Of-Sale",
        img: Point,
        link: "/pos",
      },
      {
        name: "Purchase",
        img: Purchase,
        link: "/purchase",
      },
      {
        name: "Purchase Order",
        img: Po,
        link: "/po",
      },
      {
        name: "Debit Note",
        img: Debit,
        link: "/debit-note",
      },
      {
        name: "Vendors",
        img: Vendors,
        link: "/vendors",
      },
      {
        name: "Staff & Payouts",
        img: Staff,
        link: "/staff-payout?tab=Staff",
      },
    ],
    more: [
      {
        name: "Reminders",
        img: Reminders,
        link: "/reminder",
      },
      {
        name: "Documents",
        img: Documents,
        link: "/documents",
      },
      {
        name: "Reports",
        img: Reports,
        link: "/",
      },
      {
        name: "Business card",
        img: Business,
        link: "/business-card",
      },
    ],
  };
  const [isOpen, setIsOpen] = useState(false);

  const createOptions = [
    {
      name: "Invoice",
      link: "/invoice/create-invoice",
    },
    {
      name: "Quotation",
      link: "/quotation/create-quotation",
    },
    {
      name: "ProFormaInvoice",
      link: "/pro-forma-invoice/create-proForma",
    },
    {
      name: "Delivery Challan",
      link: "/delivery-challan/create-deliverychallan",
    },
    {
      name: "Service",
      link: "/services/create-service",
    },
    {
      name: "Credit Note",
      link: "/credit-note/create-creditnote",
    },
    {
      name: "Purchase",
      link: "/purchase/create-purchase",
    },
    {
      name: "Purchase Order",
      link: "/po/create-po",
    },
    {
      name: "Debit Note",
      link: "/debit-note/create-debitNote",
    },
    {
      name: "Point-Of-Sale",
      link: "/pos/create-pos",
    },
  ];

  const handleSelect = (option) => {
    setIsOpen(false);
    navigate(option.link);
  };

  const dispatch = useDispatch();
  return (
    <div className="flex  bg-white">
      <aside
        className="relative w-[120px] 
 bg-[#182238] border-r border-[#D9D9D9] text-white font-inter text-xs font-normal leading-4 text-left underline-offset-auto decoration-slice"
      >
        <ul className="flex flex-col p-4 space-y-9">
          {icons.navbar.map((item) => (
            <li
              className="font-semibold cursor-pointer"
              key={item.name}
              onClick={() => navigate(item.link)}
            >
              <div className="space-y-3 ">
                <div className="flex items-center justify-center">
                  <img src={item.img} width="35px" height="35px" />
                </div>
                <div className="text-center">{item.name}</div>
              </div>
            </li>
          ))}
        </ul>
        <div
          className="space-y-3 absolute bottom-0 border-t py-5 w-full cursor-pointer"
          onClick={() => {
            dispatch(setUserLogout());
            navigate("/");
          }}
        >
          <div className="flex items-center justify-center ">
            <img src={signOut} width="35px" height="35px" />
          </div>
          <div className="text-center">Logout</div>
        </div>
      </aside>

      <main className="flex w-full overflow-y-auto" style={{ height: "92vh" }}>
        <div className=" w-full">
          <div className="px-6 py-2 border-b shadow">
            <div className=" font-semibold flex items-center space-x-2">
              <img src={hello} width="50px" height="46px" />
              <div className="text-[20px]">Hey, Prateek</div>
            </div>
            <div className="shadow border rounded-2xl">
              <div className="flex items-center justify-between border px-6 py-2 rounded-t-2xl">
                <div className="flex items-center w-3/4 space-x-4">
                  <div className="border rounded-full">
                    <img src={man} width="89px" height="89px" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[24px] font-semibold">
                        ABC Company
                      </div>
                      <div className="text-[16px] ]">Hyderabad</div>
                    </div>
                    <div className="flex items-center space-x-8 text-[14px]">
                      <div>Plan</div>
                      <div className="rounded-2xl px-4 py-1 bg-[#0060E6]  text-white">
                        Free
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-around w-full space-x-6">
                  <div className="border-r w-full flex justify-between px-4">
                    <div>
                      <div className="text-[16px]">Expense</div>
                      <div className="text-[24px] font-bold">Rs 0</div>
                    </div>
                    <div>
                      <img src={expenseArrow} width="27px" height="24px" />
                    </div>
                  </div>
                  <div className="border-r w-full">
                    <div className="border-r w-full flex justify-between px-4">
                      <div>
                        <div className="text-[16px]">Income</div>
                        <div className="text-[24px] font-bold">Rs 0</div>
                      </div>
                      <div>
                        <img src={incomeArrow} width="27px" height="24px" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-[16px]">Balance</div>
                    <div className="text-[24px] font-bold">Rs 0</div>
                  </div>
                </div>
              </div>
              <div className="flex bg-gradient-to-r from-[#2788FF] via-[#0059D5] to-[#0570F3] px-6 py-2 rounded-b-2xl h-[87px]">
                <div className="flex items-center justify-between text-center w-full text-white font-bold">
                  <div>
                    <div className="text-[14px]">Customers</div>
                    <div className="text-[40px]  ">3</div>
                  </div>
                  <div>
                    <div className="text-[14px]">vendors</div>
                    <div className="text-[40px]">3</div>
                  </div>
                  <div>
                    <div className="text-[14px]">Staff</div>
                    <div className="text-[40px]">3</div>
                  </div>
                  <div>
                    <div className="text-[14px]">Projects</div>
                    <div className="text-[40px]">3</div>
                  </div>
                </div>
                <div className="w-3/5 flex items-center justify-end">
                  <div className="relative cursor-pointer">
                    {/* Selected Option */}
                    <div
                      className="bg-white  px-4 py-2 rounded-lg flex items-center justify-between w-[200px] text-[#0366E6] text-[14px]"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span>Create</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform  ${
                          isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                        viewBox="0 0 512 512"
                      >
                        <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                      </svg>
                    </div>

                    {isOpen && (
                      <div className="absolute top-full left-0 bg-white w-[200px]  mt-1 rounded shadow-lg flex flex-col z-50 max-h-96 overflow-y-auto">
                        {createOptions.map((option, index) => (
                          <div
                            key={index}
                            className={`px-4 py-2 text-[#0366E6] hover:bg-[#0366E6] hover:text-white rounded border-b`}
                            onClick={() => handleSelect(option)}
                          >
                            {option.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-8 pb-2 pt-6">
              {icons.quick.map((item) => (
                <div
                  key={item.name}
                  className="cursor-pointer space-y-1 "
                  onClick={() => navigate(item.link)}
                >
                  <div className="flex items-center justify-center ">
                    <img
                      src={item.img}
                      width="60px"
                      height="60px"
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow"
                    />
                  </div>
                  <div className="text-center font-inria-sans text-[16px] py-2">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-2">
            <div className="grid grid-cols-6 gap-8 py-8">
              {icons.manage.map((item) => (
                <div
                  key={item.name}
                  className="cursor-pointer"
                  onClick={() => navigate(item.link)}
                >
                  <div className="flex items-center justify-center ">
                    <img
                      src={item.img}
                      width="60px"
                      height="60px"
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow"
                    />
                  </div>
                  <div className="text-center">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/3 border px-4 py-2">
          <div className="">
            <div className="font-inria-sans bg-gradient-to-r from-[#3FC2C9] to-[#0C9DA0] rounded-t-2xl py-2 text-white h-[220px] relative ">
              <div className=" text-6xl font-bold pt-5 px-4 ">₹199</div>
              <div className="text-[15px] px-4">per month</div>
              <div className="text-center bottom-6 absolute w-full text-[16px]">
                Choose best plan for you!
              </div>
            </div>
            <div className="border-2 border-dashed rounded-b-2xl flex justify-between items-center px-4 py-2">
              <div>Details</div>
              <div
                className="bg-black rounded-full py-2 px-4 text-white cursor-pointer text-[16px] "
                onClick={() => navigate("/settings/subscription-plan")}
              >
                Upgrade
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 py-4">
            {icons.more.map((item) => (
              <div
                key={item.name}
                className="shadow border rounded-2xl h-[140px] cursor-pointer "
                onClick={() => navigate(item.link)}
              >
                <div className="bg-[#F0F4F8] rounded-t-2xl  text-white flex justify-center items-center h-[99px]">
                  <img src={item.img} width="56px" height="56px" />
                </div>
                <div className="rounded-b-2xl text-center px-4 py-2 text-[14px]">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
