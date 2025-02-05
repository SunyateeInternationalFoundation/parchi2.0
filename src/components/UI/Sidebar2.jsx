import { AiOutlineHome } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import clock from "../../assets/dashboard/clock.png";
import heartPartnerHandshake from "../../assets/dashboard/heart-partner-handshake.png";
import settings from "../../assets/dashboard/settings.png";
import signOut from "../../assets/dashboard/signOut.png";
import subscriptionUser from "../../assets/dashboard/subscriptionUser.png";
import userTrust from "../../assets/dashboard/userTrust.png";
import { setUserLogout } from "../../store/UserSlice";

function Sidebar2() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const navbar = [
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
    {
      name: "Logs",
      img: clock,
      link: "/settings/logs",
    },
  ];
  return (
    <aside
      className="relative w-[120px] 
   bg-[#182238] border-r border-[#D9D9D9] text-white font-inter text-xs font-normal leading-4 text-left underline-offset-auto decoration-slice"
    >
      <div
        className="space-y-3 mt-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="flex items-center justify-center">
          <AiOutlineHome size={35} />
        </div>
        <div className="text-center">Home</div>
      </div>
      <ul className="flex flex-col p-4 space-y-9">
        {navbar.map((item) => (
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
  );
}

export default Sidebar2;
