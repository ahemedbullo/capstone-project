import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext.js";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState("");
  const { currentProfile } = useContext(UserContext);

  const addExpense = async () => {
    try {
      const response = await axios.post("http://localhost:3000/expenses", {
        name: expenseName,
        amount,
        budget,
        userId: currentProfile.id,
      });
      setExpenses([...expenses, response.data]);
      setExpenseName("");
      setAmount("");
      setBudget("");
    } catch (error) {
      console.error("Failed to add expense", error);
    }
  };

  return (
    <div>
      <h2>Expenses</h2>
      <input
        type="text"
        placeholder="Expense Name"
        value={expenseName}
        onChange={(e) => setExpenseName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Budget"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
      <button onClick={addExpense}>Add Expense</button>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>{expense.name} - {expense.amount} - {expense.budget}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensePage;
