import React, { useState, useEffect, useContext } from "react";
import "./Styles/HomePage.css";
import BudgetChart from "./BudgetChart.jsx";
import BalanceChart from "./BalanceChart.jsx";
import DataFetcher from "./DataFetcher.jsx";
import { UserContext } from "../UserContext.js";
import { BudgetContext } from "../BudgetContext.js";
import { ExpenseContext } from "../ExpenseContext.js";
import axios from "axios";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentProfile } = useContext(UserContext);
  const { contextBudgets, setContextBudgets } = useContext(BudgetContext);
  const { setContextExpenses } = useContext(ExpenseContext);

  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBudget, setSelectedBudget] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/budgets/${currentProfile}`,
        {
          budgetName,
          budgetAmount: parseFloat(budgetAmount),
        }
      );
      setContextBudgets([...contextBudgets, response.data]);
      setBudgetName("");
      setBudgetAmount("");
    } catch (error) {
      console.error("Error adding budget:", error);
    }
  };

  const handleQuickExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/expenses/${currentProfile}`,
        {
          expenseName,
          amount: parseFloat(amount),
          purchaseDate: expenseDate,
          budgetId: selectedBudget ? parseInt(selectedBudget) : null,
        }
      );
      setContextExpenses((prevExpenses) => [...prevExpenses, response.data]);
      setExpenseName("");
      setAmount("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setSelectedBudget("");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <DataFetcher />
      <div className="homepage">
        <div className="quick-actions">
          <form onSubmit={handleQuickBudgetSubmit} className="quick-form">
            <h3>Quick Add Budget</h3>
            <input
              type="text"
              placeholder="Budget Name"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Budget Amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
            <button type="submit">Add Budget</button>
          </form>

          <form onSubmit={handleQuickExpenseSubmit} className="quick-form">
            <h3>Quick Add Expense</h3>
            <input
              type="text"
              placeholder="Expense Name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Expense Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
            >
              <option value="">Select Budget (Optional)</option>
              {contextBudgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.budgetName}
                </option>
              ))}
            </select>
            <button type="submit">Add Expense</button>
          </form>
        </div>

        <div className="charts-container">
          <div className="chart-wrapper">
            <BudgetChart />
          </div>
          <div className="chart-wrapper">
            <BalanceChart />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
