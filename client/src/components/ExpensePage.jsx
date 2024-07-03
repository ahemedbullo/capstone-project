import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState(""); // select a budget from the list
  const [existingBudgets, setExistingBudgets] = useState([]); // list of existing budgets
  const { currentProfile } = useContext(UserContext);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/budgets/${currentProfile}`
        );
        setExistingBudgets(response.data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };
    fetchBudgets();
  }, [currentProfile]);

  const addExpense = () => {
    const newExpense = { expenseName, amount, budget };
    setExpenses([...expenses, newExpense]);
    setExpenseName("");
    setAmount("");
    setBudget("");
  };

  return (
    <div>
      <h2>Add Expenses</h2>
      <input
        type="text"
        placeholder="Expense Name"
        value={expenseName}
        onChange={(e) => setExpenseName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={budget} onChange={(e) => setBudget(e.target.value)}>
        <option value="">Select a budget</option>
        {existingBudgets.map((budget) => (
          <option key={budget.budgetName} value={budget.budgetName}>
            {budget.budgetName}
          </option>
        ))}
      </select>
      <button onClick={addExpense}>Add Expense</button>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.expenseName}>
            {expense.expenseName} - {expense.amount} - {expense.budget}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensePage;
