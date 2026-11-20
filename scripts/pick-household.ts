// Reads the untrusted Open E-commerce 1.0 files as plain text. Executes nothing from them.
// Usage: node scripts/pick-household.ts data/raw/open-ecommerce
import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";

const dir = process.argv[2] ?? "data/raw/open-ecommerce";

function parseCsvLine(line: string, sep = ","): string[] {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === sep) { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur); return out;
}

const survey = fs.readFileSync(path.join(dir, "survey.tsv"), "utf8").split(/\r?\n/);
const head = parseCsvLine(survey[0], "\t");
const iId = head.indexOf("Survey ResponseID"), iInc = head.indexOf("Q-demos-income"), iHh = head.indexOf("Q-amazon-use-hh-size"), iState = head.indexOf("Q-demos-state");
const low = new Map<string, { income: string; hh: string; state: string }>();
const incomes = new Map<string, number>();
for (const l of survey.slice(1)) {
  if (!l.trim()) continue; const r = parseCsvLine(l, "\t");
  incomes.set(r[iInc], (incomes.get(r[iInc]) ?? 0) + 1);
  if (r[iInc] === "Less than $25,000" && Number(r[iHh]) >= 3) low.set(r[iId], { income: r[iInc], hh: r[iHh], state: r[iState] });
}
console.error("income brackets:", Object.fromEntries(incomes));
console.error("low-income households (hh>=3):", low.size);

const byId = new Map<string, any[]>();
const rl = readline.createInterface({ input: fs.createReadStream(path.join(dir, "amazon-purchases.csv")) });
let header: string[] | null = null;
for await (const line of rl) {
  if (!header) { header = parseCsvLine(line); continue; }
  const r = parseCsvLine(line); const id = r[7];
  if (!low.has(id) || !r[0].startsWith("2022")) continue;
  const price = Number(r[1]); if (!(price >= 8 && price <= 400) || !r[4]) continue;
  (byId.get(id) ?? byId.set(id, []).get(id)!).push({ date: r[0], price, qty: Number(r[2]), state: r[3], title: r[4], asin: r[5], category: r[6] });
}
// Pick the household with the most distinct everyday-essentials categories in 2022.
const ESSENTIAL = /DIAPER|BABY|GROCERY|FOOD|KITCHEN|CLEAN|DETERGENT|VACUUM|SHOES|PANTS|SHIRT|TOWEL|BLANKET|SHEET|BATTERY|HEALTH|VITAMIN|COOK|PAPER|POT|PAN|MICROWAVE|COFFEE|FAN|HEATER|BACKPACK|LAMP|BOTTLE|BLENDER|TOASTER|FRYER|STROLLER|CAR_SEAT/;
let best = ""; let bestN = 0;
for (const [id, rows] of byId) { const n = new Set(rows.filter((x) => ESSENTIAL.test(x.category)).map((x) => x.category)).size; if (n > bestN) { best = id; bestN = n; } }
const rows = byId.get(best)!.filter((x) => ESSENTIAL.test(x.category));
const seen = new Set<string>(); const pick: any[] = [];
for (const r of rows.sort((a, b) => b.price - a.price)) { if (seen.has(r.category)) continue; seen.add(r.category); pick.push(r); }
console.log(JSON.stringify({ responseId: best, ...low.get(best), orders2022: rows.length, items: pick.slice(0, 20) }, null, 2));
