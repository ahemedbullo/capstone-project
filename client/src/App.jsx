import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "./components/LoginForm.jsx";
import SignupForm from "./components/SignupForm.jsx";
import HomePage from "./components/HomePage.jsx";
import { UserContext } from "./UserContext.js";
import { BudgetContext } from "./BudgetContext.js";
import { ExpenseContext } from "./ExpenseContext.js";
import { AccountsContext } from "./AccountsContext.js";

function App() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [contextExpenses, setContextExpenses] = useState([]);
  const [contextBudgets, setContextBudgets] = useState([]);
  const [contextAccounts, setContextAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = window.localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.Authorization = token;
        try {
          const response = await axios.get(
            "http://localhost:3000/auth/profile"
          );
          setCurrentProfile(response.data.user);
        } catch (error) {
          navigate("/");
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };
  return (
    <UserContext.Provider value={{ currentProfile, setCurrentProfile }}>
      <BudgetContext.Provider value={{ contextBudgets, setContextBudgets }}>
        <ExpenseContext.Provider
          value={{ contextExpenses, setContextExpenses }}
        >
          <AccountsContext.Provider
            value={{ contextAccounts, setContextAccounts }}
          >
            <header className="header">
              <h1>Welcome, {currentProfile}</h1>
              {currentProfile && (
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </header>
            <Routes>
              {currentProfile ? (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<LoginForm />} />
                  <Route path="/signup" element={<SignupForm />} />
                </>
              )}
            </Routes>
            <footer className="footer">
              <p>&copy; Budget App Created by Ahemed Summer 2024</p>
            </footer>
          </AccountsContext.Provider>
        </ExpenseContext.Provider>
      </BudgetContext.Provider>
    </UserContext.Provider>
  );
}
export default App;
