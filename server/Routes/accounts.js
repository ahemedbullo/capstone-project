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
  const { currentProfile } = req.params;
  const request = {
    user: {
      client_user_id: currentProfile,
    },
    client_name: "Plaid Test App",
    products: ["auth", "transactions"],
    language: "en",
    country_codes: ["US"],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(request);
    res.json(createTokenResponse.data);
  } catch (error) {
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

app.post("/fetch_transactions/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { username: currentProfile },
      select: { plaidAccessToken: true, lastTransactionFetch: true },
    });

    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ error: "No linked accounts found" });
    }

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const transactionsResponse = await client.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: startDate.toISOString().split("T")[0],
      end_date: now.toISOString().split("T")[0],
    });

    const transactions = transactionsResponse.data.transactions;
    const accounts = transactionsResponse.data.accounts;

    // Create a map of account_id to account name
    const accountMap = accounts.reduce((acc, account) => {
      acc[account.account_id] = account.name;
      return acc;
    }, {});

    let createdCount = 0;
    let updatedCount = 0;

    for (const transaction of transactions) {
      if (transaction.amount > 0) {
        const accountName =
          accountMap[transaction.account_id] || "Unknown Account";

        const existingExpense = await prisma.expense.findUnique({
          where: { transactionId: transaction.transaction_id },
        });

        if (existingExpense) {
          await prisma.expense.update({
            where: { transactionId: transaction.transaction_id },
            data: {
              expenseName: transaction.name,
              expenseAmount: transaction.amount,
              purchaseDate: new Date(transaction.date),
              accountName: accountName,
            },
          });
          updatedCount++;
        } else {
          await prisma.expense.create({
            data: {
              expenseName: transaction.name,
              expenseAmount: transaction.amount,
              purchaseDate: new Date(transaction.date),
              user: { connect: { username: currentProfile } },
              transactionId: transaction.transaction_id,
              accountName: accountName,
            },
          });
          createdCount++;
        }
      }
    }

    await prisma.user.update({
      where: { username: currentProfile },
      data: { lastTransactionFetch: now },
    });

    res.json({
      success: true,
      expensesCreated: createdCount,
      expensesUpdated: updatedCount,
      accountsFetched: accounts.length,
    });
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.delete("/delete_account/:currentProfile/:accountId", async (req, res) => {
  const { currentProfile, accountId } = req.params;
  try {
    await prisma.account.delete({
      where: {
        username_accountId: {
          username: currentProfile,
          accountId: accountId,
        },
      },
    });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account: ", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

app.get("/last_transaction_date/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { username: currentProfile },
      select: { lastTransactionFetch: true },
    });
    res.json({ lastTransactionFetch: user.lastTransactionFetch });
  } catch (error) {
    console.error("Error fetching last transaction date:", error);
    res.status(500).json({ error: "Failed to fetch last transaction date" });
  }
});

module.exports = app;
