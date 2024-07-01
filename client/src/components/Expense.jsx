import React, { useContext, useState } from "react";
import { ExpenseContext } from "../ExpenseContext.js";
import { BudgetContext } from "../BudgetContext.js";

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState("");
  const { setExistingExpenses } = useContext(ExpenseContext);
  const { existingBudgets } = useContext(BudgetContext);

  const handleNameChange = (event) => {
    setExpenseName(event.target.value);
  };
  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };
  const handleBudgetChange = (event) => {
    setBudget(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newExpense = { expenseName, amount, budget };
    setExpenses([...expenses, newExpense]);
    setExistingExpenses(expenses);
    setExpenseName("");
    setAmount("");
    setBudget("");
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Expense Name</label>
            <input
              type="text"
              value={expenseName}
              onChange={handleNameChange}
              required
            />
          </div>
          <div>
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              required
            />
          </div>
          <div>
            <label>Budget</label>
            <select value={budget} onChange={handleBudgetChange}>
              <option value="">Select a budget</option>
              {existingBudgets.map((budget) => (
                <option key={budget} value={budget}>
                  {budget}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Add Expense Button</button>
        </form>
        <div>
          {expenses.map((expense) => (
            <div key={expense.id} className="expense">
              <h3>{expense.name}</h3>
              <p>Amount: ${expense.amount}</p>
              <p>Budget: {expense.budget}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Expense;
