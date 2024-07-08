import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import "./Styles/BudgetPage.css";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [detailsId, setDetailsId] = useState(null);
  const { currentProfile } = useContext(UserContext);

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

  const handleViewDetails = (id) => {
    setDetailsId(id === detailsId ? null : id);
  };

  const handleDelete = async (budgetId) => {
    console.log(budgetId);
    try {
      await axios.delete(
        `http://localhost:3000/budgets/${currentProfile}/${parseInt(budgetId)}`
      );
      setBudgets(budgets.filter((budget) => budget.id !== parseInt(budgetId)));
    } catch (error) {
      console.error("Error Deleting Cards", error);
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
              {" "}
              <button
                className="details-btn"
                onClick={() => handleViewDetails(budget.id)}
              >
                View Budget Details
              </button>
              <button onClick={() => handleDelete(budget.id)}>Delete</button>
            </div>

            {detailsId === budget.id && (
              <div>
                <p>Details: {budget.budgetDetails}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default BudgetPage;
