// Claims live in one JSON file so the daemon, the web server and the demo share state.
import fs from "node:fs";
import path from "node:path";
import type { Claim, Skipped } from "./types.ts";

const DIR = path.resolve("data/state");
const FILE = path.join(DIR, "claims.json");

export interface State { claims: Claim[]; skipped: Skipped[]; runs: { at: string; found: number }[]; outbox: { at: string; text: string; delivered: string }[] }

export function load(): State {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return { claims: [], skipped: [], runs: [], outbox: [] }; }
}
export function save(s: State) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE + ".tmp", JSON.stringify(s, null, 2));
  fs.renameSync(FILE + ".tmp", FILE);
}
export function update(fn: (s: State) => void): State { const s = load(); fn(s); save(s); return s; }
export function getClaim(id: string) { return load().claims.find((c) => c.id === id); }
export function putClaim(c: Claim) { update((s) => { const i = s.claims.findIndex((x) => x.id === c.id); c.updatedAt = new Date().toISOString(); if (i >= 0) s.claims[i] = c; else s.claims.push(c); }); }
export function reset() { fs.rmSync(DIR, { recursive: true, force: true }); }
