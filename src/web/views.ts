import { CSS } from "./styles.ts";
import { load } from "../store.ts";
import { totals } from "../agent.ts";
import { loadOrders } from "../orders.ts";
import type { Claim } from "../types.ts";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const linkify = (s: string) => esc(s).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1">$1</a>');
const usd = (n: number) => `$${n.toFixed(2)}`;
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const LOGO: Record<string, string> = { amazon: "a", bestbuy: "BB", costco: "C", target: "T", cornercart: "CC" };
const STATUS: Record<string, [string, string]> = {
  found: ["Needs your OK", "warn"], approved: ["Approved", ""], filed: ["Filed", ""], resolved: ["Recovered", "ok"], denied: ["Denied", "warn"],
};

function page(title: string, body: string, extra = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="theme-color" content="#0f7b4f"><style>${CSS}</style>${extra}</head>
<body><div class="wrap">
<header class="top"><a class="brand" href="/"><span class="mark">$</span>SavingsDetective</a><span class="chip sim"><span class="dot"></span>Simulated merchant</span></header>
${body}
<p class="foot">Real purchases from <a href="https://doi.org/10.7910/DVN/YGLYDY">Open E-commerce 1.0</a>. Service failures and merchant replies are simulated.<br>No real merchant was contacted.</p>
</div></body></html>`;
}

const logo = (m: string) => `<span class="logo m-${esc(m)}">${LOGO[m] ?? "?"}</span>`;
const status = (s: string) => { const [l, k] = STATUS[s] ?? [s, ""]; return `<span class="chip ${k}"><span class="dot"></span>${l}</span>`; };

export function indexPage() {
  const s = load();
  const t = totals();
  const { household } = loadOrders();
  const claims = [...s.claims].sort((a, b) => (a.status === "found" ? -1 : 0) - (b.status === "found" ? -1 : 0) || b.amount - a.amount);
  const rows = claims.map((c) => `<a href="/c/${c.id}">${logo(c.merchant)}<div class="grow"><div class="t1">${esc(c.merchantName)}</div><div class="t2">${esc(c.reason)}</div></div><div class="amt">${usd(c.amount)}<br>${status(c.status)}</div></a>`).join("");
  const skips = s.skipped.map((k) => `<div class="skip"><div class="t1">${esc(k.merchantName)}: ${esc(k.title.slice(0, 48))}</div><div class="t2">${esc(k.reason)}</div></div>`).join("");
  const outbox = s.outbox.slice(-12).map((m) => `<div class="meta">${when(m.at)} · ${esc(m.delivered)}</div><div class="b">${linkify(m.text)}</div>`).join("");
  return page("SavingsDetective", `
<section class="hero">
  <p class="eyebrow">Recovered for your household</p>
  <p class="big">${usd(t.recovered)}</p>
  <p class="sub">Household of ${household.size}, ${esc(household.state)}, income ${esc(household.income.toLowerCase())}. ${s.runs.length} ${s.runs.length === 1 ? "check" : "checks"} run, last ${s.runs.length ? when(s.runs.at(-1)!.at) : "never"}.</p>
  <div class="stats"><div class="stat"><b>${usd(t.found)}</b><span>Found</span></div><div class="stat"><b>${usd(t.pending)}</b><span>Needs your OK</span></div><div class="stat"><b>${t.count}</b><span>Claims</span></div></div>
</section>
<h2>Claims</h2><div class="card list">${rows || '<div class="skip"><div class="t2">No claims yet. Run <code>npm run demo</code>.</div></div>'}</div>
<h2>Checked, nothing owed</h2><div class="card">${skips || '<div class="skip"><div class="t2">Nothing yet.</div></div>'}</div>
<h2>Texts sent to you</h2><div class="card thread">${outbox || '<div class="t2">No texts yet.</div>'}</div>`, `<meta http-equiv="refresh" content="${claims.some((c) => c.status === "approved" || c.status === "filed") ? 2 : 30}">`);
}

export function claimPage(c: Claim) {
  const order = ["found", "approved", "filed", "resolved"];
  const idx = c.status === "denied" ? 3 : order.indexOf(c.status);
  const steps = order.map((_, i) => `<div class="step ${i <= idx ? "on" : ""}"></div>`).join("");
  const labels = ["Found", "Approved", "Filed", "Recovered"].map((l, i) => `<span class="${i === idx ? "on" : ""}">${l}</span>`).join("");
  const cta = c.status === "found"
    ? `<form class="cta" method="post" action="/c/${c.id}/approve" onsubmit="this.querySelector('button').disabled=true;this.querySelector('button').textContent='Filing...'"><button class="primary" type="submit">Approve and file ${usd(c.amount)}</button><p class="fine">SavingsDetective will message ${esc(c.merchantName)} support (simulated) and cite the clause below. Deadline ${new Date(c.deadline).toDateString()}.</p></form>`
    : c.status === "resolved" ? `<p class="fine" style="margin-top:16px">${c.autoApproved ? "Auto-approved because it was under the small-claim limit. " : ""}${esc(c.merchantName)} approved ${usd(c.amount)} back to the original payment method (simulated).</p>`
    : `<p class="fine" style="margin-top:16px">Working on it. This page refreshes.</p>`;
  const evidence = c.evidence.map((e) => `<dt>${esc(e.label)}</dt><dd>${esc(e.value)}</dd>`).join("");
  const chat = c.transcript.length
    ? c.transcript.map((t, i) => { const out = t.from === "agent"; const prev = c.transcript[i - 1]; const head = !prev || prev.from !== t.from ? `<div class="who ${out ? "out" : ""}">${out ? "SavingsDetective" : esc(c.merchantName) + " support (simulated)"}</div>` : ""; return `${head}<div class="b ${out ? "out" : "in"}">${linkify(t.text)}</div>`; }).join("")
    : `<div class="who">Drafted message (${esc(c.draft.engine)})</div><div class="b out">${linkify(c.draft.text)}</div><p class="fine" style="margin-top:8px">Not sent yet. It goes out when you approve.</p>`;
  const tl = [...c.timeline].reverse().map((e) => `<li class="${e.actor} ${e.kind === "resolved" ? "done" : ""}"><div class="when">${when(e.at)} · ${esc(e.actor)}</div><div class="what">${esc(e.title)}</div>${e.detail ? `<div class="det">${linkify(e.detail)}</div>` : ""}</li>`).join("");
  const ranks = c.rerank.candidates.map((r) => `${esc(r.id)} <b>${r.score.toFixed(3)}</b>`).join(" · ");
  return page(`${c.merchantName} ${usd(c.amount)} · SavingsDetective`, `
<section class="hero">
  <div class="claim-head">${logo(c.merchant)}<div class="grow"><div class="t1">${esc(c.merchantName)}</div><div class="t2">Order ${esc(c.orderId)} · ${esc(c.order.title.slice(0, 60))}</div></div>${status(c.status)}</div>
  <p class="big">${usd(c.amount)}</p>
  <p class="headline">${esc(c.headline)}</p>
  <div class="steps">${steps}</div><div class="steplabels">${labels}</div>
  ${cta}
</section>
<h2>Why you're owed</h2>
<div class="card section"><blockquote>${esc(c.policy.clause)}</blockquote>
<div class="src"><span class="chip ${c.policy.verified ? "ok" : "warn"}"><span class="dot"></span>${c.policy.verified ? "Clause checked at source" : "Paraphrased, check source"}</span><span>${esc(c.policy.title)} · ${c.policy.windowDays}-day window</span></div>
<div class="src"><a href="${esc(c.policy.sourceUrl)}">${esc(c.policy.sourceUrl)}</a></div>
<div class="src">${esc(c.policy.verifiedNote)}</div>
<div class="src">Rule book: ${c.policySource === "senso" ? "Senso" : "local policies.json"} · Clause ranking (${esc(c.rerank.engine)}): ${ranks}</div></div>
<h2>Evidence</h2><div class="card"><dl>${evidence}</dl></div>
<h2>Merchant conversation <span class="chip sim" style="margin-left:6px;vertical-align:1px"><span class="dot"></span>Simulated</span></h2><div class="card chat">${chat}</div>
<h2>Audit trail</h2><div class="card"><ol class="tl">${tl}</ol></div>
<h2>Where this data came from</h2><div class="card prov">
<p><span class="chip ok">Real</span><span>${esc(c.provenance.item)}. Item and ASIN ${esc(c.order.asin)} are from the dataset.</span></p>
<p><span class="chip ${c.merchant === "amazon" ? "ok" : "sim"}">${c.merchant === "amazon" ? "Real" : "Simulated"}</span><span>${esc(c.provenance.merchant)}.</span></p>
<p><span class="chip sim">Simulated</span><span>${esc(c.provenance.failure)}.</span></p>
<p><span class="chip">Raw</span><span><a href="/api/claims/${c.id}">Full claim record as JSON</a></span></p></div>`,
    c.status === "approved" || c.status === "filed" ? `<meta http-equiv="refresh" content="2">` : "");
}

/** A recreation of the iMessage thread for screenshots and the video. Labelled as such. */
export function phonePage() {
  const s = load();
  // One claim's thread (Found, Filed, Approved) plus the latest savings summary.
  const c = s.claims.find((x) => x.merchant === "amazon") ?? s.claims[0];
  const summary = [...s.outbox].reverse().find((m) => m.text.startsWith("What I've saved"));
  const list = c ? [c.messages[0], ...c.messages.slice(1), summary].filter(Boolean) as { text: string }[] : s.outbox.slice(-6);
  const msgs = list.map((m) => `<div class="pb">${linkify(m.text)}</div>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>iMessage recreation</title><style>
body{margin:0;background:transparent;font:16px/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}
.phone{width:390px;height:780px;background:#fff;border-radius:54px;border:12px solid #111;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.25);position:relative}
.bar{padding:46px 16px 10px;text-align:center;border-bottom:1px solid #e5e5ea;background:#f7f7f7}
.av{width:44px;height:44px;border-radius:50%;background:#0f7b4f;color:#fff;margin:0 auto 4px;display:grid;place-items:center;font-weight:700;font-size:20px}
.nm{font-size:12px;color:#111} .msgs{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;justify-content:flex-end;font-size:16px;line-height:1.3}
.pb{align-self:flex-start;background:#e9e9eb;color:#111;padding:9px 13px;border-radius:19px;border-bottom-left-radius:6px;max-width:80%;word-wrap:break-word}
.pb a{color:#0a64d8} .lbl{position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#888}
</style></head><body><div class="phone"><div class="lbl">Recreation</div><div class="bar"><div class="av">$</div><div class="nm">SavingsDetective</div></div><div class="msgs">${msgs}</div></div></body></html>`;
}
