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
import NavBar from "./NavBar.jsx";
const HomePage = () => {
  const navigate = useNavigate();

  const { contextAccounts } = useContext(AccountsContext);

  return (
    <>
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
    </>
  );
};

export default HomePage;
