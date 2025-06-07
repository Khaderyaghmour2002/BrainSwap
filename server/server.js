const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to the backend!" });
});

// 🔍 Generate quiz question for skill
app.post("/api/generate-quiz", async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill is required" });
  }

  try {
    const prompt = `Create a multiple-choice quiz question with 4 answers (1 correct) to test basic knowledge in the skill "${skill}". Respond in JSON format:
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": "..."
    }`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.data.choices[0].message.content;
    const parsed = JSON.parse(responseText);

    res.json({ question: parsed });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
