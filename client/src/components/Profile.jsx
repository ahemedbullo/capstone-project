import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import Accounts from "./Accounts";

const Profile = () => {
  const { currentProfile } = useContext(UserContext);
  const [financialGoals, setFinancialGoals] = useState("");
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState("");
  const [annualIncomeTarget, setAnnualIncomeTarget] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [newBalance, setNewBalance] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchAccounts();
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
        { accountId: selectedAccount, newBalance: newBalance }
      );
      alert("Balance updated successfully!");
      fetchAccounts();
      setSelectedAccount("");
      setNewBalance("");
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("Failed to update balance. Please try again.");
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
      <h2>Manual Balance Update</h2>
      <form onSubmit={handleManualBalanceUpdate}>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          required
        >
          <option value="">Select an account</option>
          {accounts.map((account) => (
            <option key={account.accountId} value={account.accountId}>
              {account.name} (Current balance: ${account.balance.toFixed(2)})
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          placeholder="Enter new balance"
          required
        />
        <button type="submit">Update Balance</button>
      </form>
      <h2>Linked Accounts</h2>
      <Accounts />
    </div>
  );
};

export default Profile;
