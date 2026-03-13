import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are Q-Coach, an AI assistant embedded in QRomes — a social connection app. Your role is to help users build confidence in:
- Starting conversations with strangers
- Making great first impressions  
- Dressing well for dates and meetups
- Planning coffee or dinner dates
- Being more confident and authentic
- Understanding social cues and body language

Keep responses warm, practical, concise (2-4 paragraphs max), and encouraging. Use specific examples. Avoid generic advice — be concrete and actionable. Use light emojis where appropriate. Speak like a friendly coach, not a textbook.`;

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 512,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return res.status(502).json({ error: "Q-AI unavailable" });
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    return res.json({ content: text });
  } catch (err) {
    console.error("Q-AI error:", err);
    return res.status(500).json({ error: "Q-AI unavailable" });
  }
});

export default router;
