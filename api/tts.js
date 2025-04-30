// /api/tts.js
import { OpenAI }   from "openai";
import { VOICES }   from "@/lib/voices";

export const config = { runtime: "edge" };

export default async function handler(req, res) {
  /* ─── CORS (Captivate needs it) ─────────────────────────────── */
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    /* ─── 1. get body ─────────────────────────────────────────── */
    const { char = "angela", text } = req.body || {};
    if (!text) return res.status(400).json({ error: "Field 'text' required." });

    /* ─── 2. resolve voice ───────────────────────────────────── */
    const cfg = VOICES[char.toLowerCase()] || VOICES.angela;

    /* ─── 3. OpenAI TTS call ─────────────────────────────────── */
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const speech = await openai.audio.speech.create({
      model:        cfg.model,
      voice:        cfg.name,
      input:        text,
      instructions: cfg.instructions
    });

    /* ─── 4. stream MP3 back to Captivate ────────────────────── */
    const buf = Buffer.from(await speech.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buf);                                   // <— raw binary
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error:   "TTS generation failed",
      message: err.message
    });
  }
}
