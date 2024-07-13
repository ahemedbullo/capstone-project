import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link";

const Accounts = () => {
  const { currentProfile } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);

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

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const response = await axios.post(
          `http://localhost:3000/accounts/exchange_public_token/${currentProfile}`,
          { public_token: public_token }
        );
        console.log("Plaid account linked successfully:", response.data);
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
