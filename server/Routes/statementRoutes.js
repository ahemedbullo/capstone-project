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
  text = text.replace(/Statement Period:.+/gi, "");
  text = text.replace(/End of Statement/gi, "");
  text = text.replace(/Balance [Ff]orward.+/g, "");
  text = text.replace(/Previous [Bb]alance.+/g, "");
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
  const datePatterns = [
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    /(\w{3,9}\s+\d{1,2},?\s+\d{4})/,
  ];
  const amountPattern = /[-]?\$?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;

    let date = null;
    let amount = null;
    let description = "";

    for (const pattern of datePatterns) {
      const dateMatch = line.match(pattern);
      if (dateMatch) {
        date = dateMatch[1];
        break;
      }
    }

    const amountMatch = line.match(amountPattern);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ""));
    }

    if (date && amount !== null) {
      description = line.replace(date, "").replace(amountMatch[0], "").trim();
      if (description === "" && i + 1 < lines.length) {
        description = lines[i + 1].trim();
        i++;
      }
      description = description.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      expenses.push({ date, amount, description });
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

      // Store parsed expenses temporarily
      await prisma.tempExpense.deleteMany({
        where: { username: currentProfile },
      });

      await prisma.tempExpense.createMany({
        data: parsedExpenses.map((expense) => ({
          ...expense,
          username: currentProfile,
        })),
      });

      // Save the file information in the database
      await prisma.uploadedStatement.create({
        data: {
          filename: req.file.originalname,
          filePath: filePath,
          userId: currentProfile,
        },
      });

      res.json({
        message: "Statement parsed successfully",
        count: parsedExpenses.length,
      });
    } catch (error) {
      console.error("Error parsing PDF:", error);
      res.status(500).send("Error parsing PDF");
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
    // Add confirmed expenses to the main expenses table
    await prisma.expense.createMany({
      data: confirmedExpenses.map((expense) => ({
        expenseName: expense.description,
        expenseAmount: expense.amount,
        purchaseDate: new Date(expense.date),
        userId: currentProfile,
      })),
    });

    // Clear temporary expenses
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
