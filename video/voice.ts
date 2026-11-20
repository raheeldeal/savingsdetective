// Generates the voiceover with macOS `say`, one clip per segment, and writes src/timings.json.
// Usage (from video/): node voice.ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const FPS = 30;
const VOICE = process.env.SAY_VOICE || "Samantha";
const RATE = process.env.SAY_RATE || "178";

export const SEGMENTS: { id: string; min: number; text: string }[] = [
  { id: "title", min: 6, text: "SavingsDetective. A personal agent that finds money merchants owe you, and claims it, with proof." },
  { id: "problem", min: 12, text: "Merchants promise refunds for late deliveries and price drops. Almost nobody claims them. The households that lose the most are the ones with the least time to chase fees." },
  { id: "data", min: 12, text: "We start from real Amazon orders from a family of three earning under twenty-five thousand dollars a year, from the Open E-commerce dataset. Then we simulate the service failures on top. Real purchases. Simulated failures." },
  { id: "thread", min: 24, text: "SavingsDetective runs in the background. When it finds money, it texts you first. Amazon delivered the baby wipes two hours late, and their guarantee refunds the nine ninety five fee. You tap approve. It files the claim, and texts back when Amazon pays." },
  { id: "audit", min: 26, text: "Every text links to an audit page. It shows the exact policy clause and its source, the evidence, the full conversation with the merchant, and a timeline of every step the agent took. Rules decide whether money is owed. The model only writes the message." },
  { id: "index", min: 12, text: "The home page shows what it recovered, what needs your OK, and what it missed, like a Target price drop that came five days too late." },
  { id: "arch", min: 18, text: "Under the hood, a Node daemon reads orders, pulls policies from Senso, ranks the clauses, matches rules, and texts you through iMessage. A simulated merchant answers, and Firedrill crash tests the agent with hostile support reps." },
  { id: "sponsors", min: 14, text: "Each sponsor tool sits behind an adapter with a local fallback. Senso, Firedrill, Amplitude, Statsig, Cognee, Superlinked, Guild, and Arcee." },
  { id: "honest", min: 8, text: "To be clear: the merchant is simulated, and no real refund lands today. The audit trail is real." },
  { id: "close", min: 11, text: "Instinct is a concierge for people who can afford one. SavingsDetective is a collections agent for everyone else." },
];

fs.mkdirSync("public", { recursive: true });
const out: Record<string, { from: number; frames: number; audio: string }> = {};
let from = 0;
for (const s of SEGMENTS) {
  const aiff = `public/voice-${s.id}.aiff`;
  const wav = `public/voice-${s.id}.wav`;
  execFileSync("say", ["-v", VOICE, "-r", RATE, "-o", aiff, s.text]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-ar", "44100", wav]);
  fs.unlinkSync(aiff);
  const secs = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString());
  const frames = Math.ceil(Math.max(s.min, secs + 1.4) * FPS);
  out[s.id] = { from, frames, audio: `voice-${s.id}.wav` };
  from += frames;
  console.log(`${s.id.padEnd(9)} ${secs.toFixed(1)}s audio, ${(frames / FPS).toFixed(1)}s segment`);
}
const hasPhoneClip = fs.existsSync("public/phone.mp4");
fs.writeFileSync("src/timings.json", JSON.stringify({ fps: FPS, total: from, hasPhoneClip, segments: out }, null, 2));
console.log(`total ${(from / FPS).toFixed(1)}s${hasPhoneClip ? ", using public/phone.mp4" : ""}`);
