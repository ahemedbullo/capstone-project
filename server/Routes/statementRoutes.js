const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");

const app = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

function preprocessText(text) {
  text = text.replace(/Page \d+ of \d+/gi, "");
  text = text.replace(/Statement Date:.+/gi, "");
  text = text.replace(/ACCOUNT SUMMARY/g, "");
  text = text.replace(/ACCOUNT ACTIVITY/g, "");
  text = text.replace(
    /Date of\s+Transaction\s+Merchant Name or Transaction Description/g,
    ""
  );
  text = text.replace(/\$ Amount/g, "");
  text = text
    .split("\n")
    .filter((line) => !line.match(/^(Date|Description|Amount)/i))
    .filter((line) => line.trim() !== "")
    .join("\n");
  return text;
}

function parseExpensesFromText(text) {
  const expenses = [];
  const lines = text.split("\n");
  const datePattern = /(\d{2}\/\d{2})/;
  const amountPattern = /(-?\$?\d{1,3}(?:,?\d{3})*\.\d{2})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;

    const dateMatch = line.match(datePattern);
    const amountMatch = line.match(amountPattern);

    if (dateMatch && amountMatch) {
      const date = dateMatch[1];
      const amount = parseFloat(
        amountMatch[1].replace("$", "").replace(",", "")
      );
      let description = line
        .replace(dateMatch[0], "")
        .replace(amountMatch[0], "")
        .trim();

      if (description.length < 3 && i > 0) {
        description = lines[i - 1].trim();
      }

      description = description.replace(/\s+[A-Z]{2}\s*$/, "");

      if (amount > 0) {
        expenses.push({
          date: `${date}/24`,
          amount: amount,
          description: description,
        });
      }
    }
  }

  return expenses;
}

app.post(
  "/parse-statement/:currentProfile",
  upload.single("statement"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { currentProfile } = req.params;

    try {
      const filePath = req.file.path;
      const pdfData = await pdfParse(fs.readFileSync(filePath));
      const cleanedText = preprocessText(pdfData.text);
      const parsedExpenses = parseExpensesFromText(cleanedText);

      await prisma.tempExpense.deleteMany({
        where: { username: currentProfile },
      });

      await prisma.tempExpense.createMany({
        data: parsedExpenses.map((expense) => ({
          ...expense,
          username: currentProfile,
        })),
      });

      fs.unlinkSync(filePath);

      res.json({
        message: "Statement parsed successfully",
        count: parsedExpenses.length,
      });
    } catch (error) {
      console.error("Error parsing PDF:", error);
      res.status(500).send("Error parsing PDF: " + error.message);
    }
  }
);

app.get("/review-expenses/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;

  try {
    const tempExpenses = await prisma.tempExpense.findMany({
      where: { username: currentProfile },
    });
    res.json(tempExpenses);
  } catch (error) {
    console.error("Error fetching temporary expenses:", error);
    res.status(500).send("Error fetching temporary expenses");
  }
});

app.post("/confirm-expenses/:currentProfile", async (req, res) => {
  const { currentProfile } = req.params;
  const { confirmedExpenses } = req.body;

  try {
    await prisma.expense.createMany({
      data: confirmedExpenses.map((expense) => ({
        expenseName: expense.description,
        expenseAmount: parseFloat(expense.amount),
        purchaseDate: new Date(expense.date),
        userId: currentProfile,
      })),
    });

    await prisma.tempExpense.deleteMany({
      where: { username: currentProfile },
    });

    res.json({ message: "Expenses confirmed and added successfully" });
  } catch (error) {
    console.error("Error confirming expenses:", error);
    res.status(500).send("Error confirming expenses");
  }
});

module.exports = app;
