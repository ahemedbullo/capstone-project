import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import Accounts from "./Accounts";
import "./Styles/Profile.css";

const Profile = () => {
  const { currentProfile } = useContext(UserContext);
  const [financialGoals, setFinancialGoals] = useState("");
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState("");
  const [annualIncomeTarget, setAnnualIncomeTarget] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [balanceDate, setBalanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:3000/savings-goals/${currentProfile}`,
        newGoal
      );
      setNewGoal({ name: "", targetAmount: "", deadline: "" });
      fetchSavingsGoals();
    } catch (error) {
      console.error("Error adding savings goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId, updatedAmount) => {
    try {
      await axios.put(
        `http://localhost:3000/savings-goals/${currentProfile}/${goalId}`,
        {
          currentAmount: updatedAmount,
        }
      );
      fetchSavingsGoals();
    } catch (error) {
      console.error("Error updating savings goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await axios.delete(
        `http://localhost:3000/savings-goals/${currentProfile}/${goalId}`
      );
      fetchSavingsGoals();
    } catch (error) {
      console.error("Error deleting savings goal:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAccounts();
    fetchSavingsGoals();
  }, [currentProfile]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/auth/user/${currentProfile}`
      );
      const { financialGoals, monthlySavingsTarget, annualIncomeTarget } =
        response.data;
      setFinancialGoals(financialGoals || "");
      setMonthlySavingsTarget(
        monthlySavingsTarget ? monthlySavingsTarget.toString() : ""
      );
      setAnnualIncomeTarget(
        annualIncomeTarget ? annualIncomeTarget.toString() : ""
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleUserDataSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/auth/user/${currentProfile}`, {
        financialGoals,
        monthlySavingsTarget,
        annualIncomeTarget,
      });
      alert("User data updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data. Please try again.");
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/accounts/balances/${currentProfile}`
      );
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleManualBalanceUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:3000/accounts/manual-balance-update/${currentProfile}`,
        {
          accountId: selectedAccount,
          newBalance: newBalance,
          date: balanceDate,
        }
      );
      alert("Balance updated successfully!");
      fetchAccounts();
      fetchBalanceHistory(selectedAccount);
      setSelectedAccount("");
      setNewBalance("");
      setBalanceDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("Failed to update balance. Please try again.");
    }
  };
  const fetchBalanceHistory = async (accountId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/accounts/balance-history/${currentProfile}/${accountId}`
      );
      setBalanceHistory(response.data);
    } catch (error) {
      console.error("Error fetching balance history:", error);
    }
  };

  const handleManualAccountAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:3000/accounts/add-manual-account/${currentProfile}`,
        {
          accountName: newAccountName,
          accountType: newAccountType,
          initialBalance: newAccountBalance,
        }
      );
      alert("Account added successfully!");
      fetchAccounts();
      setNewAccountName("");
      setNewAccountType("");
      setNewAccountBalance("");
    } catch (error) {
      console.error("Error adding manual account:", error);
      alert("Failed to add account. Please try again.");
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/savings-goals/${currentProfile}`
      );
      setSavingsGoals(response.data);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
    }
  };

  return (
    <div className="profile-page">
      <h1>Your Financial Profile</h1>
      <form onSubmit={handleUserDataSubmit}>
        <div>
          <label htmlFor="financialGoals">Financial Goals:</label>
          <textarea
            id="financialGoals"
            value={financialGoals}
            onChange={(e) => setFinancialGoals(e.target.value)}
            placeholder="E.g., Save for a house down payment, build emergency fund"
          />
        </div>
        <div>
          <label htmlFor="monthlySavingsTarget">Monthly Savings Target:</label>
          <input
            type="number"
            id="monthlySavingsTarget"
            value={monthlySavingsTarget}
            onChange={(e) => setMonthlySavingsTarget(e.target.value)}
            placeholder="Enter target amount"
          />
        </div>
        <div>
          <label htmlFor="annualIncomeTarget">Annual Income Target:</label>
          <input
            type="number"
            id="annualIncomeTarget"
            value={annualIncomeTarget}
            onChange={(e) => setAnnualIncomeTarget(e.target.value)}
            placeholder="Enter target amount"
          />
        </div>
        <button type="submit">Update User Data</button>
      </form>
      <div className="savings-goals">
        <h2>Savings Goals</h2>
        <form onSubmit={handleAddGoal}>
          <input
            type="text"
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.targetAmount}
            onChange={(e) =>
              setNewGoal({ ...newGoal, targetAmount: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) =>
              setNewGoal({ ...newGoal, deadline: e.target.value })
            }
            required
          />
          <button type="submit">Add Goal</button>
        </form>

        <div className="savings-goals-list">
          {savingsGoals.map((goal) => (
            <div key={goal.id} className="savings-goal-item">
              <h3>{goal.name}</h3>
              <p>Target: ${goal.targetAmount}</p>
              <p>Current: ${goal.currentAmount}</p>
              <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
              <input
                type="number"
                value={goal.currentAmount}
                onChange={(e) => handleUpdateGoal(goal.id, e.target.value)}
              />
              <button onClick={() => handleDeleteGoal(goal.id)}>
                Delete Goal
              </button>
            </div>
          ))}
        </div>
      </div>

      <h2>Add Manual Account</h2>
      <form onSubmit={handleManualAccountAdd}>
        <div>
          <label htmlFor="newAccountName">Account Name:</label>
          <input
            type="text"
            id="newAccountName"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Enter account name"
            required
          />
        </div>
        <div>
          <label htmlFor="newAccountType">Account Type:</label>
          <select
            id="newAccountType"
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value)}
            required
          >
            <option value="">Select account type</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>
        <div>
          <label htmlFor="newAccountBalance">Initial Balance:</label>
          <input
            type="number"
            id="newAccountBalance"
            step="0.01"
            value={newAccountBalance}
            onChange={(e) => setNewAccountBalance(e.target.value)}
            placeholder="Enter initial balance"
            required
          />
        </div>
        <button type="submit">Add Account</button>
      </form>
      <h2>Manual Balance Update</h2>
      <form onSubmit={handleManualBalanceUpdate}>
        <div>
          <label htmlFor="accountSelect">Select Account:</label>
          <select
            id="accountSelect"
            value={selectedAccount}
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              fetchBalanceHistory(e.target.value);
            }}
            required
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account.name} (Current balance: ${account.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="newBalance">New Balance:</label>
          <input
            type="number"
            id="newBalance"
            step="0.01"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            placeholder="Enter new balance"
            required
          />
        </div>
        <div>
          <label htmlFor="balanceDate">Balance Date:</label>
          <input
            type="date"
            id="balanceDate"
            value={balanceDate}
            onChange={(e) => setBalanceDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Balance</button>
      </form>
      {balanceHistory.length > 0 && (
        <div className="balance-history">
          <h3>Balance History</h3>
          <ul>
            {balanceHistory.map((entry, index) => (
              <li key={index}>
                Date:
                {new Date(new Date(entry.date).getTime()).toLocaleDateString()},
                Balance: ${entry.balance.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="linked-accounts">
        <h2>Linked Accounts</h2> <Accounts />
      </div>
    </div>
  );
};

export default Profile;
