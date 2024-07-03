const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

app.post("/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  const { budgetName, budgetAmount } = req.body;

  try {
    const newBudget = await prisma.budget.create({
      data: {
        budgetName,
        budgetAmount: parseInt(budgetAmount),
        userId: currentProfile,
      },
    });
    res.status(201).json(newBudget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create budget" });
  }
});
app.get("/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: currentProfile },
    });
    res.status(200).json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

app.delete("/:currentProfile/budgets/:budgetId", async (req, res) => {
  const { currentProfile } = req.params;
  const { budgetId } = req.params;
  try {
    await prisma.budget.delete({
      where: { id: budgetId, userId: currentProfile },
    });
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

module.exports = app;
