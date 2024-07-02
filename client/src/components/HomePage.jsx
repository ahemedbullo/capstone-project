import React, { useContext, useState } from "react";
import Expense from "./Expense";
import Budget from "./Budget.jsx";
import { UserContext } from "../UserContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ExpenseContext } from "../ExpenseContext.js";
import { BudgetContext } from "../BudgetContext.js";

const HomePage = () => {
  const { currentProfile, setCurrentProfile } = useContext(UserContext);
  const [existingExpenses, setExistingExpenses] = useState(null);
  const [existingBudgets, setExistingBudgets] = useState([]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };

  return (
    <>
    <div>
      Welcome {currentProfile.username}
      <button onClick={handleLogout}>Logout</button>
    </div>
     <Budget/>
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
