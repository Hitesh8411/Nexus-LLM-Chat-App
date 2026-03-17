import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "../src/lib/prompts.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ✅ Validate API Key at startup
if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing in .env file");
}

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "..", "dist");

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    port: process.env.PORT || 5001,
    key_set: !!process.env.GEMINI_API_KEY,
  });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tryParseJsonFromText = (text) => {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // try fenced ```json ... ```
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        return null;
      }
    }
    return null;
  }
};

const formatClassification = (obj) => {
  if (!obj || typeof obj !== "object") return null;
  const sentiment = obj.sentiment ?? obj.Sentiment ?? null;
  const category = obj.category ?? obj.Category ?? null;
  const tone = obj.tone ?? obj.Tone ?? null;
  const keyEntities =
    obj.key_entities ??
    obj.keyEntities ??
    obj["Key Entities"] ??
    obj.entities ??
    null;

  const keyEntitiesArr = Array.isArray(keyEntities)
    ? keyEntities
    : typeof keyEntities === "string"
      ? keyEntities
          .split(/[,|]/g)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  if (!sentiment && !category && !tone && keyEntitiesArr.length === 0) return null;

  return {
    sentiment: sentiment || "Unknown",
    category: category || "Unknown",
    tone: tone || "Unknown",
    key_entities: keyEntitiesArr,
  };
};

// ✅ Chat Route
app.post("/api/chat", async (req, res) => {
  console.log("POST /api/chat called with mode:", req.body.mode);

  try {
    const { message, mode } = req.body;

    // ✅ Input validation
    if (!message || !mode) {
      return res.status(400).json({
        error: "Message and mode are required",
      });
    }

    const configuredModelName =
      (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) ||
      "gemini-flash-latest";

    const prompt = buildPrompt(message, mode);

    console.log({
      model: configuredModelName,
      mode,
      messageLength: message.length,
    });

    const runGenerate = async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        ),
      ]);
    };

    let result;
    try {
      result = await runGenerate(configuredModelName);
    } catch (e) {
      const msg = (e && e.message) || "";
      const isNotFound =
        typeof msg === "string" &&
        (msg.includes("404") || msg.toLowerCase().includes("not found"));
      if (!isNotFound || configuredModelName === "gemini-flash-latest") throw e;
      console.warn(
        `Model "${configuredModelName}" not found. Falling back to gemini-flash-latest.`
      );
      result = await runGenerate("gemini-flash-latest");
    }

    const response = result.response;
    const reply = response.text();

    if (mode === "classify") {
      const parsed = tryParseJsonFromText(reply);
      const classification = formatClassification(parsed);
      if (classification) return res.json({ reply, classification });
    }

    res.json({ reply });

  } catch (err) {
    console.error("❌ Gemini API Error:", err);

    const msg = (err && err.message) || "";
    const is429 =
      typeof msg === "string" &&
      (msg.includes("[429") || msg.includes("429 Too Many Requests"));

    if (is429) {
      // Example message contains: 'Please retry in 57.23s' or '"retryDelay":"57s"'
      const retrySeconds =
        (typeof msg === "string" &&
          (Number((msg.match(/Please retry in\s+([\d.]+)s/i) || [])[1]) ||
            Number((msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i) || [])[1]))) ||
        null;

      if (retrySeconds) res.set("Retry-After", String(Math.ceil(retrySeconds)));

      return res.status(429).json({
        error: "Gemini quota exceeded / rate limited",
        details: msg,
        retry_after_seconds: retrySeconds ? Math.ceil(retrySeconds) : null,
      });
    }

    res.status(500).json({
      error: "Gemini API error",
      details: msg,
      code: err.code || "UNKNOWN",
    });
  }
});

// Serve frontend (Vite build) in production
app.use(express.static(distDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});