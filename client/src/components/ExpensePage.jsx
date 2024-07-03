import React, { useState } from "react";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState(""); // select a budget from the list
  const [budgets, setBudgets] = useState([]); // list of existing budgets

  const addExpense = () => {
    const newExpense = { expenseName, amount, budget };
    setExpenses([...expenses, newExpense]);
    setExpenseName("");
    setAmount("");
    setBudget("");
  };

  const addBudget = () => {
    const newBudget = { budgetName: budget, expenses: [] };
    setBudgets([...budgets, newBudget]);
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
        {budgets.map((budget) => (
          <option key={budget.budgetName} value={budget.budgetName}>
            {budget.budgetName}
          </option>
        ))}
      </select>
      <button onClick={addExpense}>Add Expense</button>
      <button onClick={addBudget}>Add Budget</button>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.expenseName}>
            {expense.expenseName} - {expense.amount} - {expense.budget}
          </li>
        ))}
      </ul>
      {budgets.map((budget) => (
        <div key={budget.budgetName}>
          <h3>{budget.budgetName}</h3>
          <ul>
            {expenses
              .filter((expense) => expense.budget === budget.budgetName)
              .map((expense) => (
                <li key={expense.expenseName}>
                  {expense.expenseName} - {expense.amount}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ExpensePage;
