import React, { useContext, useState } from "react";
import Expense from "./Expense";
import Budget from "./Budget.jsx";
import { UserContext } from "../UserContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ExpenseContext } from "../ExpenseContext.js";

const HomePage = () => {
  const { currentProfile, setCurrentProfile } = useContext(UserContext);
  const [existingExpenses, setExistingExpenses] = useState(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };

  return (
    <>
      <ExpenseContext.Provider
        value={{ existingExpenses, setExistingExpenses }}
      >
        <button onClick={handleLogout}>Logout</button>
        <div>Welcome {currentProfile}</div>
        <div>This will be the home page</div>
        <Expense />
        {existingExpenses ? (
          <>
            <p>Create you budgets</p>
            <Budget />
          </>
        ) : (
          <></>
        )}
      </ExpenseContext.Provider>
    </>
  );
};

export default HomePage;
