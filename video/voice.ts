// Voiceover via macOS `say`. Writes src/timings.json. Usage (from video/): node voice.ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const FPS = 30; const VOICE = process.env.SAY_VOICE || "Samantha"; const RATE = process.env.SAY_RATE || "185";
export const SEGMENTS: { id: string; min: number; text: string }[] = [
  { id: "pain", min: 30, text: "Thirty-seven percent of American adults could not cover a four hundred dollar surprise. Last year forty-eight million people had a package stolen, worth seven point seven billion dollars. Meet Andy in Dayton, Ohio. Two kids. He saved for months and bought a six ninety-nine TV at Best Buy. Two weeks later his friend got the same TV for two hundred dollars less. Then an Amazon delivery showed up two hours late. Nobody told Andy he was owed anything." },
  { id: "enter", min: 27, text: "SavingsDetective runs in the background. It reads the merchant's written policy, so it knows what Andy is owed. It texts Andy first and only acts on his OK. And it leaves a receipt for every step. Andy taps approve. Two hundred dollars lands." },
  { id: "stack", min: 46, text: "Here is what we built. Our own parts: the rule matcher, the approval gate, the audit page, the iMessage daemon. Then the sponsors. Without Senso's rule book, the detective would be guessing. Without Firedrill's hostile reps, the first gift card offer would fool it. Without Amplitude, we could not see which claims die. Statsig flips auto-approve under five dollars without a deploy. Anthropic writes the words, never the money decision. Cognee remembers Andy's household. Superlinked picks the right clause when policies get long." },
  { id: "fight", min: 24, text: "The merchant fight. Jordan from Best Buy offers a three dollar gift card. The detective declines, quotes the clause, and gets two hundred in cash. Eight hostile reps in the crash test. Eight passes. Every step on the audit page." },
  { id: "close", min: 12, text: "Instinct is a concierge for people who can afford one. SavingsDetective is a collections agent for everyone else." },
];
fs.mkdirSync("public", { recursive: true });
const out: Record<string, { from: number; frames: number; audio: string }> = {}; let from = 0;
for (const s of SEGMENTS) {
  const aiff = `public/voice-${s.id}.aiff`, wav = `public/voice-${s.id}.wav`;
  execFileSync("say", ["-v", VOICE, "-r", RATE, "-o", aiff, s.text]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-ar", "44100", wav]); fs.unlinkSync(aiff);
  const secs = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString());
  const frames = Math.ceil(Math.max(s.min, secs + 1) * FPS); out[s.id] = { from, frames, audio: `voice-${s.id}.wav` }; from += frames;
  console.log(`${s.id.padEnd(8)} ${secs.toFixed(1)}s`);
}
fs.writeFileSync("src/timings.json", JSON.stringify({ fps: FPS, total: from, hasPhoneClip: fs.existsSync("public/phone.mp4"), segments: out }, null, 2));
console.log(`total ${(from / FPS).toFixed(1)}s`);
