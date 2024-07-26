import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import "./Styles/ExpensePage.css";
import { BudgetContext } from "../BudgetContext.js";
import { ExpenseContext } from "../ExpenseContext.js";
import StatementUpload from "./StatementUpload.jsx";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpenses, setNewExpenses] = useState([
    {
      expenseId: -1,
      expenseName: "",
      amount: "",
      budgetId: "",
      budgetName: "",
      purchaseDate: new Date().toISOString().split("T")[0],
    },
  ]);
  const [budgetsWithAmountLeft, setBudgetsWithAmountLeft] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const { contextExpenses, setContextExpenses } = useContext(ExpenseContext);
  const { currentProfile } = useContext(UserContext);
  const { contextBudgets } = useContext(BudgetContext);
  const [sortOption, setSortOption] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filterAndSortExpenses = (expenses, option, start, end, search) => {
    return expenses
      .filter((expense) => {
        if (!start && !end && !search) return true;
        const expenseDate = new Date(expense.purchaseDate);
        const dateFilter =
          (!start || expenseDate >= new Date(start)) &&
          (!end || expenseDate <= new Date(end));
        const searchFilter =
          !search ||
          expense.expenseName.toLowerCase().includes(search.toLowerCase());
        return dateFilter && searchFilter;
      })
      .sort((a, b) => {
        switch (option) {
          case "newest":
            return new Date(b.purchaseDate) - new Date(a.purchaseDate);
          case "oldest":
            return new Date(a.purchaseDate) - new Date(b.purchaseDate);
          case "highestAmount":
            return b.expenseAmount - a.expenseAmount;
          case "lowestAmount":
            return a.expenseAmount - b.expenseAmount;
          case "name":
            return a.expenseName.localeCompare(b.expenseName);
          default:
            return 0;
        }
      });
  };
  useEffect(() => {
    const fetchBudgetsAndExpenses = async () => {
      try {
        const [budgetsResponse, expensesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/budgets/${currentProfile}`),
          axios.get(`http://localhost:3000/expenses/${currentProfile}`),
        ]);
        const budgetsData = budgetsResponse.data;
        const expensesData = expensesResponse.data;
        const filteredAndSortedExpenses = filterAndSortExpenses(
          expensesData,
          sortOption,
          startDate,
          endDate,
          searchTerm
        );
        setExpenses(filteredAndSortedExpenses);
        setContextExpenses(filteredAndSortedExpenses);
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
  }, [
    currentProfile,
    contextBudgets,
    sortOption,
    startDate,
    endDate,
    searchTerm,
  ]);

  const handleExpenseChange = (expenseId, field, value) => {
    setNewExpenses(
      newExpenses.map((expense) =>
        expense.expenseId === expenseId
          ? {
              ...expense,
              [field]: value,
              ...(field === "budgetId" && { budgetName: getBudgetName(value) }),
            }
          : expense
      )
    );
  };

  const getBudgetName = (budgetId) => {
    const selectedBudget = budgetsWithAmountLeft.find(
      (b) => b.id === parseInt(budgetId)
    );
    return selectedBudget ? selectedBudget.budgetName : "";
  };

  const addExpenseInput = () => {
    const lowestId = Math.min(...newExpenses.map((e) => e.expenseId), -1);
    setNewExpenses([
      ...newExpenses,
      {
        expenseId: lowestId - 1,
        expenseName: "",
        amount: "",
        budgetId: "",
        budgetName: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const removeExpenseInput = (expenseId) => {
    setNewExpenses(
      newExpenses.filter((expense) => expense.expenseId !== expenseId)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/expenses/${currentProfile}/bulk`,
        { expenses: newExpenses }
      );
      const updatedExpenses = filterAndSortExpenses(
        [...expenses, ...response.data],
        sortOption,
        startDate,
        endDate
      );
      setExpenses(updatedExpenses);
      setContextExpenses(updatedExpenses);

      setBudgetsWithAmountLeft((prevBudgets) =>
        prevBudgets.map((b) => {
          const totalExpenseForBudget = response.data
            .filter((e) => e.budgetId === b.id)
            .reduce((sum, e) => sum + e.expenseAmount, 0);
          return {
            ...b,
            amountLeft: b.amountLeft - totalExpenseForBudget,
          };
        })
      );

      setNewExpenses([
        {
          expenseId: -1,
          expenseName: "",
          amount: "",
          budgetId: "",
          budgetName: "",
          purchaseDate: new Date().toISOString().split("T")[0],
        },
      ]);
    } catch (error) {
      console.error("Error adding expenses:", error);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await axios.delete(
        `http://localhost:3000/expenses/${currentProfile}/${expenseId}`
      );
      const deletedExpense = expenses.find(
        (expense) => expense.id === expenseId
      );
      const updatedExpenses = filterAndSortExpenses(
        expenses.filter((expense) => expense.id !== expenseId),
        sortOption,
        startDate,
        endDate
      );
      setExpenses(updatedExpenses);
      setContextExpenses(updatedExpenses);

      if (deletedExpense.budgetId) {
        setBudgetsWithAmountLeft((prevBudgets) =>
          prevBudgets.map((b) =>
            b.id === deletedExpense.budgetId
              ? {
                  ...b,
                  amountLeft: b.amountLeft + deletedExpense.expenseAmount,
                }
              : b
          )
        );
      }
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
        budgetId: newBudgetId ? parseInt(newBudgetId) : null,
        budgetName: newBudgetName || null,
      };

      const response = await axios.put(
        `http://localhost:3000/expenses/${currentProfile}/${expenseId}`,
        updatedExpense
      );

      const updatedExpenses = filterAndSortExpenses(
        expenses.map((e) => (e.id === expenseId ? response.data : e)),
        sortOption,
        startDate,
        endDate
      );
      setExpenses(updatedExpenses);
      setContextExpenses(updatedExpenses);

      setBudgetsWithAmountLeft((prevBudgets) =>
        prevBudgets.map((b) => {
          if (b.id === expenseToUpdate.budgetId) {
            return {
              ...b,
              amountLeft: b.amountLeft + expenseToUpdate.expenseAmount,
            };
          } else if (newBudgetId && b.id === parseInt(newBudgetId)) {
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

  const startEditing = (expenseId) => {
    setEditingExpenseId(expenseId);
  };

  const handleEditChange = (field, value) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === editingExpenseId
          ? {
              ...expense,
              [field]: field === "expenseAmount" ? parseFloat(value) : value,
            }
          : expense
      )
    );
  };

  const handleEditSubmit = async () => {
    const editedExpense = expenses.find((e) => e.id === editingExpenseId);
    try {
      const response = await axios.put(
        `http://localhost:3000/expenses/${currentProfile}/${editingExpenseId}`,
        editedExpense
      );

      const updatedExpenses = filterAndSortExpenses(
        expenses.map((e) => (e.id === editingExpenseId ? response.data : e)),
        sortOption,
        startDate,
        endDate
      );
      setExpenses(updatedExpenses);
      setContextExpenses(updatedExpenses);

      setBudgetsWithAmountLeft((prevBudgets) =>
        prevBudgets.map((b) => {
          if (b.id === editedExpense.budgetId) {
            return {
              ...b,
              amountLeft: b.amountLeft - editedExpense.expenseAmount,
            };
          }
          return b;
        })
      );

      setEditingExpenseId(null);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  return (
    <>
      <StatementUpload />
      <div className="create-expense-box">
        <h2>Add Expenses</h2>
        <form onSubmit={handleSubmit}>
          {newExpenses.map((expense) => (
            <div key={expense.expenseId}>
              <input
                type="text"
                placeholder="Expense Name"
                value={expense.expenseName}
                onChange={(e) =>
                  handleExpenseChange(
                    expense.expenseId,
                    "expenseName",
                    e.target.value
                  )
                }
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={expense.amount}
                onChange={(e) =>
                  handleExpenseChange(
                    expense.expenseId,
                    "amount",
                    e.target.value
                  )
                }
                required
              />
              <input
                type="date"
                value={expense.purchaseDate}
                onChange={(e) =>
                  handleExpenseChange(
                    expense.expenseId,
                    "purchaseDate",
                    e.target.value
                  )
                }
                required
              />
              <select
                value={expense.budgetId}
                onChange={(e) =>
                  handleExpenseChange(
                    expense.expenseId,
                    "budgetId",
                    e.target.value
                  )
                }
              >
                <option value="">No Budget</option>
                {budgetsWithAmountLeft.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.budgetName} (Amount Left: $
                    {budget.amountLeft.toFixed(2)})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeExpenseInput(expense.expenseId)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addExpenseInput}>
            Add Another Expense
          </button>
          <button type="submit">Add Expenses</button>
        </form>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="date-range">
        <label htmlFor="start-date">Start Date: </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="end-date">End Date: </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
        >
          Clear Date Range
        </button>
      </div>
      <div className="sorting-options">
        <label htmlFor="sort-select">Sort by: </label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highestAmount">Highest Amount</option>
          <option value="lowestAmount">Lowest Amount</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="expenses-container">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense">
            {editingExpenseId === expense.id ? (
              <>
                <input
                  type="text"
                  value={expense.expenseName}
                  onChange={(e) =>
                    handleEditChange("expenseName", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={expense.expenseAmount}
                  onChange={(e) =>
                    handleEditChange("expenseAmount", e.target.value)
                  }
                />
                <input
                  type="date"
                  value={expense.purchaseDate.split("T")[0]}
                  onChange={(e) =>
                    handleEditChange("purchaseDate", e.target.value)
                  }
                />
                <select
                  value={expense.budgetId || ""}
                  onChange={(e) => handleEditChange("budgetId", e.target.value)}
                >
                  <option value="">No Budget</option>
                  {budgetsWithAmountLeft.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.budgetName} (Amount Left: $
                      {budget.amountLeft.toFixed(2)})
                    </option>
                  ))}
                </select>
                <button onClick={handleEditSubmit}>Save</button>
                <button onClick={() => setEditingExpenseId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                Expense Name: {expense.expenseName} - Expense Amount: $
                {expense.expenseAmount} - Purchase Date:
                {new Date(
                  new Date(expense.purchaseDate).getTime() + 86400000
                ).toLocaleDateString()}
                - Budget:
                {
                  <select
                    value={expense.budgetId || ""}
                    onChange={(e) =>
                      handleUpdateExpenseBudget(
                        expense.id,
                        e.target.value,
                        e.target.value
                          ? e.target.options[e.target.selectedIndex].text.split(
                              " ("
                            )[0]
                          : null
                      )
                    }
                  >
                    <option value="">No Budget</option>
                    {budgetsWithAmountLeft.map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.budgetName} (Amount Left: $
                        {budget.amountLeft.toFixed(2)})
                      </option>
                    ))}
                  </select>
                }
                <button onClick={() => startEditing(expense.id)}>Edit</button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ExpensePage;
