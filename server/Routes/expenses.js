const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express.Router();
const prisma = new PrismaClient();

app.post("/:currentProfile/", async (req, res) => {
  const { currentProfile } = req.params;
  const { expenseName, amount, budgetId, budgetName } = req.body;
  try {
    let expenseData = {
      expenseName,
      expenseAmount: parseFloat(amount),
      user: { connect: { username: currentProfile } },
    };

    if (budgetId) {
      expenseData.budget = { connect: { id: parseInt(budgetId) } };
      expenseData.budgetName = budgetName;
    }

    const newExpense = await prisma.expense.create({
      data: expenseData,
    });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating expense", error: error.message });
  }
});

app.get("/:currentProfile/", async (req, res) => {
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

app.get("/:currentProfile/:budgetId", async (req, res) => {
  const { currentProfile, budgetId } = req.params;
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: currentProfile, budgetId: parseInt(budgetId) },
    });
    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

app.put("/:currentProfile/:expenseId", async (req, res) => {
  const { currentProfile, expenseId } = req.params;
  const { budgetId, budgetName } = req.body;
  try {
    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(expenseId), userId: currentProfile },
      data: {
        budgetName: budgetName,
        budget: { connect: { id: parseInt(budgetId) } },
      },
    });
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update expense budget" });
  }
});

app.delete("/:currentProfile/:expenseId", async (req, res) => {
  const { currentProfile } = req.params;
  const { expenseId } = req.params;
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: parseInt(expenseId), userId: currentProfile },
    });
    if (!expense) {
      return res.status(404).json({ error: "Budget not found" });
    }
    await prisma.expense.delete({
      where: { id: parseInt(expenseId), userId: currentProfile },
    });
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = app;
