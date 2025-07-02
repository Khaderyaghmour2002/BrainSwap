const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send({ message: "Welcome to the backend!" });
});

app.post("/api/generate-quiz", async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill is required in request body" });
  }

  console.log(`📩 Incoming request for skill: "${skill}"`);

  const prompt = `
Create 5 multiple-choice quiz questions to test basic knowledge in "${skill}".
Each question should be in this exact JSON format, and return ONLY valid JSON:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "answer": "Correct option"
  },
  ...
]
Make sure each question has 4 distinct options and only one correct answer.
  `.trim();

  try {
    console.log("🧠 Sending prompt to OpenAI...");

    const start = Date.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const elapsed = Date.now() - start;
    console.log(`✅ OpenAI response received in ${elapsed} ms`);

    const responseText = completion.choices[0].message.content.trim();
    console.log("📝 Raw response:", responseText);

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (err) {
      console.error("❌ Failed to parse OpenAI JSON:", err.message);
      return res.status(500).json({
        error: "OpenAI returned invalid JSON",
        raw: responseText,
      });
    }

    // Validate all questions
    const isValid = Array.isArray(parsed) && parsed.length === 5 &&
      parsed.every(
        q => q.question && Array.isArray(q.options) && q.options.length === 4 && q.answer
      );

    if (!isValid) {
      return res.status(500).json({
        error: "Invalid quiz format or missing fields",
        raw: parsed,
      });
    }

    const filePath = path.join(__dirname, "../client/assets/quizData.json");

    fs.writeFile(filePath, JSON.stringify(parsed, null, 2), (err) => {
      if (err) {
        console.error("❌ Failed to save quiz to file:", err.message);
        return res.status(500).json({ error: "Failed to save quiz to file" });
      }

      console.log(`💾 Quiz saved to ${filePath}`);
      res.json({ questions: parsed });
    });

  } catch (error) {
    console.error("❌ OpenAI request failed:", error.message || error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
