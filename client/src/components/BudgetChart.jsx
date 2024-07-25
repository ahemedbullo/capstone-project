import React, { useContext, useEffect, useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { BudgetContext } from "../BudgetContext";
import { ExpenseContext } from "../ExpenseContext";
import { AccountsContext } from "../AccountsContext";
import { UserContext } from "../UserContext";
import Modal from "./Modal";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetChart = () => {
  const { contextBudgets } = useContext(BudgetContext);
  const { contextExpenses } = useContext(ExpenseContext);
  const { contextAccounts } = useContext(AccountsContext);
  const [chartData, setChartData] = useState(null);
  const { currentProfile } = useContext(UserContext);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const totalBalance = useMemo(() => {
    return contextAccounts.reduce((sum, account) => sum + account.balance, 0);
  }, [contextAccounts]);

  const generateRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  const randomColors = useMemo(() => {
    return [...Array(contextBudgets.length + 1)].map(() =>
      generateRandomColor()
    );
  }, [contextBudgets.length]);

  useEffect(() => {
    prepareChartData();
  }, [contextBudgets, contextExpenses, totalBalance, randomColors]);

  const prepareChartData = () => {
    if (!contextBudgets) {
      console.log("No budgets available");
      return;
    }

    const labels = [
      ...contextBudgets.map((budget) => budget.budgetName),
      "Unbudgeted",
    ];
    const data = new Array(contextBudgets.length + 1).fill(0);

    contextBudgets.forEach((budget, index) => {
      data[index] = budget.budgetAmount;
    });

    const totalBudgeted = data.reduce((sum, amount) => sum + amount, 0);

    const unbudgetedAmount = Math.max(0, totalBalance - totalBudgeted);
    data[data.length - 1] = unbudgetedAmount;

    setChartData({
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: randomColors,
          hoverBackgroundColor: randomColors,
        },
      ],
    });
  };

  if (!chartData) {
    return <div>No data available to display chart.</div>;
  }

  const totalBudgeted = contextBudgets.reduce(
    (sum, budget) => sum + budget.budgetAmount,
    0
  );
  const totalExpenses = contextExpenses.reduce(
    (sum, expense) => sum + expense.expenseAmount,
    0
  );
  const unbudgetedBalance = Math.max(0, totalBalance - totalBudgeted);

  return (
    <div className="chart-container">
      <h2>Budget Allocation Overview</h2>
      <div className="chart-flex-container">
        <div className="chart-wrapper">
          <Pie
            data={chartData}
            options={{
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  if (index < contextBudgets.length) {
                    const clickedBudget = contextBudgets[index];
                    setSelectedBudget(clickedBudget);
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                    },
                  },
                },
                legend: {
                  position: "right",
                  labels: {
                    boxWidth: 15,
                    padding: 15,
                  },
                },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="chart-summary">
          <h3>Financial Summary</h3>
          <p>
            Total Balance: <strong>${totalBalance.toFixed(2)}</strong>
          </p>
          <p>
            Total Budgeted: <strong>${totalBudgeted.toFixed(2)}</strong>
          </p>
          <p>
            Total Expenses: <strong>${totalExpenses.toFixed(2)}</strong>
          </p>
          <p>
            Unbudgeted Balance: <strong>${unbudgetedBalance.toFixed(2)}</strong>
          </p>
        </div>
      </div>
      {selectedBudget && (
        <Modal
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
          currentProfile={currentProfile}
        />
      )}
    </div>
  );
};

export default BudgetChart;
