const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();
const prisma = new PrismaClient();

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);
app.post("/create_link_token/:currentProfile", async (req, res) => {
  // Get the client_user_id by searching for the current user
  const { currentProfile } = req.params;
  const request = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: currentProfile,
    },
    client_name: "Plaid Test App",
    products: ["auth"],
    language: "en",
    // redirect_uri: "http://localhost:5173/",
    country_codes: ["US"],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(request);
    res.json(createTokenResponse.data);
  } catch (error) {
    // handle error
    console.error("Error creating Link Token: ", error);
    res.status(500).json({ error: "Failed to create link Token" });
  }
});

app.post("/exchange_public_token/:currentProfile", async function (req, res) {
  const { currentProfile } = req.params;
  const { public_token } = req.body;

  try {
    const response = await client.itemPublicTokenExchange({
      public_token: public_token,
    });
    console.log(response);
    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;

    await prisma.user.update({
      where: { username: currentProfile },
      data: {
        plaidAccessToken: accessToken,
        plaidItem: itemID,
      },
    });

    const balanceResponse = await client.accountsBalanceGet({
      access_token: accessToken,
    });

    res.json({ success: true, accounts });

    res.json({ public_token_exchange: "complete" });
  } catch (error) {
    // handle error
    console.error("Error exchanging public token: ", error);
    res.status(500).json({ error: "Failed to exchange public token" });
  }
});

module.exports = app;
