const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();

const prisma = new PrismaClient();

app.post("/", async (req, res) => {
  const { name, category, userId } = req.body;
  try {
    const newBudget = await prisma.budget.create({
      data: {
        name,
        category,
        userId,
      },
    });
    res.json(newBudget);
  } catch (error) {
    console.error('Failed to add budget:', error)
    res.status(500).json({ error: "Failed to add budget" });
  }
});

app.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(budgets);
  } catch (error) {
    console.error('Failed to fetch budgets:', error)
    res.status(500).json({ error: "Failed to fetch budgets", details: error.message });
  }
});

module.exports = app;
