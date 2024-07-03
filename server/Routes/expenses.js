const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();

const prisma = new PrismaClient();

app.post("/", async (req, res) => {
  const { name, amount, budgetId, userId } = req.body;
  try {
    const newExpense = await prisma.expense.create({
      data: {
        name,
        amount,
        budgetId,
        userId,
      },
    });
    res.json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

app.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

module.exports = app;
