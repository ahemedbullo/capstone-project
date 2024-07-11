import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Styles/Modal.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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

  const prepareChartData = (budget, totalExpenses) => {
    const remainingBudget = budget.budgetAmount - totalExpenses;
    return {
      labels: ["Expenses", "Remaining Budget"],
      datasets: [
        {
          data: [totalExpenses, remainingBudget],
          backgroundColor: ["#FF1D1D", "#36A2EB"],
          hoverBackgroundColor: ["#FF1D1D", "#36A2EB"],
        },
      ],
    };
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.expenseAmount),
    0
  );

  const handleOverlayClick = (event) => {
    if (event.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2>{budget.budgetName} Details</h2>

        <div className="chart-container">
          <Pie data={prepareChartData(budget, totalExpenses)} />
        </div>

        <div className="budget-summary">
          <p>Total Budget: ${budget.budgetAmount}</p>
          <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
          <p>
            Remaining Budget: $
            {(budget.budgetAmount - totalExpenses).toFixed(2)}
          </p>
        </div>

        <h3>Expenses:</h3>
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id}>
              {expense.expenseName}: $
              {parseFloat(expense.expenseAmount).toFixed(2)}
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddExpense} className="add-expense-form">
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
