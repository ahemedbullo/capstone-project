import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BudgetPage from "./BudgetPage.jsx";
import ExpensePage from "./ExpensePage.jsx";
import './Styles/HomePage.css'
const HomePage = () => {
  const { currentProfile, setCurrentProfile } = useContext(UserContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };

  return (
    <>
    <div className="homepage-container">
      Welcome
      <div className="content-container">
        <div className="box">
        <BudgetPage/>
        </div>
     <div className="box">
     <ExpensePage/>
     </div>

      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
    </>
  );
};

export default HomePage;
{/* <ExpenseContext.Provider
value={{ existingExpenses, setExistingExpenses }}
>
<BudgetContext.Provider value={{ existingBudgets, setExistingBudgets }}>
  <button onClick={handleLogout}>Logout</button>
  <div>Welcome </div>
  <div>This will be the home page</div>
  <Expense />
  <Budget />
  {existingExpenses ? (
    <>
      <p>Create you budgets</p>
      <Budget />
    </>
  ) : (
    <></>
  )}
</BudgetContext.Provider>
</ExpenseContext.Provider> */}
