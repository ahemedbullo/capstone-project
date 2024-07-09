import React, { useState } from "react";
import { usePlaidLink } from "react-plaid-link";

// ...
const Accounts = () => {
  const [linkToken, setLinkToken] = useState("");

  const { open, ready } = usePlaidLink({
    token: "<GENERATED_LINK_TOKEN>",
    onSuccess: (public_token, metadata) => {
      // send public_token to server
    },
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
};

export default Accounts;
