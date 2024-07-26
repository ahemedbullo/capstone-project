import React, { useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext.js";
import { BudgetContext } from "../BudgetContext.js";
import { ExpenseContext } from "../ExpenseContext.js";
import { AccountsContext } from "../AccountsContext.js";

const DataFetcher = () => {
  const { currentProfile } = useContext(UserContext);
  const { setContextBudgets } = useContext(BudgetContext);
  const { setContextExpenses } = useContext(ExpenseContext);
  const { setContextAccounts } = useContext(AccountsContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsResponse, expensesResponse, accountsResponse] =
          await Promise.all([
            axios.get(`http://localhost:3000/budgets/${currentProfile}`),
            axios.get(`http://localhost:3000/expenses/${currentProfile}`),
            axios.get(
              `http://localhost:3000/accounts/balances/${currentProfile}`
            ),
          ]);

        setContextBudgets(budgetsResponse.data);
        setContextExpenses(expensesResponse.data);
        setContextAccounts(accountsResponse.data.accounts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentProfile]);

  return null; // This component doesn't render anything
};

export default DataFetcher;
