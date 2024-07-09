import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Styles/Modal.css";

const Modal = ({ budget, onClose, currentProfile, updateExpenses }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ expenseName: "", amount: "" });

  useEffect(() => {
    fetchBudgetExpenses();
  }, []);

  const fetchBudgetExpenses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/expenses/${currentProfile}/${budget.id}`
      );
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching budget expenses:", error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/expenses/${currentProfile}`,
        {
          ...newExpense,
          budgetId: budget.id,
          budgetName: budget.budgetName,
        }
      );
      setExpenses([...expenses, response.data]);
      updateExpenses(response.data);
      setNewExpense({ expenseName: "", amount: "" });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>X</button>
        <h2>{budget.budgetName} Details</h2>
        <h3>Expenses:</h3>
        <ul>
          {expenses.map((expense) => (
            <li key={expense.id}>
              {expense.expenseName}: ${expense.expenseAmount}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddExpense}>
          <input
            type="text"
            placeholder="Expense Name"
            value={newExpense.expenseName}
            onChange={(e) =>
              setNewExpense({ ...newExpense, expenseName: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            required
          />
          <button type="submit">Add Expense</button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
