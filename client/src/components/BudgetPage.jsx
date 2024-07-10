import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import "./Styles/BudgetPage.css";
import Modal from "./Modal.jsx";
import { BudgetContext } from "../BudgetContext.js";
import { ExpenseContext } from "../ExpenseContext.js";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const { currentProfile } = useContext(UserContext);
  const [modalBudget, setModalBudget] = useState(null);
  const [budgetsWithExpenses, setBudgetsWithExpenses] = useState([]);

  const { contextBudgets, setContextBudgets } = useContext(BudgetContext);

  const { contextExpenses } = useContext(ExpenseContext);

  const handleBudgetNameChange = (event) => {
    setBudgetName(event.target.value);
  };

  const handleBudgetAmountChange = (event) => {
    setBudgetAmount(event.target.value);
  };

  useEffect(() => {
    const fetchBudgetsWithExpenses = async () => {
      try {
        const budgetsResponse = await axios.get(
          `http://localhost:3000/budgets/${currentProfile}`
        );
        const expensesResponse = await axios.get(
          `http://localhost:3000/expenses/${currentProfile}`
        );

        const budgetsData = budgetsResponse.data;
        const expensesData = expensesResponse.data;

        const updatedBudgets = budgetsData.map((budget) => {
          const budgetExpenses = expensesData.filter(
            (expense) => expense.budgetId === budget.id
          );
          const totalExpenses = budgetExpenses.reduce(
            (sum, expense) => sum + expense.expenseAmount,
            0
          );
          const amountLeft = budget.budgetAmount - totalExpenses;
          return { ...budget, amountLeft, totalExpenses };
        });

        setBudgetsWithExpenses(updatedBudgets);
        setBudgets(updatedBudgets);
      } catch (error) {
        console.error("Error fetching budgets and expenses:", error);
      }
    };
    fetchBudgetsWithExpenses();
  }, [currentProfile, contextExpenses]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newBudget = { budgetName, budgetAmount: parseFloat(budgetAmount) };

    try {
      const response = await axios.post(
        `http://localhost:3000/budgets/${currentProfile}`,
        newBudget
      );
      const createdBudget = {
        ...response.data,
        amountLeft: response.data.budgetAmount,
        totalExpenses: 0,
      };
      setBudgetsWithExpenses([...budgetsWithExpenses, createdBudget]);
      setBudgets([...budgets, createdBudget]);
      setContextBudgets([...budgets, createdBudget]);
      setBudgetName("");
      setBudgetAmount("");
    } catch (error) {
      console.error("Error adding budget:", error);
    }
  };

  const handleViewDetails = (budget) => {
    setModalBudget(budget);
  };

  const handleDelete = async (budgetId) => {
    try {
      await axios.delete(
        `http://localhost:3000/budgets/${currentProfile}/${parseInt(budgetId)}`
      );
      setBudgetsWithExpenses(
        budgetsWithExpenses.filter((budget) => budget.id !== parseInt(budgetId))
      );
      setBudgets(budgets.filter((budget) => budget.id !== parseInt(budgetId)));
      setContextBudgets(
        budgets.filter((budget) => budget.id !== parseInt(budgetId))
      );
    } catch (error) {
      console.error("Error Deleting Budget", error);
    }
  };

  return (
    <>
      <div className="create-budget-box">
        <h2>Create a New Budget</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Budget Name:</label>
            <input
              placeholder="Grocery, Night Out, Vacation, eg..."
              type="text"
              value={budgetName}
              onChange={handleBudgetNameChange}
              required
            />
          </div>
          <div>
            <label>Amount:</label>
            <input
              placeholder="$"
              type="number"
              value={budgetAmount}
              onChange={handleBudgetAmountChange}
              required
            />
          </div>
          <button type="submit">Create New Budget</button>
        </form>
      </div>
      <div className="budgets-container">
        {budgetsWithExpenses.map((budget) => (
          <div key={budget.id} className="budget">
            <h3>{budget.budgetName}</h3>
            <p>Total Budget: ${budget.budgetAmount}</p>
            <p>Total Expenses: ${budget.totalExpenses.toFixed(2)}</p>
            <p>Amount Left: ${budget.amountLeft.toFixed(2)}</p>
            <div className="buttons">
              <button
                className="details-btn"
                onClick={() => handleViewDetails(budget)}
              >
                View Budget Details
              </button>
              <button onClick={() => handleDelete(budget.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modalBudget && (
        <Modal
          budget={modalBudget}
          onClose={() => setModalBudget(null)}
          currentProfile={currentProfile}
          updateExpenses={(newExpense) => {
            // Update the expenses in ExpensePage
            // might need to lift this state up or use a global state management solution
          }}
        />
      )}
    </>
  );
};

export default BudgetPage;
