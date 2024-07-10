import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState({ id: "", name: "" });
  const [budgetsWithAmountLeft, setBudgetsWithAmountLeft] = useState([]);
  const { currentProfile } = useContext(UserContext);

  useEffect(() => {
    const fetchBudgetsAndExpenses = async () => {
      try {
        const [budgetsResponse, expensesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/budgets/${currentProfile}`),
          axios.get(`http://localhost:3000/expenses/${currentProfile}`),
        ]);

        const budgetsData = budgetsResponse.data;
        const expensesData = expensesResponse.data;

        setExpenses(expensesData);

        const updatedBudgets = budgetsData.map((budget) => {
          const budgetExpenses = expensesData.filter(
            (expense) => expense.budgetId === budget.id
          );
          const totalExpenses = budgetExpenses.reduce(
            (sum, expense) => sum + expense.expenseAmount,
            0
          );
          const amountLeft = budget.budgetAmount - totalExpenses;
          return { ...budget, amountLeft };
        });

        setBudgetsWithAmountLeft(updatedBudgets);
      } catch (error) {
        console.error("Error fetching budgets and expenses:", error);
      }
    };
    fetchBudgetsAndExpenses();
  }, [currentProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newExpense = {
      expenseName,
      amount: parseFloat(amount),
      budgetId: budget.id,
      budgetName: budget.name,
    };

    try {
      const response = await axios.post(
        `http://localhost:3000/expenses/${currentProfile}`,
        newExpense
      );
      setExpenses([...expenses, response.data]);

      // Update the amountLeft for the affected budget
      setBudgetsWithAmountLeft((prevBudgets) =>
        prevBudgets.map((b) =>
          b.id === budget.id
            ? { ...b, amountLeft: b.amountLeft - parseFloat(amount) }
            : b
        )
      );

      setExpenseName("");
      setAmount("");
      setBudget({ id: "", name: "" });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await axios.delete(
        `http://localhost:3000/expenses/${currentProfile}/${parseInt(
          expenseId
        )}`
      );
      const deletedExpense = expenses.find(
        (expense) => expense.id === parseInt(expenseId)
      );
      setExpenses(
        expenses.filter((expense) => expense.id !== parseInt(expenseId))
      );

      // Update the amountLeft for the affected budget
      setBudgetsWithAmountLeft((prevBudgets) =>
        prevBudgets.map((b) =>
          b.id === deletedExpense.budgetId
            ? { ...b, amountLeft: b.amountLeft + deletedExpense.expenseAmount }
            : b
        )
      );
    } catch (error) {
      console.error("Error Deleting expense", error);
    }
  };

  const handleUpdateExpenseBudget = async (
    expenseId,
    newBudgetId,
    newBudgetName
  ) => {
    try {
      const expenseToUpdate = expenses.find((e) => e.id === expenseId);
      const updatedExpense = {
        ...expenseToUpdate,
        budgetId: newBudgetId,
        budgetName: newBudgetName,
      };

      const response = await axios.put(
        `http://localhost:3000/expenses/${currentProfile}/${expenseId}`,
        updatedExpense
      );

      setExpenses(
        expenses.map((e) => (e.id === expenseId ? response.data : e))
      );

      // Update amountLeft for both old and new budgets
      setBudgetsWithAmountLeft((prevBudgets) =>
        prevBudgets.map((b) => {
          if (b.id === expenseToUpdate.budgetId) {
            return {
              ...b,
              amountLeft: b.amountLeft + expenseToUpdate.expenseAmount,
            };
          } else if (b.id === newBudgetId) {
            return {
              ...b,
              amountLeft: b.amountLeft - expenseToUpdate.expenseAmount,
            };
          }
          return b;
        })
      );
    } catch (error) {
      console.error("Error updating expense budget:", error);
    }
  };

  return (
    <div>
      <h2>Add Expenses</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Expense Name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          value={budget.id}
          onChange={(e) =>
            setBudget({
              id: parseInt(e.target.value),
              name: e.target.options[e.target.selectedIndex].text.split(
                " ("
              )[0],
            })
          }
          required
        >
          <option value="">Select a budget</option>
          {budgetsWithAmountLeft.map((budget) => (
            <option key={budget.id} value={budget.id}>
              {budget.budgetName} (Amount Left: ${budget.amountLeft.toFixed(2)})
            </option>
          ))}
        </select>
        <button type="submit">Add Expense</button>
      </form>
      <ul>
        {expenses.map((expense) => (
          <li key={`${expense.id}-${expense.expenseAmount}`}>
            Expense Name: {expense.expenseName} - Expense Amount: $
            {expense.expenseAmount} - Budget:
            <select
              value={expense.budgetId}
              onChange={(e) =>
                handleUpdateExpenseBudget(
                  expense.id,
                  parseInt(e.target.value),
                  e.target.options[e.target.selectedIndex].text.split(" (")[0]
                )
              }
            >
              {budgetsWithAmountLeft.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.budgetName} (Amount Left: $
                  {budget.amountLeft.toFixed(2)})
                </option>
              ))}
            </select>
            <button onClick={() => handleDelete(expense.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensePage;
