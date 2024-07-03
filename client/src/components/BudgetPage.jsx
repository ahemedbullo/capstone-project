import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext.js";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [category, setCategory] = useState("");
  const { currentProfile } = useContext(UserContext);

  useEffect(() => {
    if (currentProfile) {
      const fetchBudgets = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/budgets/${currentProfile.id}`);
          setBudgets(response.data);
        } catch (error) {
          console.error("Failed to fetch budgets", error.response ? error.response.data : error.message);
        }
      };

      fetchBudgets();
    }
  }, [currentProfile]);

  const addBudget = async () => {
    try {
      const response = await axios.post("http://localhost:3000/budgets", {
        name: budgetName,
        category,
        userId: currentProfile.id,
      });
      setBudgets([...budgets, response.data]);
      setBudgetName("");
      setCategory("");
    } catch (error) {
      console.error("Failed to add budget", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h2>Budgets</h2>
      <input
        type="text"
        placeholder="Budget Name"
        value={budgetName}
        onChange={(e) => setBudgetName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={addBudget}>Add Budget</button>
      <ul>
        {budgets.map((budget) => (
          <li key={budget.id}>{budget.name} - {budget.category}</li>
        ))}
      </ul>
    </div>
  );
};

export default BudgetPage;
