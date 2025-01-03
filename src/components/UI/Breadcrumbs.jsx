import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const navigate = useNavigate();
  function GoBack() {
    pathnames.pop();
    navigate(pathnames.join("/"));
  }

  return (
    <nav>
      <ul style={{ display: "flex", listStyle: "none" }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          return (
            <li key={to} style={{ marginLeft: "3px" }}>
              {">"} <Link to={to}>{value}</Link>
            </li>
          );
        })}
      </ul>
      <button
        onClick={GoBack}
        className="flex items-center bg-gray-300 text-gray-700 py-1 px-4 rounded-full transform hover:bg-gray-400 hover:text-white transition duration-200 ease-in-out"
      >
        <IoMdArrowRoundBack className="w-7 h-7 ms-3 mr-2 hover:text-blue-500" />
      </button>
    </nav>
  );
};

export default Breadcrumbs;
