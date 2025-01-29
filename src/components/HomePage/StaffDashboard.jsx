import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Credit from "../../assets/dashboard/Credit.png";
import Customers from "../../assets/dashboard/Customers.png";
import Debit from "../../assets/dashboard/Debit.png";
import Delivery from "../../assets/dashboard/Delivery.png";
import Estimate from "../../assets/dashboard/Estimate.png";
import hello from "../../assets/dashboard/hello.png";
import Invoice from "../../assets/dashboard/Invoice.png";
import man from "../../assets/dashboard/man.png";
import Plans from "../../assets/dashboard/Plans.png";
import Po from "../../assets/dashboard/Po.png";
import Point from "../../assets/dashboard/Point.png";
import ProForma from "../../assets/dashboard/ProForma.png";
import Projects from "../../assets/dashboard/Projects.png";
import Purchase from "../../assets/dashboard/Purchase.png";
import Subscriptions from "../../assets/dashboard/Subscriptions.png";
import Vendors from "../../assets/dashboard/Vendors.png";
import { db } from "../../firebase";

const StaffDashboard = ({ checkPermission }) => {
  const navigate = useNavigate();
  const defaultIcons = {
    quick: [
      // {
      //   name: "Expense",
      //   img: expense,
      //   link: "expense",
      // },
      {
        name: "Estimate",
        img: Estimate,
        role: "quotation",
        link: "quotation",
      },
      {
        name: "Invoice",
        img: Invoice,
        role: "invoice",
        link: "invoice",
      },
      // {
      //   name: "Inventory",
      //   img: Inventory,
      //   link: "products",
      // },
      {
        name: "Projects",
        img: Projects,
        role: "project",
        link: "projects",
      },
      {
        name: "Customers",
        img: Customers,
        role: "customers",
        link: "customers",
      },
    ],
    manage: [
      {
        name: "Pro Forma",
        img: ProForma,
        role: "proFormaInvoice",
        link: "pro-forma-invoice",
      },
      {
        name: "Delivery Challan",
        img: Delivery,
        role: "deliveryChallan",
        link: "delivery-challan",
      },
      {
        name: "Credit Note",
        img: Credit,
        role: "creditNote",
        link: "credit-note",
      },
      {
        name: "Subscriptions",
        img: Subscriptions,
        role: "services",
        link: "subscriptions",
      },
      {
        name: "Plans",
        img: Plans,
        role: "plan",
        link: "plan-list",
      },
      {
        name: "Point-Of-Sale",
        img: Point,
        role: "pos",
        link: "pos",
      },
      {
        name: "Purchase",
        img: Purchase,
        role: "purchase",
        link: "purchase",
      },
      {
        name: "Purchase Order",
        img: Po,
        role: "po",
        link: "po",
      },
      {
        name: "Debit Note",
        img: Debit,
        role: "debitNote",
        link: "debit-note",
      },
      {
        name: "Vendors",
        img: Vendors,
        role: "vendors",
        link: "vendors",
      },
    ],
  };
  const defaultCreateOptions = [
    {
      name: "Invoice",
      role: "invoice",
      link: "invoice/create-invoice",
    },
    {
      name: "Quotation",
      role: "quotation",
      link: "quotation/create-quotation",
    },
    {
      name: "ProFormaInvoice",
      role: "proFormaInvoice",
      link: "pro-forma-invoice/create-proForma",
    },
    {
      name: "Delivery Challan",
      role: "deliveryChallan",
      link: "delivery-challan/create-deliverychallan",
    },
    {
      name: "Service",
      role: "services",
      link: "subscriptions/create-subscription",
    },
    {
      name: "Credit Note",
      role: "creditNote",
      link: "credit-note/create-creditnote",
    },
    {
      name: "Purchase",
      role: "purchase",
      link: "purchase/create-purchase",
    },
    {
      name: "Purchase Order",
      role: "po",
      link: "po/create-po",
    },
    {
      name: "Debit Note",
      role: "debitNote",
      link: "debit-note/create-debitNote",
    },
    {
      name: "Point-Of-Sale",
      role: "pos",
      link: "pos/create-pos",
    },
  ];
  const [expenseAmount, setExpenseAmount] = useState({
    expense: 0,
    income: 0,
    balance: 0,
  });
  const [countItems, setCountItems] = useState({
    customers: 0,
    vendors: 0,
    staff: 0,
    projects: 0,
  });

  const [isOpen, setIsOpen] = useState(false);
  const userDetails = useSelector((state) => state.users);
  const companyDetails =
    userDetails.companies[userDetails.selectedCompanyIndex];

  const [icons, setIcons] = useState();

  const [createOptions, setCreateOptions] = useState();

  const handleSelect = (option) => {
    setIsOpen(false);
    navigate(option.link);
  };

  async function fetchCountData() {
    try {
      const companyRef = doc(db, "companies", companyDetails.companyId);
      const qProjects = query(
        collection(db, "projects"),
        where("companyRef", "==", companyRef)
      );
      const qCustomers = query(
        collection(db, "customers"),
        where("companyRef", "==", companyRef)
      );
      const qVendors = query(
        collection(db, "vendors"),
        where("companyRef", "==", companyRef)
      );
      const qStaff = query(
        collection(db, "staff"),
        where("companyRef", "==", companyRef)
      );

      const [
        projectsSnapshot,
        customersSnapshot,
        vendorsSnapshot,
        staffSnapshot,
      ] = await Promise.all([
        getDocs(qProjects),
        getDocs(qCustomers),
        getDocs(qVendors),
        getDocs(qStaff),
      ]);

      const projectsCount = projectsSnapshot.size;
      const customersCount = customersSnapshot.size;
      const vendorsCount = vendorsSnapshot.size;
      const staffCount = staffSnapshot.size;

      setCountItems((prevState) => ({
        ...prevState,
        projects: projectsCount,
        customers: customersCount,
        vendors: vendorsCount,
        staff: staffCount,
      }));
    } catch (error) {
      console.log("🚀 ~ fetchDashboardData ~ error:", error);
    }
  }
  async function fetchExpenseData() {
    try {
      const expenseRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "expenses"
      );
      const invoiceRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "invoices"
      );
      const serviceRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "services"
      );
      const posRef = collection(
        db,
        "companies",
        companyDetails.companyId,
        "pos"
      );
      const poRef = collection(db, "companies", companyDetails.companyId, "po");

      const [
        expenseSnapshot,
        invoiceSnapshot,
        serviceSnapshot,
        posSnapshot,
        poSnapshot,
      ] = await Promise.all([
        getDocs(expenseRef),
        getDocs(invoiceRef),
        getDocs(serviceRef),
        getDocs(posRef),
        getDocs(poRef),
      ]);

      const fetchedExpenses = expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().amount,
      }));
      const fetchedInvoices = invoiceSnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().total,
      }));
      const fetchedServices = serviceSnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().total,
      }));
      const fetchedPos = posSnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().total,
      }));
      const fetchedPo = poSnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().total,
      }));
      const totalExpense = [...fetchedPo, ...fetchedExpenses].reduce(
        (acc, item) => acc + item.amount,
        0
      );
      const totalIncome = [
        ...fetchedInvoices,
        ...fetchedServices,
        ...fetchedPos,
      ].reduce((acc, item) => acc + item.amount, 0);

      const totalBalance = totalIncome - totalExpense;
      setExpenseAmount({
        expense: totalExpense,
        income: totalIncome,
        balance: totalBalance,
      });
    } catch (error) {
      console.log("🚀 ~ fetchExpenseData ~ error:", error);
    }
  }

  function ModifiedIconsCreateOption() {
    const filterIcons = {
      quick: defaultIcons.quick.filter((item) =>
        checkPermission(item.role, "view")
      ),
      manage: defaultIcons.manage.filter((item) =>
        checkPermission(item.role, "view")
      ),
    };
    const filterCreateOptions = defaultCreateOptions.filter((item) =>
      checkPermission(item.role, "create")
    );
    setIcons(filterIcons);
    setCreateOptions(filterCreateOptions);
  }

  useEffect(() => {
    ModifiedIconsCreateOption();
    fetchCountData();
    fetchExpenseData();
  }, [checkPermission]);

  return (
    <div className="flex bg-white h-full">
      <main className="flex w-full overflow-y-auto">
        <div className="w-full">
          <div className="px-6 py-2 border-b shadow">
            <div className="font-semibold flex items-center space-x-2">
              <img src={hello} width="50px" height="46px" />
              <div className="text-[20px]">Hey, {userDetails.name}</div>
            </div>
            <div className="shadow border rounded-2xl">
              <div className="flex items-center justify-between border px-6 py-2 rounded-t-2xl">
                <div className="flex items-center w-3/4 space-x-4">
                  <div className="border rounded-full w-[89px] h-[89px] shadow flex items-center justify-center">
                    <img
                      src={man}
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow object-cover w-[89px] h-[89px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[24px] font-semibold">
                        {userDetails.name}
                      </div>
                      <div className="text-[16px]">{userDetails.address}</div>
                      <div className="text-[16px]">{userDetails.phone}</div>
                    </div>
                  </div>
                </div>
                {/* <div className="flex items-center justify-around w-full space-x-3">
                  <div className="border-r w-full flex justify-between pe-2">
                    <div>
                      <div className="text-[16px]">Expense</div>
                      <div className="text-[24px] font-bold">
                        Rs {expenseAmount.expense}
                      </div>
                    </div>
                    <div>
                      <img src={expenseArrow} width="27px" height="24px" />
                    </div>
                  </div>
                  <div className="border-r w-full">
                    <div className="border-r w-full flex justify-between pe-2">
                      <div>
                        <div className="text-[16px]">Income</div>
                        <div className="text-[24px] font-bold">
                          Rs {expenseAmount.income}
                        </div>
                      </div>
                      <div>
                        <img src={incomeArrow} width="27px" height="24px" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-[16px]">Balance</div>
                    <div className="text-[24px] font-bold">
                      Rs {expenseAmount.balance}
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="flex bg-gradient-to-r from-[#2788FF] via-[#0059D5] to-[#0570F3] px-6 py-2 rounded-b-2xl h-[87px]">
                <div className="flex items-center justify-between text-center w-full text-white font-bold">
                  <div>
                    <div className="text-[14px]">Customers</div>
                    <div className="text-[40px]">{countItems.customers}</div>
                  </div>
                  <div>
                    <div className="text-[14px]">Vendors</div>
                    <div className="text-[40px]">{countItems.vendors}</div>
                  </div>
                  <div>
                    <div className="text-[14px]">Staff</div>
                    <div className="text-[40px]">{countItems.staff}</div>
                  </div>
                  <div>
                    <div className="text-[14px]">Projects</div>
                    <div className="text-[40px]">{countItems.projects}</div>
                  </div>
                </div>
                <div className="w-3/5 flex items-center justify-end">
                  <div className="relative cursor-pointer">
                    <div
                      className="bg-white px-4 py-2 rounded-lg flex items-center justify-between w-[200px] text-[#0366E6] text-[14px]"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span>Create</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${
                          isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                        viewBox="0 0 512 512"
                      >
                        <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                      </svg>
                    </div>

                    {isOpen && (
                      <div className="absolute top-full left-0 bg-white w-[200px] mt-1 rounded shadow-lg flex flex-col z-50 max-h-96 overflow-y-auto">
                        {createOptions?.map((option, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 text-[#0366E6] hover:bg-[#0366E6] hover:text-white rounded border-b"
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
              {icons?.quick.map((item) => (
                <div
                  key={item.name}
                  className="cursor-pointer space-y-1"
                  onClick={() => navigate(item.link)}
                >
                  <div className="flex items-center justify-center">
                    <img
                      src={item.img}
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow object-cover w-[60px] h-[60px]"
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
              {icons?.manage.map((item) => (
                <div
                  key={item.name}
                  className="cursor-pointer"
                  onClick={() => navigate(item.link)}
                >
                  <div className="flex items-center justify-center">
                    <img
                      src={item.img}
                      className="bg-[#F0F4F8] p-3 rounded-2xl hover:shadow object-cover w-[60px] h-[60px]"
                    />
                  </div>
                  <div className="text-center">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
