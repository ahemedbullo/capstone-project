import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import "./Styles/BudgetPage.css";
import Modal from "./Modal.jsx";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const { currentProfile } = useContext(UserContext);
  const [modalBudget, setModalBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBudgetNameChange = (event) => {
    setBudgetName(event.target.value);
  };

  const handleBudgetAmountChange = (event) => {
    setBudgetAmount(event.target.value);
  };

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/budgets/${currentProfile}`
        );
        setBudgets(response.data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };
    fetchBudgets();
  }, [currentProfile]);
  console.log(budgets);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newBudget = { budgetName, budgetAmount };

    try {
      const response = await axios.post(
        `http://localhost:3000/budgets/${currentProfile}`,
        newBudget
      );
      setBudgets([...budgets, response.data]);
      setBudgetName("");
      setBudgetAmount("");
    } catch (error) {
      console.error("Error adding budget:", error);
    }
  };

  const handleViewDetails = (budget) => {
    setIsModalOpen(true);
    setModalBudget(budget);
  };

  const handleDelete = async (budgetId) => {
    try {
      await axios.delete(
        `http://localhost:3000/budgets/${currentProfile}/${parseInt(budgetId)}`
      );
      setBudgets(budgets.filter((budget) => budget.id !== parseInt(budgetId)));
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
            <label>Budget Name</label>
            <input
              type="text"
              value={budgetName}
              onChange={handleBudgetNameChange}
              required
            />
          </div>
          <div>
            <label>Amount</label>
            <input
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
        {budgets.map((budget) => (
          <div key={budget.id} className="budget">
            <h3>{budget.budgetName}</h3>
            <p>Amount: ${budget.budgetAmount}</p>
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
            // You might need to lift this state up or use a global state management solution
          }}
        />
      )}
    </>
  );
};

export default BudgetPage;
