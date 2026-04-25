const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
// dotenv.config();




const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/chat", async (req, res) => {
  const { message, systemPrompt } = req.body;

  if (!message || !systemPrompt) {
    return res.status(400).json({ error: "Missing required fields: message and systemPrompt" });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY in server environment" });
  }

try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);

  } catch (err) {
    console.error("/chat error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));