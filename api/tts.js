// /api/tts.js
<<<<<<< HEAD
import { OpenAI } from "openai";

/* 1.  Character → voice map  ─────────────────────────── */
const VOICES = {
  angela:   { voice: "sage",  instructions: "Neutral American, warm mentor." },
  brittany: { voice: "alloy", instructions: "Upbeat Gen-Z, energetic tone." },
  jose:     { voice: "verse", instructions: "Light Spanish accent, warm." },
  kevin:    { voice: "echo",  instructions: "Mid-western trainer, steady." },
  miles:    { voice: "ash",   instructions: "Queens NY, relaxed confidence." }
};

export default async function handler(req, res) {
  /* ───────────  Unchanged CORS boilerplate  ─────────── */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
=======
// this is the newest.
import { OpenAI }   from "openai";
import { VOICES }   from "@/lib/voices";

export const config = { runtime: "edge" };

export default async function handler(req, res) {
  /* ─── CORS (Captivate needs it) ─────────────────────────────── */
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
>>>>>>> 8480ccb4e4737ff7003896c1bc9c9ba7aa50e44c
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
<<<<<<< HEAD
    /* 2.  Read text  +  character from body  ─────────── */
    const { text, char = "angela" } = req.body || {};
    if (!text) return res.status(400).json({ error: "Text is required" });

    /* 3.  Resolve voice & instructions  ──────────────── */
    const cfg = VOICES[char.toLowerCase()] || VOICES.angela;

    /* 4.  OpenAI call (same buffer logic)  ───────────── */
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: cfg.voice,
      input: text,
      instructions: cfg.instructions
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error) {
    console.error("Error generating speech:", error);
    return res.status(500).json({ error: error.message });
=======
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
>>>>>>> 8480ccb4e4737ff7003896c1bc9c9ba7aa50e44c
  }
}
