// One pass of the agent: read orders, match rules, record claims, text the user.
// Approval and filing live here too so the web server and the daemon share one code path.
import crypto from "node:crypto";
import { config } from "./config.ts";
import { loadOrders } from "./orders.ts";
import { evaluate, shortName } from "./rules.ts";
import { load, update, getClaim, putClaim } from "./store.ts";
import { candidatesFor, policyEngine } from "./adapters/policies.ts";
import { rerank } from "./adapters/rerank.ts";
import { draft } from "./adapters/llm.ts";
import { sendText } from "./adapters/imessage.ts";
import { autoApproveSmallClaims, flagEngine } from "./adapters/flags.ts";
import { remember, recall } from "./adapters/memory.ts";
import { channel } from "./adapters/merchant.ts";
import { logActivity } from "./adapters/activity.ts";
import { event } from "./instrumentation/analytics.ts";
import type { Claim, TimelineEvent } from "./types.ts";

const usd = (n: number) => `$${n.toFixed(2)}`;
const now = () => new Date().toISOString();
const link = (c: Claim) => `${config.baseUrl}/c/${c.id}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mark(c: Claim, e: Omit<TimelineEvent, "at">) { c.timeline.push({ at: now(), ...e }); logActivity(e.kind, { claim: c.id, title: e.title }); }

async function text(c: Claim, body: string) {
  const delivered = await sendText(body);
  c.messages.push({ at: now(), text: body, delivered });
  mark(c, { kind: "message", actor: "agent", title: `Texted you (${delivered})`, detail: body });
}

export async function runPass(opts: { quiet?: boolean } = {}): Promise<{ found: Claim[]; total: number }> {
  const { household, orders } = loadOrders();
  const state = load();
  const known = new Set([...state.claims.map((c) => c.orderId), ...state.skipped.map((s) => s.orderId)]);
  if (!state.runs.length) await remember(`Household profile: ${household.name ?? "user"}, ${household.size} people, income ${household.income}, ${household.state}. Source: ${household.source}.`);
  const found: Claim[] = [];
  const skipped: typeof state.skipped = [];

  for (const o of orders) {
    if (known.has(o.id)) continue;
    const { source, policies } = await candidatesFor(o);
    const { engine, ranked } = await rerank(o, policies);
    let made = false;
    let why = "No policy for this merchant.";
    for (const p of ranked) {
      const v = evaluate(o, p);
      if (!v.owed) { why = v.reason; continue; }
      const history = await recall(`${p.merchantName} ${o.merchant} claim`);
      const facts = `Merchant: ${p.merchantName}. Order ${o.id}: ${o.title.slice(0, 80)}. ${v.reason} Policy "${p.title}": "${p.clause}" (${p.sourceUrl}). Amount owed: ${usd(v.amount)}. Ask for it back to the original payment method.`;
      const template = `Hi, order ${o.id} (${shortName(o)}). ${v.reason} Your ${p.title} policy says: "${p.clause}" Please refund ${usd(v.amount)} to my original payment method. Thank you.`;
      const d = await draft(facts, template);
      const c: Claim = {
        id: "clm_" + crypto.createHash("sha1").update(o.id + p.id).digest("hex").slice(0, 8),
        orderId: o.id, merchant: o.merchant, merchantName: p.merchantName,
        amount: v.amount, reason: v.reason, headline: v.headline,
        policy: { id: p.id, title: p.title, clause: p.clause, sourceUrl: p.sourceUrl, verified: p.verified, verifiedNote: p.verifiedNote, windowDays: p.windowDays },
        policySource: source,
        rerank: { engine, candidates: ranked.map((r) => ({ id: r.id, score: r.score ?? 0 })) },
        deadline: v.deadline, evidence: v.evidence, provenance: o.provenance,
        order: { title: o.title, asin: o.asin, price: o.price, orderedAt: o.orderedAt, category: o.category },
        status: "found", autoApproved: false, draft: d, transcript: [], channel: channel().name,
        messages: [], timeline: [], createdAt: now(), updatedAt: now(),
      };
      mark(c, { kind: "order", actor: "system", title: "Order read", detail: `${o.title.slice(0, 90)}, ${usd(o.price)}, ordered ${new Date(o.orderedAt).toDateString()}` });
      mark(c, { kind: "rule", actor: "agent", title: `Matched "${p.title}" (${source === "senso" ? "Senso" : "local rule book"}, ranked by ${engine})`, detail: v.reason });
      if (history.length) mark(c, { kind: "memory", actor: "agent", title: "Recalled household history", detail: history.slice(-2).join(" | ").slice(0, 200) });
      mark(c, { kind: "found", actor: "agent", title: `Claim found: ${usd(v.amount)}`, detail: `Deadline ${new Date(v.deadline).toDateString()}` });
      putClaim(c);
      await event("Claim Found", { amount: c.amount, merchant: c.merchantName, policy: p.id, policy_source: source });
      found.push(c);
      made = true;
      break;
    }
    if (!made) skipped.push({ orderId: o.id, title: o.title, merchantName: policies[0]?.merchantName ?? o.merchant, reason: why });
  }
  update((s) => { s.skipped.push(...skipped); s.runs.push({ at: now(), found: found.length }); });

  const auto = await autoApproveSmallClaims();
  for (const c of found) {
    if (auto && c.amount < config.autoApproveUnder) {
      await approveClaim(c.id, `auto (${flagEngine()} flag: under ${usd(config.autoApproveUnder)})`);
    } else {
      const fresh = getClaim(c.id)!;
      await text(fresh, `Found: ${fresh.headline} Approve: ${link(fresh)}`);
      putClaim(fresh);
    }
  }
  if (found.length) await sendSummary();
  const total = found.reduce((a, c) => a + c.amount, 0);
  await event("Run Completed", { found: found.length, amount: total, policy_engine: policyEngine() });
  if (!opts.quiet) console.log(`[pass] ${found.length} new claims, ${usd(total)}. ${skipped.length} orders checked with nothing owed.`);
  return { found, total };
}

export async function approveClaim(id: string, actor = "you, on the audit page") {
  const c = getClaim(id);
  if (!c || c.status !== "found") return c;
  c.status = "approved";
  c.autoApproved = actor.startsWith("auto");
  mark(c, { kind: "approved", actor: c.autoApproved ? "system" : "user", title: c.autoApproved ? "Auto-approved" : "Approved by you", detail: `Approved by ${actor}` });
  putClaim(c);
  await event("Claim Approved", { amount: c.amount, merchant: c.merchantName, auto: c.autoApproved });
  await fileClaim(id);
  return getClaim(id);
}

async function fileClaim(id: string) {
  const c = getClaim(id)!;
  const ch = channel();
  mark(c, { kind: "filing", actor: "agent", title: `Opened chat with ${c.merchantName} support`, detail: ch.label });
  const res = await ch.file(c);
  c.transcript = res.transcript;
  c.status = "filed";
  mark(c, { kind: "filed", actor: "agent", title: `Claim filed with ${c.merchantName}`, detail: `${res.transcript.length} messages exchanged` });
  await text(c, c.autoApproved
    ? `Auto-approved (under ${usd(config.autoApproveUnder)}): ${c.headline} Filed. Proof: ${link(c)}`
    : `Filed. Proof: ${link(c)}`);
  putClaim(c);
  await event("Claim Filed", { amount: c.amount, merchant: c.merchantName, channel: ch.name });
  await sleep(Number(process.env.RESOLVE_DELAY_MS ?? 1500));
  c.status = res.outcome === "approved" ? "resolved" : "denied";
  mark(c, { kind: "resolved", actor: "merchant", title: res.outcome === "approved" ? `${c.merchantName} approved ${usd(res.refunded)}` : `${c.merchantName} denied the claim` });
  if (!c.autoApproved) await text(c, res.outcome === "approved" ? `${c.merchantName} approved ${usd(res.refunded)}.` : `${c.merchantName} said no. I escalated with the clause. Details: ${link(c)}`);
  putClaim(c);
  await remember(`Claim ${c.id}: ${c.merchantName} ${res.outcome} ${usd(res.refunded)} under ${c.policy.id} on ${now().slice(0, 10)}.`);
  await event("Claim Resolved", { amount: res.refunded, merchant: c.merchantName, outcome: res.outcome });
}

export function totals() {
  const s = load();
  const sum = (f: (c: Claim) => boolean) => s.claims.filter(f).reduce((a, c) => a + c.amount, 0);
  return {
    recovered: sum((c) => c.status === "resolved"),
    pending: sum((c) => c.status === "found"),
    inFlight: sum((c) => c.status === "approved" || c.status === "filed"),
    found: sum(() => true),
    count: s.claims.length,
  };
}

export async function sendSummary() {
  const t = totals();
  const missed = load().skipped.filter((s) => /window closed/.test(s.reason));
  const parts = [`What I've saved you: ${usd(t.recovered)} recovered so far.`];
  if (t.pending) parts.push(`${usd(t.pending)} is waiting on your OK.`);
  if (missed.length) parts.push(`${missed.length} missed: ${missed[0].merchantName} ${missed[0].reason.split(",")[0].toLowerCase()}, but the window had closed.`);
  parts.push(`All claims: ${config.baseUrl}/`);
  await sendText(parts.join(" "));
}
