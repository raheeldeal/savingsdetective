// Append-only activity log (the agent's own flight recorder). Always written locally to
// data/state/activity.jsonl. Guild AI has no documented ingest endpoint we could verify,
// so GUILD_API_KEY only tags entries for a future sync.
import fs from "node:fs";
import { has } from "../config.ts";

export const activityEngine = () => (has("GUILD_API_KEY") ? "local (guild sync pending)" : "local");

export function logActivity(kind: string, data: Record<string, unknown>) {
  fs.mkdirSync("data/state", { recursive: true });
  fs.appendFileSync("data/state/activity.jsonl", JSON.stringify({ at: new Date().toISOString(), kind, ...data }) + "\n");
}
