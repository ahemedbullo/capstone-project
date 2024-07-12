import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext.js";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link";

const Accounts = () => {
  const { currentProfile } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    fetchLinkToken();
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

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        console.log("Public token recieved: ", public_token);
        const response = await axios.post(
          `http://localhost:3000/accounts/exchange_public_token/${currentProfile}`,
          { public_token }
        );
        console.log("Plaid account linked successfully:", response.data);
        // You can add logic here to update the UI or fetch updated budget information
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
  });

  return (
    <div className="plaid-link">
      <button onClick={() => open()} disabled={!ready || !linkToken}>
        Connect Bank Account
      </button>
    </div>
  );
};

export default Accounts;
