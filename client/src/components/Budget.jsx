import React, { useState } from "react";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

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

  return (
    <>
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
      <div>
        {budgets.map((budget) => (
          <div key={budget.id} className="budget">
            <h3>{budget.budgetName}</h3>
            <p>Amount: ${budget.budgetAmount}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Budget;
