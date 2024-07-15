import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link";

const Accounts = () => {
  const { currentProfile } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLinkToken();
    fetchAccounts();
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
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const updateBalances = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/accounts/update_balances/${currentProfile}`
      );
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error("Error updating balances:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await axios.delete(
        `http://localhost:3000/accounts/delete_account/${currentProfile}/${accountId}`
      );
      fetchAccounts(); // Refresh the account list after deletion
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
        {accounts.length > 0 && (
          <button
            onClick={updateBalances}
            disabled={isUpdating}
            className="update-balances-btn"
          >
            {isUpdating ? "Updating..." : "Update Balances"}
          </button>
        )}
      </div>
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
