import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] || "dummy",
  baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
});

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

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    return res.json({ content: text });
  } catch (err) {
    console.error("Q-AI error:", err);
    return res.status(500).json({ error: "Q-AI unavailable" });
  }
});

export default router;
