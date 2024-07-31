const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
var cors = require("cors");
const app = express();
const PORT = 3000;

const userAuth = require("./Routes/userAuth.js");
const budgets = require("./Routes/budgets.js");
const expenses = require("./Routes/expenses.js");
const accounts = require("./Routes/accounts.js");
const statementRoutes = require("./Routes/statementRoutes.js");
const savingsGoals = require("./Routes/savingsGoals.js");

app.use(express.json());
app.use(cors());
app.use("/auth", userAuth);
app.use("/budgets", budgets);
app.use("/expenses", expenses);
app.use("/accounts", accounts);
app.use("/statement", statementRoutes);
app.use("/savings-goals", savingsGoals);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
