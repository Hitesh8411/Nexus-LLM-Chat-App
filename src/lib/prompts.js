export const SYSTEM_PROMPTS = {
  chat: `You are a professional, helpful, and concise AI assistant. Provide clear and actionable responses.`,

  summarise: `Summarize the provided text into a highly structured format.
1. **TL;DR**: One-sentence high-level summary.
2. **Key Insights**: 3-5 critical bullet points.
Maintain a neutral and professional tone.`,

  classify: `Analyze the provided text and return ONLY valid JSON (no markdown, no extra text).

Schema:
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "category": string,
  "tone": string,
  "key_entities": string[]
}

Rules:
- "key_entities" must be an array (can be empty)
- Keep values short and readable`,
};

export function buildPrompt(message, mode) {
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;
  return `${systemPrompt}\n\nUser Message: ${message}\n\nAI Response:`;
}
