import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { GrMenu } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

function SideBar() {
  const location = useLocation();
  const [isSideBarExpend, setIsSideBarExpend] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const staffAndCompanyDetails =
    userDetails.asAStaffCompanies[userDetails.selectedStaffCompanyIndex];
  const selectedDashboardUser = userDetails.selectedDashboard;
  const rolesList = [
    "invoice",
    "services",
    "quotation",
    "purchase",
    "customers",
    "vendors",
    "project",
    "po",
    "pos",
    "proFormaInvoice",
    "creditNote",
    "deliveryChallan",
  ];
  const constSideBarDetails = {
    //
    sales: {
      // image: <LiaMoneyBillWaveSolid size={30} />,
      isExpend: true,
      items: [
        {
          id: "invoice",
          name: "Invoice",
          path: "/invoice",
        },

        {
          id: "quotation",
          name: "Quotation",
          path: "/quotation",
        },
        {
          id: "proFormaInvoice",
          name: "Pro Forma Invoice",
          path: "/pro-forma-invoice",
        },
        {
          id: "deliveryChallan",
          name: "Delivery Challan",
          path: "/delivery-challan",
        },
        {
          id: "subscription",
          name: "Subscription",
          path: "/services",
        },
        {
          id: "creditNote",
          name: "Credit Note",
          path: "/credit-note",
        },
        {
          id: "purchase",
          name: "Purchase",
          path: "/purchase",
        },
        {
          id: "pO",
          name: "PO",
          path: "/po",
        },
        {
          id: "debitNote",
          name: "Debit Note",
          path: "/debit-note",
        },
      ],
    },

    manage: {
      // image: <GrUserManager size={30} />,
      isExpend: true,
      items: [
        {
          id: "projects",
          name: "Projects",
          path: "/projects",
        },
        {
          id: "inventory",
          name: "Inventory",
          path: "/products",
        },
        {
          id: "subscriptionPlans",
          name: "Subscription Plans",
          path: "/services-list",
        },
        {
          id: "staff&Payout",
          name: "Staff & Payout",
          path: "/staff-payout",
        },
      ],
    },
    parties: {
      isExpend: true,
      items: [
        {
          id: "customers",
          name: "Customers",
          path: "/customers",
        },
        {
          id: "vendors",
          name: "Vendors",
          path: "/vendors",
        },
      ],
    },

    more: {
      //   // image: <CgMoreVerticalO size={30} />,
      //   isExpend: true,
      //   items: [
      //     {
      //       id: "insights",
      //       name: "Insights",
      //       path: "",
      //     },
      //     {
      //       id: "report",
      //       name: "Report",
      //       path: "",
      //     },
      //   ],
    },
  };

  const staffSideBarDetails = staffAndCompanyDetails
    ? staffAndCompanyDetails?.roles || ""
    : "";
  console.log("🚀 ~ SideBar ~ staffSideBarDetails:", staffSideBarDetails);

  // const projectsList = ["users", "milestones", "tasks", "files", "approvals"];

  // const actions = ["create", "edit", "view", "delete"];
  const rolesArray = staffSideBarDetails
    ? rolesList.filter((role) => {
        return staffSideBarDetails[role]?.view ?? false;
      })
    : [];
  console.log("🚀 ~ SideBar ~ rolesArray:", rolesArray);
  const viewDashBoardList = {
    customer: ["invoice", "projects", "quotation"],
    vendor: ["pO", "projects", "quotation"],
    staff: rolesArray,
  };

  const [sideBarDetails, setSideBarDetails] = useState(constSideBarDetails);
  useEffect(() => {
    if (selectedDashboardUser === "") {
      setSideBarDetails(constSideBarDetails);
      return;
    }
    let updatedSidebarData = {};
    for (let key of Object.keys(constSideBarDetails)) {
      if (!updatedSidebarData[key]) {
        updatedSidebarData[key] = {
          isExpend: true,
          items: [],
        };
      }
      updatedSidebarData[key].items = constSideBarDetails[key].items?.filter(
        (ele) => {
          if (viewDashBoardList[selectedDashboardUser]?.includes(ele.id)) {
            return true;
          }
          return false;
        }
      );
    }
    setSideBarDetails(updatedSidebarData);
  }, [selectedDashboardUser]);

  return (
    <div
      className="border-2 h-full overflow-y-hidden hover:overflow-y-auto"
      style={{ width: isSideBarExpend ? "15vw" : "" }}
    >
      <div className="flex justify-end cursor-pointer">
        <div
          className=""
          onClick={() => {
            setIsSideBarExpend(!isSideBarExpend);
            setSideBarDetails({
              sales: {
                ...sideBarDetails.sales,
                isExpend: false,
              },
              manage: {
                ...sideBarDetails.manage,
                isExpend: false,
              },
              more: {
                ...sideBarDetails.more,
                isExpend: false,
              },
              parties: {
                ...sideBarDetails.more,
                isExpend: false,
              },
            });
          }}
        >
          {isSideBarExpend ? <IoMdClose size={30} /> : <GrMenu size={30} />}
        </div>
      </div>
      <div className="p-1">
        {selectedDashboardUser === "staff" && (
          <div className="border-b-2 ">
            <Link
              to={"/staff/profile/" + staffAndCompanyDetails?.id}
              className=" cursor-pointer mb-10"
            >
              <div className="text-lg font-semibold pl-3">Profile</div>
            </Link>
          </div>
        )}
        <div className="border-b-2 ">
          <Link to="" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">Home</div>
          </Link>
        </div>
        {selectedDashboardUser === "" && (
          <div className="border-b-2 mt-3">
            <Link to="/expense" className=" cursor-pointer mb-10">
              <div className="text-lg font-semibold pl-3">Expense</div>
            </Link>
          </div>
        )}
        <div className=" border-b-2 mt-3">
          <div
            className="flex items-center justify-between"
            onClick={() =>
              setSideBarDetails({
                ...sideBarDetails,
                sales: {
                  ...sideBarDetails.sales,
                  isExpend: !sideBarDetails.sales.isExpend,
                },
              })
            }
          >
            <div className="flex items-center">
              {/* <div>{sideBarDetails.sales.image}</div> */}
              <div
                className="text-lg font-semibold pl-3"
                hidden={!isSideBarExpend}
              >
                Sales
              </div>
            </div>
            <div hidden={!isSideBarExpend}>
              {sideBarDetails.sales.isExpend ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </div>
          <div
            className={
              isSideBarExpend ? "" : "ml-2 mt-2 bg-white rounded-lg shadow-lg"
            }
          >
            {sideBarDetails.sales.isExpend &&
              sideBarDetails.sales.items.map((item, index) => (
                <Link
                  key={index}
                  to={
                    (selectedDashboardUser ? "/" + selectedDashboardUser : "") +
                    item.path
                  }
                  className=" cursor-pointer"
                >
                  <div
                    className={
                      "w-full py-2 px-3 border-t hover:bg-gray-300 hover:rounded-lg  " +
                      (location.pathname
                        .split("/")
                        .includes(item.path.split("/")[1])
                        ? "bg-gray-300 rounded-lg"
                        : "")
                    }
                  >
                    {item.name}
                  </div>
                </Link>
              ))}
          </div>
        </div>
        {selectedDashboardUser === "" && (
          <div className="border-b-2 mt-3">
            <Link to="/pos" className=" cursor-pointer mb-10">
              <div className="text-lg font-semibold pl-3">POS</div>
            </Link>
          </div>
        )}
        <div className="mt-3  border-b-2">
          <div
            className="flex items-center justify-between"
            onClick={() =>
              setSideBarDetails({
                ...sideBarDetails,
                manage: {
                  ...sideBarDetails.manage,
                  isExpend: !sideBarDetails.manage.isExpend,
                },
              })
            }
          >
            <div className="flex items-center">
              {/* <div>{sideBarDetails.manage.image}</div> */}
              <div
                className="text-lg font-semibold pl-3"
                hidden={!isSideBarExpend}
              >
                Manage
              </div>
            </div>
            <div hidden={!isSideBarExpend}>
              {sideBarDetails.manage.isExpend ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </div>
          <div
            className={
              "" +
              (isSideBarExpend
                ? ""
                : "absolute left-full ml-2 mt-2 bg-white rounded-lg shadow-lg")
            }
          >
            {sideBarDetails.manage.isExpend &&
              sideBarDetails.manage.items.map((item, index) => (
                <Link
                  key={index}
                  to={
                    (selectedDashboardUser ? "/" + selectedDashboardUser : "") +
                    item.path
                  }
                  className=" cursor-pointer"
                >
                  <div
                    className={
                      "w-full py-2 px-3 border-t hover:bg-gray-300 hover:rounded-lg  " +
                      (location.pathname
                        .split("/")
                        .includes(item.path.split("/")[1])
                        ? "bg-gray-300 rounded-lg"
                        : "")
                    }
                  >
                    {item.name}
                  </div>
                </Link>
              ))}
          </div>
        </div>
        {selectedDashboardUser === "" && (
          <>
            <div className="mt-3  border-b-2">
              <div
                className="flex items-center justify-between"
                onClick={() =>
                  setSideBarDetails({
                    ...sideBarDetails,
                    parties: {
                      ...sideBarDetails.parties,
                      isExpend: !sideBarDetails.parties.isExpend,
                    },
                  })
                }
              >
                <div className="flex items-center">
                  {/* <div>{sideBarDetails.manage.image}</div> */}
                  <div
                    className="text-lg font-semibold pl-3"
                    hidden={!isSideBarExpend}
                  >
                    Parties
                  </div>
                </div>
                <div hidden={!isSideBarExpend}>
                  {sideBarDetails.parties.isExpend ? (
                    <FaAngleUp />
                  ) : (
                    <FaAngleDown />
                  )}
                </div>
              </div>
              <div
                className={
                  "" +
                  (isSideBarExpend
                    ? ""
                    : "absolute left-full ml-2 mt-2 bg-white rounded-lg shadow-lg")
                }
              >
                {sideBarDetails.parties.isExpend &&
                  sideBarDetails.parties.items.map((item, index) => (
                    <Link
                      key={index}
                      to={
                        (selectedDashboardUser
                          ? "/" + selectedDashboardUser
                          : "") + item.path
                      }
                      className=" cursor-pointer"
                    >
                      <div
                        className={
                          "w-full py-2 px-3 border-t hover:bg-gray-300 hover:rounded-lg  " +
                          (location.pathname
                            .split("/")
                            .includes(item.path.split("/")[1])
                            ? "bg-gray-300 rounded-lg"
                            : "")
                        }
                      >
                        {item.name}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
            <div className="border-b-2 mt-3">
              <Link to="/documents" className=" cursor-pointer mb-10">
                <div className="text-lg font-semibold pl-3">Documents</div>
              </Link>{" "}
            </div>
            <div className="border-b-2 mt-3">
              <Link to="/reminder" className=" cursor-pointer mb-10">
                <div className="text-lg font-semibold pl-3">Reminder</div>
              </Link>
            </div>
          </>
        )}
        {/* <div className="mt-3  border-b-2 ">
          <div
            className="flex items-center justify-between"
            onClick={() =>
              setSideBarDetails({
                ...sideBarDetails,
                more: {
                  ...sideBarDetails.more,
                  isExpend: !sideBarDetails.more.isExpend,
                },
              })
            }
          >
            <div className="flex items-center ">
              <div
                className="text-lg font-semibold pl-3 "
                hidden={!isSideBarExpend}
              >
                More
              </div>
            </div>
            <div hidden={!isSideBarExpend}>
              {sideBarDetails.more.isExpend ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </div>
          <div
            className={
              isSideBarExpend ? "" : "ml-2 mt-2 bg-white rounded-lg shadow-lg"
            }
          >
            {sideBarDetails.more.isExpend &&
              sideBarDetails.more.items.map((item, index) => (
                <Link
                  key={index}
                  to={
                    (selectedDashboardUser ? "/" + selectedDashboardUser : "") +
                    item.path
                  }
                  className=" cursor-pointer"
                >
                  <div
                    className={
                      "w-full py-2 px-3 border-t hover:bg-gray-300 hover:rounded-lg  " +
                      (location.pathname
                        .split("/")
                        .includes(item.path.split("/")[1])
                        ? "bg-gray-300 rounded-lg"
                        : "")
                    }
                  >
                    {item.name}
                  </div>
                </Link>
              ))}
          </div>
        </div> */}
        {selectedDashboardUser === "" && (
          <div className="border-b-2 mt-3">
            <Link to="" className=" cursor-pointer mb-10">
              <div className="text-lg font-semibold pl-3">Business Card</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
SideBar.propTypes = {
  staff: PropTypes.array,
  staffId: PropTypes.string,
};

export default SideBar;
