import React, { useState, useContext } from "react";
import { BudgetContext } from "../BudgetContext";
import './Styles/Budget.css'

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [showDetails, setShowDetails] = useState(false); // new state to toggle details view

  const handleBudgetNameChange = (event) => {
    setBudgetName(event.target.value);
  };
  const handlebudgetAmountChange = (event) => {
    setBudgetAmount(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const newBudget = { budgetName, budgetAmount };
    setBudgets([...budgets, newBudget]);
    setBudgetName("");
    setBudgetAmount("");
  };

  const handleViewDetails = (index) => {
    setShowDetails(true);
    // you can also store the current budget index in a state variable
    // to access the corresponding budget details
  };

  return (
    <>
      <div className="create-budget-box">
        <h2>Create a new budget</h2>
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
              onChange={handlebudgetAmountChange}
              required
            />
          </div>
          <button type="submit">Create New Budget</button>
        </form>
      </div>
      <div className="budgets-container">
        {budgets.map((budget, index) => (
          <div key={budget} className="budget">
            <h3>{budget.budgetName}</h3>
            <p>Amount: ${budget.budgetAmount}</p>
            <button onClick={() => handleViewDetails(index)}>View Budget Details</button>
            {showDetails && (
              <div>
                {/* render budget details here */}
                <p>Details: {budget.budgetDetails}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Budget;
