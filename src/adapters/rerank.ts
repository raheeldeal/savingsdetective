// Picks the clause that best matches the order. Superlinked SIE when SUPERLINKED_API_KEY
// and SUPERLINKED_BASE_URL are set, a word-overlap scorer otherwise.
import { has } from "../config.ts";
import type { Order, Policy } from "../types.ts";

export const rerankEngine = () => (has("SUPERLINKED_API_KEY") && has("SUPERLINKED_BASE_URL") ? "superlinked" : "local-lexical");

function describe(o: Order) {
  const parts = [o.title, o.merchant];
  if (o.delivery) parts.push(`${o.delivery.type} delivery promised by ${o.delivery.promisedBy} arrived ${o.delivery.deliveredAt} late shipping fee refund`);
  if (o.priceCheck) parts.push(`price dropped from ${o.price} to ${o.priceCheck.priceNow} lower price match difference refund`);
  return parts.join(". ");
}

const words = (s: string) => new Set(s.toLowerCase().match(/[a-z]{3,}/g) ?? []);

export async function rerank(order: Order, policies: Policy[]): Promise<{ engine: string; ranked: Policy[] }> {
  const query = describe(order);
  if (rerankEngine() === "superlinked" && policies.length > 1) {
    try {
      const model = process.env.SUPERLINKED_MODEL || "BAAI/bge-reranker-v2-m3";
      const r = await fetch(`${process.env.SUPERLINKED_BASE_URL!.replace(/\/$/, "")}/v1/score/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${process.env.SUPERLINKED_API_KEY}` },
        body: JSON.stringify({ query: { text: query }, items: policies.map((p) => ({ id: p.id, text: `${p.title}. ${p.clause}` })) }),
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`superlinked ${r.status}`);
      const j: any = await r.json();
      const score = new Map<string, number>(j.scores.map((s: any) => [s.item_id, s.score]));
      return { engine: "superlinked", ranked: policies.map((p) => ({ ...p, score: score.get(p.id) ?? 0 })).sort((a, b) => b.score! - a.score!) };
    } catch (e) { console.warn(`[superlinked] ${(e as Error).message}; using local scorer`); }
  }
  const q = words(query);
  const ranked = policies.map((p) => {
    const w = words(`${p.title} ${p.clause} ${p.kind.replace("_", " ")}`);
    const overlap = [...w].filter((x) => q.has(x)).length;
    return { ...p, score: Number((overlap / Math.max(1, w.size)).toFixed(3)) };
  }).sort((a, b) => b.score! - a.score!);
  return { engine: "local-lexical", ranked };
}
