import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState({ id: "", name: "" });
  const [existingBudgets, setExistingBudgets] = useState([]);
  const { currentProfile } = useContext(UserContext);
  const [selectedBudget, setSelectedBudget] = useState("");

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

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/expenses/${currentProfile}`
        );
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, [currentProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newExpense = {
      expenseName,
      amount: parseInt(amount),
      budgetId: budget.id,
      budgetName: budget.name,
    };

    try {
      const response = await axios.post(
        `http://localhost:3000/expenses/${currentProfile}`,
        newExpense
      );
      setExpenses([...expenses, response.data]);
      setExpenseName("");
      setAmount("");
      setBudget({ id: "", name: "" });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <div>
      <h2>Add Expenses</h2>
      <form onSubmit={handleSubmit}>
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
        <select
          value={budget.id}
          onChange={(e) =>
            setBudget({
              id: parseInt(e.target.value),
              name: e.target.options[e.target.selectedIndex].text,
            })
          }
        >
          <option value="">Select a budget</option>
          {existingBudgets.map((budget) => (
            <option key={budget.id} value={budget.id}>
              {budget.budgetName}
            </option>
          ))}
        </select>
        <button type="submit">Add Expense</button>
      </form>
      <ul>
        {expenses.map((expense) => (
          <li key={`${expense.id}-${expense.amount}`}>
            Expense Name: {expense.expenseName} - Expense Amount: $
            {expense.expenseAmount} - Budget: {expense.budgetName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensePage;
