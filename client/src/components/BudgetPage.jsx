import React, { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import "./Styles/BudgetPage.css";
import Modal from "./Modal.jsx";
import { BudgetContext } from "../BudgetContext.js";
import { ExpenseContext } from "../ExpenseContext.js";
import { AccountsContext } from "../AccountsContext.js";
import { exportToPDF, exportToExcel } from "../ExportUtil.js";
import { exportData } from "../ExportUtil.js";

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const { currentProfile } = useContext(UserContext);
  const [modalBudget, setModalBudget] = useState(null);
  const [budgetsWithExpenses, setBudgetsWithExpenses] = useState([]);
  const { contextBudgets, setContextBudgets } = useContext(BudgetContext);
  const { contextExpenses } = useContext(ExpenseContext);
  const { contextAccounts } = useContext(AccountsContext); //todo use this to get total balance
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportType, setExportType] = useState("basic");
  const [selectedBudgets, setSelectedBudgets] = useState({});
  const exportContainerRef = useRef(null);

  useEffect(() => {
    fetchBudgetsWithExpenses();
  }, [currentProfile, contextExpenses]);

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
      updatedBudgets.sort((a, b) => b.id - a.id);
      setBudgetsWithExpenses(updatedBudgets);
      setBudgets(updatedBudgets);
      setContextBudgets(updatedBudgets);
    } catch (error) {
      console.error("Error fetching budgets and expenses:", error);
    }
  };

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

  const handleDelete = async (budgetId) => {
    try {
      await axios.delete(
        `http://localhost:3000/budgets/${currentProfile}/${parseInt(budgetId)}`
      );
      const updatedBudgets = budgetsWithExpenses.filter(
        (budget) => budget.id !== parseInt(budgetId)
      );
      setBudgetsWithExpenses(updatedBudgets);
      setBudgets(updatedBudgets);
      setContextBudgets(updatedBudgets);
    } catch (error) {
      console.error("Error Deleting Budget", error);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget({
      id: budget.id,
      budgetName: budget.budgetName,
      budgetAmount: budget.budgetAmount.toString(),
    });
  };

  const handleUpdate = async (event, budgetId) => {
    event.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3000/budgets/${currentProfile}/${budgetId}`,
        {
          budgetName: editingBudget.budgetName,
          budgetAmount: parseFloat(editingBudget.budgetAmount),
        }
      );
      const updatedBudget = response.data;
      const updatedBudgets = budgetsWithExpenses.map((budget) =>
        budget.id === updatedBudget.id
          ? {
              ...updatedBudget,
              amountLeft: updatedBudget.budgetAmount - budget.totalExpenses,
              totalExpenses: budget.totalExpenses,
            }
          : budget
      );
      setBudgetsWithExpenses(updatedBudgets);
      setBudgets(updatedBudgets);
      setContextBudgets(updatedBudgets);
      setEditingBudget(null);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  const filteredBudgets = budgetsWithExpenses.filter((budget) =>
    budget.budgetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (showExportOptions && exportContainerRef.current) {
      const rect = exportContainerRef.current.getBoundingClientRect();
      const optionsElement =
        exportContainerRef.current.querySelector(".export-options");
      if (optionsElement) {
        if (rect.top < optionsElement.offsetHeight) {
          optionsElement.style.bottom = "auto";
          optionsElement.style.top = "100%";
        } else {
          optionsElement.style.bottom = "100%";
          optionsElement.style.top = "auto";
        }
      }
    }
  }, [showExportOptions]);
  const handleExport = (format) => {
    let dataToExport;

    if (exportType === "basic") {
      dataToExport = budgetsWithExpenses
        .filter((budget) => selectedBudgets[budget.id])
        .map((budget) => ({
          Name: budget.budgetName,
          Amount: budget.budgetAmount.toFixed(2),
          Spent: budget.totalExpenses.toFixed(2),
          Left: (budget.budgetAmount - budget.totalExpenses).toFixed(2),
        }));
    } else {
      dataToExport = budgetsWithExpenses
        .filter((budget) => selectedBudgets[budget.id])
        .map((budget) => ({
          Name: budget.budgetName,
          Amount: budget.budgetAmount.toFixed(2),
          Spent: budget.totalExpenses.toFixed(2),
          Left: (budget.budgetAmount - budget.totalExpenses).toFixed(2),
          Expenses: budget.expenses.map((expense) => ({
            Name: expense.expenseName,
            Amount: expense.expenseAmount.toFixed(2),
            Date: new Date(expense.purchaseDate).toLocaleDateString(),
          })),
        }));
    }
    if (dataToExport.length === 0) {
      alert("Please select at least one budget to export.");
      return;
    }

    exportData(dataToExport, "budgets", "Budget Report", format, exportType);

    setShowExportOptions(false);
  };

  const toggleBudgetSelection = (budgetId) => {
    setSelectedBudgets((prev) => ({ ...prev, [budgetId]: !prev[budgetId] }));
  };
  const selectAllBudgets = () => {
    const allSelected = budgetsWithExpenses.reduce((acc, budget) => {
      acc[budget.id] = true;
      return acc;
    }, {});
    setSelectedBudgets(allSelected);
  };
  const deselectAllBudgets = () => {
    setSelectedBudgets({});
  };

  return (
    <>
      <div className="budget-page">
        <div className="export-container" ref={exportContainerRef}>
          <button onClick={() => setShowExportOptions(!showExportOptions)}>
            Export
          </button>
          {showExportOptions && (
            <div className="export-options">
              <div>
                <label>
                  <input
                    type="radio"
                    value="basic"
                    checked={exportType === "basic"}
                    onChange={() => setExportType("basic")}
                  />
                  Basic
                </label>
                <label>
                  <input
                    type="radio"
                    value="detailed"
                    checked={exportType === "detailed"}
                    onChange={() => setExportType("detailed")}
                  />
                  Detailed
                </label>
              </div>
              <div>
                <button onClick={selectAllBudgets}>Select All</button>
                <button onClick={deselectAllBudgets}>Deselect All</button>
              </div>
              <div className="budget-selection">
                {budgetsWithExpenses.map((budget) => (
                  <label key={budget.id}>
                    <input
                      type="checkbox"
                      checked={!!selectedBudgets[budget.id]}
                      onChange={() => toggleBudgetSelection(budget.id)}
                    />
                    {budget.budgetName}
                  </label>
                ))}
              </div>
              <button onClick={() => handleExport("pdf")}>Export as PDF</button>
              <button onClick={() => handleExport("excel")}>
                Export as Excel
              </button>
            </div>
          )}
        </div>
        <div className="budget-form">
          <h3>Create a New Budget</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Budget Name"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Budget Amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
            <button type="submit">Create Budget</button>
          </form>
        </div>
        <div className="budget-search">
          <input
            type="text"
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="budget-list">
          {filteredBudgets.map((budget) => (
            <div key={budget.id} className="budget-item">
              {editingBudget && editingBudget.id === budget.id ? (
                <form
                  onSubmit={(e) => handleUpdate(e, budget.id)}
                  className="inline-edit-form"
                >
                  <input
                    type="text"
                    value={editingBudget.budgetName}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        budgetName: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="number"
                    value={editingBudget.budgetAmount}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        budgetAmount: e.target.value,
                      })
                    }
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingBudget(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h4>{budget.budgetName}</h4>
                  <div className="budget-details">
                    <p>Total: ${budget.budgetAmount}</p>
                    <p>Spent: ${budget.totalExpenses.toFixed(2)}</p>
                    <p>Left: ${budget.amountLeft.toFixed(2)}</p>
                  </div>
                  <div className="budget-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          (budget.totalExpenses / budget.budgetAmount) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="budget-actions">
                    <button onClick={() => setModalBudget(budget)}>
                      Details
                    </button>
                    <button onClick={() => handleEdit(budget)}>Edit</button>
                    <button onClick={() => handleDelete(budget.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {modalBudget && (
          <Modal
            budget={modalBudget}
            onClose={() => setModalBudget(null)}
            currentProfile={currentProfile}
          />
        )}
      </div>
    </>
  );
};

export default BudgetPage;
