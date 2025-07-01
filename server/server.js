const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the backend!" });
});

// ✅ Quiz generation endpoint
app.post("/api/generate-quiz", async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill is required in request body" });
  }

  console.log(`📩 Incoming quiz generation request for skill: "${skill}"`);

  try {
    const prompt = `Create a multiple-choice quiz question with 4 answers (1 correct) to test basic knowledge in the skill "${skill}". Respond in JSON format like this:
{
  "question": "What does HTML stand for?",
  "options": ["HyperText Markup Language", "HighText Machine Language", "Hyperlink and Text Markup Language", "None of the above"],
  "answer": "HyperText Markup Language"
}`;

    console.log("🧠 Sending prompt to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // ✅ Use a valid model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    console.log("✅ OpenAI responded!");

    const responseText = completion.choices[0].message.content;

    console.log("📝 Raw response:", responseText);

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("❌ Failed to parse OpenAI response as JSON:", jsonError.message);
      return res.status(500).json({ error: "Invalid response format from OpenAI" });
    }

    if (!parsed.question || !parsed.options || !parsed.answer) {
      return res.status(500).json({ error: "Incomplete quiz data from OpenAI" });
    }

    res.json({ question: parsed });

  } catch (error) {
    console.error("❌ OpenAI request failed:", error.message || error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// ✅ Run server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
