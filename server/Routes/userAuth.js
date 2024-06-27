const { PrismaClient } = require("@prisma/client");
const express = require("express");

const app = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const prisma = new PrismaClient();
require("dotenv").config();

app.post("/signup", async (req, res) => {
  const { user, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    await prisma.user.create({
      data: {
        username: user,
        password: hashed,
      },
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/login", async (req, res) => {
  const { user, password } = req.body;
  const userRecord = await prisma.user.findUnique({
    where: { username: user },
  });

  if (!userRecord) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, userRecord.password);
  if (isValid) {
    res.status(200).json({ message: "Logged in successfully" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

module.exports = app;
