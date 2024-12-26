import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useLocation, Link, useNavigate } from "react-router-dom";

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
        <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
      </button>
    </nav>
  );
};

export default Breadcrumbs;
