// Drafting only. Rules decide the money; the model only words the message.
// Anthropic when ANTHROPIC_API_KEY is set, Arcee Trinity via OpenRouter when OPENROUTER_API_KEY is set,
// a template otherwise. Any failure falls back to the template.
import { has } from "../config.ts";

export const llmEngine = () => (has("ANTHROPIC_API_KEY") ? "anthropic" : has("OPENROUTER_API_KEY") ? "openrouter-arcee" : "template");

const SYSTEM = "You write short, polite, firm customer-support messages that request a refund the customer is owed under a quoted policy. Plain words. No greetings longer than one word. Under 70 words. Never invent facts beyond the ones given. Output only the message.";

export async function draft(facts: string, template: string): Promise<{ text: string; engine: string }> {
  const engine = llmEngine();
  try {
    if (engine === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: AbortSignal.timeout(15000),
        headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5", max_tokens: 300, system: SYSTEM, messages: [{ role: "user", content: facts }] }),
      });
      if (!r.ok) throw new Error(`anthropic ${r.status}`);
      const j: any = await r.json();
      return { text: j.content[0].text.trim(), engine: `anthropic:${j.model}` };
    }
    if (engine === "openrouter-arcee") {
      const model = process.env.OPENROUTER_MODEL || "arcee-ai/trinity-mini";
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", signal: AbortSignal.timeout(15000),
        headers: { "content-type": "application/json", Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
        body: JSON.stringify({ model, max_tokens: 300, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: facts }] }),
      });
      if (!r.ok) throw new Error(`openrouter ${r.status}`);
      const j: any = await r.json();
      return { text: j.choices[0].message.content.trim(), engine: `openrouter:${model}` };
    }
  } catch (e) { console.warn(`[llm] ${(e as Error).message}; using template`); }
  return { text: template, engine: "template" };
}
