const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();
const prisma = new PrismaClient();

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": CLIENT_ID,
      "PLAID-SECRET": SECRET,
    },
  },
});

app.post("/create_link_token", async function (req, res) {
  // Get the client_user_id by searching for the current user
  // const user = await User.find(...);
  const clientUserId = user.id;
  const request = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: clientUserId,
    },
    client_name: "Plaid Test App",
    products: ["auth"],
    language: "en",
    webhook: "https://webhook.example.com",
    redirect_uri: "https://domainname.com/oauth-page.html",
    country_codes: ["US"],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(request);
    response.json(createTokenResponse.data);
  } catch (error) {
    // handle error
  }
});

app.post(
  "/api/exchange_public_token",
  async function (request, response, next) {
    const publicToken = request.body.public_token;
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      // These values should be saved to a persistent database and
      // associated with the currently signed-in user
      const accessToken = response.data.access_token;
      const itemID = response.data.item_id;

      res.json({ public_token_exchange: "complete" });
    } catch (error) {
      // handle error
    }
  }
);

module.exports = app;
