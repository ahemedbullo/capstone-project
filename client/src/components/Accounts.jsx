import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link";
import { AccountsContext } from "../AccountsContext.js";

const Accounts = () => {
  const { currentProfile } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const { contextAccounts, setContextAccounts } = useContext(AccountsContext);

  useEffect(() => {
    fetchLinkToken();
    fetchAccounts();
    fetchLastTransactionDate();
  }, [currentProfile]);

  const fetchLinkToken = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/accounts/create_link_token/${currentProfile}`
      );
      setLinkToken(response.data.link_token);
    } catch (error) {
      console.error("Error fetching link token:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/accounts/balances/${currentProfile}`
      );
      setAccounts(response.data.accounts);
      setContextAccounts(response.data.accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchLastTransactionDate = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/accounts/last_transaction_date/${currentProfile}`
      );
      setLastFetchDate(response.data.lastTransactionFetch);
    } catch (error) {
      console.error("Error fetching last transaction date:", error);
    }
  };
  const fetchTransactions = async () => {
    setIsFetchingTransactions(true);
    setUpdateMessage("");
    try {
      const response = await axios.post(
        `http://localhost:3000/accounts/fetch_transactions/${currentProfile}`
      );
      setUpdateMessage(
        `Created ${response.data.expensesCreated} new expenses and updated ${response.data.expensesUpdated} existing expenses from ${response.data.accountsFetched} accounts.`
      );
      fetchLastTransactionDate();
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setUpdateMessage("Error updating transactions. Please try again.");
    } finally {
      setIsFetchingTransactions(false);
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await axios.delete(
        `http://localhost:3000/accounts/delete_account/${currentProfile}/${accountId}`
      );
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        await axios.post(
          `http://localhost:3000/accounts/exchange_public_token/${currentProfile}`,
          { public_token: public_token }
        );
        fetchAccounts();
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
    onExit: (err, metadata) => {
      if (err != null) {
        console.error("Plaid Link error:", err);
      }
    },
  });

  return (
    <div className="accounts-container">
      <h1>Your Linked Accounts</h1>
      <div className="actions">
        <button
          onClick={() => open()}
          disabled={!ready || !linkToken}
          className="link-account-btn"
        >
          {accounts.length > 0
            ? "Link Another Account"
            : "Link Your First Account"}
        </button>
        <button
          onClick={fetchTransactions}
          disabled={isFetchingTransactions}
          className="fetch-transactions-btn"
        >
          {isFetchingTransactions
            ? "Updating Transactions..."
            : "Update Transactions"}
        </button>
      </div>
      {updateMessage && <p>{updateMessage}</p>}
      {lastFetchDate && (
        <p>
          Last transaction update: {new Date(lastFetchDate).toLocaleString()}
        </p>
      )}
      {accounts.length > 0 ? (
        <div className="accounts-list">
          {accounts.map((account) => (
            <div key={account.id} className="account-item">
              <h3>{account.name}</h3>
              <p className="account-balance">
                Balance: ${account.balance.toFixed(2)}
              </p>
              <p className="last-updated">
                Last Updated: {new Date(account.lastUpdated).toLocaleString()}
              </p>
              <button
                onClick={() => deleteAccount(account.accountId)}
                className="delete-account-btn"
              >
                Delete Account
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>
          You haven't linked any accounts yet. Click the button to get started
        </p>
      )}
    </div>
  );
};

export default Accounts;
