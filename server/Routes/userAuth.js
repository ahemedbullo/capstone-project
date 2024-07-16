const { PrismaClient } = require("@prisma/client");
const express = require("express");

const app = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const prisma = new PrismaClient();
require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/signup", async (req, res) => {
  const { user, password } = req.body;
  if (user.length <= 5) {
    return res
      .status(400)
      .json({ error: "Username must be longer than 5 letters" });
  }
  if (password.length <= 6) {
    return res
      .status(400)
      .json({ error: "Password must be longer than 6 characters" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: user },
  });

  try {
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hashed = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        username: user,
        password: hashed,
      },
    });
    const token = jwt.sign(newUser, JWT_SECRET);
    res.status(201).json({ message: "User created successfully", token });
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
    const token = jwt.sign(user, JWT_SECRET);
    res.status(200).json({ message: "Logged in successfully", token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/profile", async (req, res) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});
module.exports = app;
