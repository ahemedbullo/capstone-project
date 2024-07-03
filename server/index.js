const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
var cors = require("cors");
const app = express();
const PORT = 3000;

const userAuth = require("./Routes/userAuth.js");
const budgets = require ("./Routes/budgets.js");
const expenses = require('./Routes/expenses.js');
app.use(express.json());
app.use(cors());
app.use("/auth", userAuth);
app.use("/budgets", budgets);
app.use('/expenses', expenses);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
