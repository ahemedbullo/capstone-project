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
import { AccountsContext } from "../AccountsContext.js";

const HomePage = () => {
  const { currentProfile, setCurrentProfile } = useContext(UserContext);
  const [contextExpenses, setContextExpenses] = useState([]);
  const [contextBudgets, setContextBudgets] = useState([]);
  const [contextAccounts, setContextAccounts] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };

  return (
    <BudgetContext.Provider value={{ contextBudgets, setContextBudgets }}>
      <ExpenseContext.Provider value={{ contextExpenses, setContextExpenses }}>
        <AccountsContext.Provider
          value={{ contextAccounts, setContextAccounts }}
        >
          <div className="homepage">
            <main className="main-content">
              <aside className="sidebar">
                <Accounts />
              </aside>
              <section className="budget-expense-container">
                <div className="card budget-card">
                  <h2>Budgets</h2>
                  <BudgetPage />
                </div>
                <div className="card expense-card">
                  <h2>Expenses</h2>
                  <ExpensePage />
                </div>
              </section>
            </main>
          </div>
        </AccountsContext.Provider>
      </ExpenseContext.Provider>
    </BudgetContext.Provider>
  );
};

export default HomePage;
