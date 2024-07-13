const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { connect } = require("./accounts");
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
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemID = exchangeResponse.data.item_id;

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
    const accounts = balanceResponse.data.accounts;

    for (const account of accounts) {
      await prisma.account.upsert({
        where: {
          username_accountId: {
            username: currentProfile,
            accountId: account.account_id,
          },
        },
        update: {
          name: account.name,
          type: account.type,
          balance: account.balances.current,
          lastUpdated: new Date(),
        },
        create: {
          username: currentProfile,
          accountId: account.account_id,
          name: account.name,
          type: account.type,
          balance: account.balances.current,
          user: {
            connect: { username: currentProfile },
          },
        },
      });
    }

    res.json({ success: true, accounts });
  } catch (error) {
    console.error(
      "Error exchanging public token or fetching balances: ",
      error
    );
    res
      .status(500)
      .json({ error: "Failed to exchange public token or fetch balances" });
  }
});

app.get("/balances/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  try {
    const accounts = await prisma.account.findMany({
      where: { username: currentProfile },
      orderBy: { lastUpdated: "desc" },
    });

    if (accounts.length === 0) {
      return res.status(400).json({ error: "No linked accounts found" });
    }

    res.json({ success: true, accounts });
  } catch (error) {
    console.error("Error fetching balances: ", error);
    res.status(500).json({ error: "Failed to get balances" });
  }
});

module.exports = app;
