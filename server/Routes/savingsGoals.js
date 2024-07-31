const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express.Router();
const prisma = new PrismaClient();

app.post("/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  const { name, targetAmount, deadline } = req.body;
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username: currentProfile },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newGoal = await prisma.savingsGoal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        deadline: new Date(deadline),
        user: { connect: { username: currentProfile } },
      },
    });
    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Error creating savings goal:", error);
    res.status(500).json({ error: "Failed to create savings goal" });
  }
});

app.get("/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: currentProfile },
    });
    res.json(goals);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    res.status(500).json({ error: "Failed to fetch savings goals" });
  }
});

app.put("/:currentProfile/:goalId", async (req, res) => {
  const { currentProfile, goalId } = req.params;
  const { currentAmount } = req.body;
  try {
    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: parseInt(goalId), userId: currentProfile },
      data: { currentAmount: parseFloat(currentAmount) },
    });
    res.json(updatedGoal);
  } catch (error) {
    console.error("Error updating savings goal:", error);
    res.status(500).json({ error: "Failed to update savings goal" });
  }
});

app.delete("/:currentProfile/:goalId", async (req, res) => {
  const { currentProfile, goalId } = req.params;
  try {
    await prisma.savingsGoal.delete({
      where: { id: parseInt(goalId), userId: currentProfile },
    });
    res.json({ message: "Savings goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    res.status(500).json({ error: "Failed to delete savings goal" });
  }
});

app.put("/:currentProfile/:goalId", async (req, res) => {
  const { currentProfile, goalId } = req.params;
  const { currentAmount } = req.body;
  try {
    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: parseInt(goalId), userId: currentProfile },
      data: { currentAmount: parseFloat(currentAmount) },
    });
    res.json(updatedGoal);
  } catch (error) {
    console.error("Error updating savings goal:", error);
    res.status(500).json({ error: "Failed to update savings goal" });
  }
});

module.exports = app;
