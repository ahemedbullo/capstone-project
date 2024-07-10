import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BudgetPage from "./BudgetPage.jsx";
import ExpensePage from "./ExpensePage.jsx";
import "./Styles/HomePage.css";
import Accounts from "./Accounts.jsx";
import { BudgetContext } from "../BudgetContext.js";
import { ExpenseContext } from "../ExpenseContext.js";

const HomePage = () => {
  const { currentProfile, setCurrentProfile } = useContext(UserContext);

  const [contextExpenses, setContextExpenses] = useState([]);
  const [contextBudgets, setContextBudgets] = useState([]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };

  return (
    <>
      <BudgetContext.Provider value={{ contextBudgets, setContextBudgets }}>
        <ExpenseContext.Provider
          value={{ contextExpenses, setContextExpenses }}
        >
          <header>
            {" "}
            <button onClick={handleLogout}>Logout</button>
          </header>
          <div className="homepage-container">
            Welcome
            <div className="content-container">
              <Accounts />
              <div className="box">
                <BudgetPage />
              </div>
              <div className="box">
                <ExpensePage />
              </div>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </ExpenseContext.Provider>
      </BudgetContext.Provider>
    </>
  );
};

export default HomePage;
