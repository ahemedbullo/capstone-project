const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();
const prisma = new PrismaClient();

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

app.delete("/:currentProfile/:budgetId", async (req, res) => {
  const { currentProfile } = req.params;
  const { budgetId } = req.params;
  try {
    const budget = await prisma.budget.findFirst({
      where: { id: parseInt(budgetId), userId: currentProfile },
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    await prisma.budget.delete({ where: { id: parseInt(budgetId) } }); // Convert budgetId to integer here
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

module.exports = app;
