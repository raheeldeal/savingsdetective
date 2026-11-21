// Generates the voiceover with macOS `say`, one clip per segment, and writes src/timings.json.
// Usage (from video/): node voice.ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const FPS = 30;
const VOICE = process.env.SAY_VOICE || "Samantha";
const RATE = process.env.SAY_RATE || "178";

export const SEGMENTS: { id: string; min: number; text: string }[] = [
  { id: "title", min: 6, text: "SavingsDetective. A personal agent that finds money merchants owe you, and claims it, with proof." },
  { id: "orders", min: 16, text: "These are real Amazon orders from a family of three earning under twenty-five thousand dollars a year. Nine orders. Nobody flagged anything. On top of the real items we simulate the service failures a family like this runs into every month." },
  { id: "rulebook", min: 30, text: "The agent does not guess. For every order it pulls the merchant's written policy from the Senso rule book, with the clause and its source link. Then a deterministic check runs the numbers. The monitor was bought for four ninety nine. Best Buy now sells it for three seventy nine. That is day nine of a fifteen day window. One hundred and twenty dollars is owed. No model decides the money." },
  { id: "negative", min: 16, text: "It also says no. The floor fan from Target dropped ten dollars, but on day eighteen. Target's window is fourteen days. The agent records why it did not file, so you can see the misses as well as the wins." },
  { id: "transcript", min: 30, text: "When you approve, the agent opens a chat with merchant support. The rep offers a three dollar gift card. The agent declines, quotes the clause, and asks for the refund to the original payment method. It gets the full one twenty in cash. Before it ever talks to a merchant, we crash test it. Eight hostile reps: phishing for card numbers, prompt injection, lowball refunds. Eight passes." },
  { id: "audit", min: 34, text: "Every text links to an audit page. This is real footage. The amount, the clause and its source, the evidence, one tap to approve, the full merchant conversation, a timestamped trail of every step, and where each piece of data came from. Real purchase, simulated failure, labelled." },
  { id: "phone", min: 16, text: "And the whole thing is a text thread. Found. Filed. Paid. Then: what I've saved you. One hundred and fifty-two dollars for a family that never had time to chase it." },
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
  console.log(`${s.id.padEnd(10)} ${secs.toFixed(1)}s audio, ${(frames / FPS).toFixed(1)}s segment`);
}
const hasPhoneClip = fs.existsSync("public/phone.mp4");
fs.writeFileSync("src/timings.json", JSON.stringify({ fps: FPS, total: from, hasPhoneClip, segments: out }, null, 2));
console.log(`total ${(from / FPS).toFixed(1)}s${hasPhoneClip ? ", using public/phone.mp4" : ""}`);
