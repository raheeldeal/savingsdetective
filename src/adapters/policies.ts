// Rule book adapter. Senso when SENSO_API_KEY is set, data/policies.json otherwise.
// Swapping is one env var: the rest of the agent only calls candidatesFor().
import fs from "node:fs";
import { has } from "../config.ts";
import type { Order, Policy } from "../types.ts";

const SENSO = process.env.SENSO_BASE_URL || "https://apiv2.senso.ai/api/v1";
export const local: Policy[] = JSON.parse(fs.readFileSync("data/policies.json", "utf8")).policies;
export const policyEngine = () => (has("SENSO_API_KEY") ? "senso" : "local");

export function policyText(p: Policy) {
  return `policy_id: ${p.id}\nmerchant: ${p.merchantName}\ntitle: ${p.title}\nwindow_days: ${p.windowDays}\nclause: ${p.clause}\nsource: ${p.sourceUrl}`;
}

async function sensoSearch(query: string): Promise<string[]> {
  const r = await fetch(`${SENSO}/org/search/context`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.SENSO_API_KEY! },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`senso ${r.status}`);
  const j: any = await r.json();
  return (j.results ?? []).map((x: any) => String(x.chunk_text ?? ""));
}

/** Policies that could apply to this order, plus where they came from. */
export async function candidatesFor(order: Order): Promise<{ source: string; policies: Policy[] }> {
  const mine = local.filter((p) => p.merchant === order.merchant);
  if (policyEngine() === "senso") {
    try {
      const name = mine[0]?.merchantName ?? order.merchant;
      const chunks = await sensoSearch(`${name} ${order.delivery ? "late delivery guarantee refund" : "price match lower price refund difference"}`);
      const ids = new Set(chunks.flatMap((t) => [...t.matchAll(/policy_id:\s*([\w-]+)/g)].map((m) => m[1])));
      const found = local.filter((p) => ids.has(p.id) && p.merchant === order.merchant);
      if (found.length) return { source: "senso", policies: found };
    } catch (e) { console.warn(`[senso] ${(e as Error).message}; using local rule book`); }
  }
  return { source: "local", policies: mine };
}
