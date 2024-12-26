import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GrMenu } from "react-icons/gr";
import { FaAngleUp } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";

function SideBar({ staff }) {
  const location = useLocation();
  const [isSideBarExpend, setIsSideBarExpend] = useState(true);
  const userDetails = useSelector((state) => state.users);
  const selectedDashboardUser = userDetails.selectedDashboard;
  const viewDashBoardList = {
    customer: ["Invoice", "Projects", "Quotation"],
    vendor: ["PO", "Projects", "Quotation"],
    staff: staff
      ? staff[0]?.map((s) => s.toString().replace(/^Create/, ""))
      : [],
  };
  console.log("staff", staff);

  console.log("viewdashboard", viewDashBoardList);
  const constSideBarDetails = {
    //
    sales: {
      // image: <LiaMoneyBillWaveSolid size={30} />,
      isExpend: true,
      items: [
        {
          name: "Invoice",
          path: "/invoice",
        },

        {
          name: "Quotation",
          path: "/quotation",
        },
        {
          name: "Pro Forma Invoice",
          path: "/pro-forma-invoice",
        },
        {
          name: "Delivery Challan",
          path: "/delivery-challan",
        },
        {
          name: "Subscription",
          path: "/services",
        },
        {
          name: "Credit Note",
          path: "/credit-note",
        },
        {
          name: "Purchase",
          path: "/purchase",
        },
        {
          name: "PO",
          path: "/po",
        },
        {
          name: "Debit Note",
          path: "",
        },
      ],
    },

    manage: {
      // image: <GrUserManager size={30} />,
      isExpend: true,
      items: [
        {
          name: "Projects",
          path: "/projects",
        },
        {
          name: "Inventory",
          path: "/products",
        },
        {
          name: "Subscription Plans",
          path: "/services-list",
        },
        {
          name: "Staff & Payout",
          path: "/staff-payout",
        },
      ],
    },
    parties: {
      isExpend: true,
      items: [
        {
          name: "Customers",
          path: "/customers",
        },
        {
          name: "Vendors",
          path: "/vendors",
        },
      ],
    },

    more: {
      // image: <CgMoreVerticalO size={30} />,
      isExpend: true,
      items: [
        {
          name: "Insights",
          path: "",
        },
        {
          name: "Report",
          path: "",
        },
      ],
    },
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
          if (viewDashBoardList[selectedDashboardUser]?.includes(ele.name)) {
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
      className="border-2 h-full overflow-y-auto"
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
        <div className="border-b-2 ">
          <Link to="" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">Home</div>
          </Link>
        </div>
        <div className="border-b-2 mt-3">
          <Link to="/expense" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">Expense</div>
          </Link>
        </div>
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
        <div className="border-b-2 mt-3">
          <Link to="/pos" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">POS</div>
          </Link>
        </div>
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
        <div className="border-b-2 mt-3">
          <Link to="" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">Documents</div>
          </Link>{" "}
        </div>
        <div className="border-b-2 mt-3">
          <Link to="/reminder" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">Reminder</div>
          </Link>
        </div>
        <div className="mt-3  border-b-2 ">
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
        </div>
        <div className="border-b-2 mt-3">
          <Link to="" className=" cursor-pointer mb-10">
            <div className="text-lg font-semibold pl-3">Business Card</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
