import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const { currentProfile } = useContext(UserContext);

  const handleBudgetNameChange = (event) => {
    setBudgetName(event.target.value);
  };

  const handlebudgetAmountChange = (event) => {
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
  const handleViewDetails = (index) => {
    setShowDetails(true);
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
              onChange={handlebudgetAmountChange}
              required
            />
          </div>
          <button type="submit">Create New Budget</button>
        </form>
      </div>
      <div className="budgets-container">
        {budgets.map((budget, index) => (
          <div key={index} className="budget">
            <h3>{budget.budgetName}</h3>
            <p>Amount: ${budget.budgetAmount}</p>
            <button onClick={() => handleViewDetails(index)}>
              View Budget Details
            </button>
            {showDetails && (
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
