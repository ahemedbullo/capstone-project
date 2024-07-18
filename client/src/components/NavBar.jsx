import React from "react";
import { Link } from "react-router-dom";
import "./Styles/NavBar.css";

const NavBar = () => {
  return (
    <>
      <nav className="navbar">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/expenses">Expenses</Link>
          </li>
          <li>
            <Link to="/budgets">Budgets</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};
export default NavBar;
