// Household memory: profile and past claims. Cognee Cloud when COGNEE_API_KEY is set,
// a local JSON file otherwise. remember() and recall() are the whole interface.
import fs from "node:fs";
import { has } from "../config.ts";

const FILE = "data/state/memory.json";
export const memoryEngine = () => (has("COGNEE_API_KEY") && has("COGNEE_BASE_URL") ? "cognee" : "local");

function localLoad(): { at: string; text: string }[] { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return []; } }

export async function remember(text: string): Promise<void> {
  const items = localLoad(); items.push({ at: new Date().toISOString(), text });
  fs.mkdirSync("data/state", { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(items, null, 2));
  if (memoryEngine() !== "cognee") return;
  try {
    const form = new FormData();
    form.append("datasetName", "savingsdetective_household");
    form.append("raw_data", text);
    const r = await fetch(`${process.env.COGNEE_BASE_URL!.replace(/\/$/, "")}/api/v1/remember`, {
      method: "POST", body: form, signal: AbortSignal.timeout(8000),
      headers: { "X-Api-Key": process.env.COGNEE_API_KEY!, ...(process.env.COGNEE_TENANT_ID ? { "X-Tenant-Id": process.env.COGNEE_TENANT_ID } : {}) },
    });
    if (!r.ok) throw new Error(`cognee ${r.status}`);
  } catch (e) { console.warn(`[cognee] ${(e as Error).message}; kept in local memory`); }
}

export async function recall(query: string): Promise<string[]> {
  if (memoryEngine() === "cognee") {
    try {
      const r = await fetch(`${process.env.COGNEE_BASE_URL!.replace(/\/$/, "")}/api/v1/recall`, {
        method: "POST", signal: AbortSignal.timeout(8000),
        headers: { "Content-Type": "application/json", "X-Api-Key": process.env.COGNEE_API_KEY!, ...(process.env.COGNEE_TENANT_ID ? { "X-Tenant-Id": process.env.COGNEE_TENANT_ID } : {}) },
        body: JSON.stringify({ query }),
      });
      if (r.ok) { const j: any = await r.json(); return (Array.isArray(j) ? j : [j]).map((x) => (typeof x === "string" ? x : JSON.stringify(x))); }
    } catch (e) { console.warn(`[cognee] ${(e as Error).message}; using local memory`); }
  }
  const q = new Set(query.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
  return localLoad().filter((m) => (m.text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).some((w) => q.has(w))).map((m) => m.text);
}
