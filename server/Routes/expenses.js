const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();
const prisma = new PrismaClient();

app.post("/:currentProfile/expenses", async (req, res) => {
  const { currentProfile } = req.params;
  const { expenseName, expenseAmount, budgetId } = req.body;

  try {
    const newExpense = await prisma.expense.create({
      data: {
        expenseName,
        expenseAmount: parseInt(expenseAmount),
        userId: currentProfile,
        budgetId: parseInt(budgetId),
      },
    });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

app.get("/:currentProfile/expenses", async (req, res) => {
  const { currentProfile } = req.params;

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: currentProfile },
    });
    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

app.delete("/:currentProfile/expenses/:expenseId", async (req, res) => {
  const { currentProfile } = req.params;
  const { expenseId } = req.params;
  try {
    await prisma.expense.delete({
      where: { id: expenseId, userId: currentProfile },
    });
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = app;
