const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 paste your NEW API key here
const API_KEY = process.env.API_KEY;

app.post("/chat", async (req, res) => {
  const userText = req.body.message;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        temperature: 0.8,
        messages: [
          { role: "system", content: "You are a friendly English teacher." },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));