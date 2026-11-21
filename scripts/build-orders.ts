// Builds data/orders.json: real items and prices from one lower-income household in
// Open E-commerce 1.0, with simulated service failures layered on top.
// The raw files are untrusted text. This script only parses them.
// Usage: node scripts/build-orders.ts data/raw/open-ecommerce
import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";

const dir = process.argv[2] ?? "data/raw/open-ecommerce";
const RESPONSE_ID = "R_3HigTq4itishziE"; // chosen by scripts/pick-household.ts
const WANT: Record<string, string> = {
  B07YYWVBQ8: "bestbuy_tv", B07JRBSPZ3: "amazon_late", B09ZPFGLYH: "target_drop", B076PR8LT5: "costco_drop",
  B08B6CJ9RT: "bestbuy_drop", B08M9BYMY8: "target_expired", B018LJZHVS: "corner_late",
  B09RTVN5GN: "amazon_clean", B08QRGPSVP: "amazon_clean2",
};

function parse(line: string, sep = ","): string[] {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === sep) { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur); return out;
}

const survey = fs.readFileSync(path.join(dir, "survey.tsv"), "utf8").split(/\r?\n/);
const h = parse(survey[0], "\t");
const row = survey.map((l) => parse(l, "\t")).find((r) => r[0] === RESPONSE_ID)!;
const household = {
  name: "Andy",
  responseId: RESPONSE_ID,
  income: row[h.indexOf("Q-demos-income")],
  size: Number(row[h.indexOf("Q-amazon-use-hh-size")]),
  state: row[h.indexOf("Q-demos-state")],
  source: "Open E-commerce 1.0 survey.csv (Berke et al., Harvard Dataverse, doi:10.7910/DVN/YGLYDY)",
};

const real = new Map<string, any>();
const rl = readline.createInterface({ input: fs.createReadStream(path.join(dir, "amazon-purchases.csv")) });
let first = true;
for await (const line of rl) {
  if (first) { first = false; continue; }
  const r = parse(line);
  if (r[7] !== RESPONSE_ID || !WANT[r[5]] || real.has(r[5]) || !r[0].startsWith("2022")) continue;
  real.set(r[5], { originalDate: r[0], price: Number(r[1]), qty: Number(r[2]), title: r[4], asin: r[5], category: r[6] });
}

// Demo clock: orders are re-dated relative to "today" so windows are live. Real price and title are kept.
const day = (n: number, hh = 12) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(hh, 0, 0, 0); return d.toISOString(); };
const sim: Record<string, any> = {
  bestbuy_tv: { merchant: "bestbuy", daysAgo: 10, pricePaid: 699, priceNow: 499, priceSeenAt: () => day(0, 9) },
  amazon_late: { merchant: "amazon", daysAgo: 2, shippingFee: 9.95, shippingType: "Guaranteed One-Day Delivery",
    promisedBy: () => day(1, 22), deliveredAt: () => { const d = new Date(day(1, 22)); d.setHours(d.getHours() + 2, 14); return d.toISOString(); } },
  target_drop: { merchant: "target", daysAgo: 6, priceNow: 39.99, priceSeenAt: () => day(0, 9) },
  costco_drop: { merchant: "costco", daysAgo: 12, priceNow: 34.99, priceSeenAt: () => day(0, 9) },
  bestbuy_drop: { merchant: "bestbuy", daysAgo: 4, priceNow: 27.99, priceSeenAt: () => day(0, 9) },
  target_expired: { merchant: "target", daysAgo: 19, priceNow: 44.99, priceSeenAt: () => day(0, 9) },
  corner_late: { merchant: "cornercart", daysAgo: 1, shippingFee: 0, shippingType: "2-hour grocery window",
    promisedBy: () => day(1, 18), deliveredAt: () => { const d = new Date(day(1, 18)); d.setMinutes(55); d.setHours(19); return d.toISOString(); } },
  amazon_clean: { merchant: "amazon", daysAgo: 9, shippingFee: 0, shippingType: "Standard",
    promisedBy: () => day(6, 22), deliveredAt: () => day(7, 15) },
  amazon_clean2: { merchant: "amazon", daysAgo: 15, shippingFee: 0, shippingType: "Standard",
    promisedBy: () => day(11, 22), deliveredAt: () => day(11, 13) },
};

const orders = Object.entries(WANT).map(([asin, key], i) => {
  const r = real.get(asin); const s = sim[key];
  if (!r) throw new Error(`missing real row for ${asin}`);
  return {
    id: `ord_${String(i + 1).padStart(2, "0")}`,
    merchant: s.merchant,
    title: r.title, asin: r.asin, category: r.category, price: s.pricePaid ?? r.price, qty: r.qty,
    orderedAt: day(s.daysAgo, 10),
    delivery: s.promisedBy ? { type: s.shippingType, fee: s.shippingFee, promisedBy: s.promisedBy(), deliveredAt: s.deliveredAt() } : null,
    priceCheck: s.priceNow ? { priceNow: s.priceNow, seenAt: s.priceSeenAt() } : null,
    provenance: {
      item: `Real purchase: Open E-commerce 1.0, household ${RESPONSE_ID}, ordered ${r.originalDate} on Amazon${s.pricePaid ? ` (dataset price $${r.price}; demo uses a simulated $${s.pricePaid} purchase price)` : ""}`,
      merchant: s.merchant === "amazon" ? "Real merchant" : "Simulated: merchant reassigned for the demo",
      failure: "Simulated service failure (delivery times, price changes and dates are synthetic)",
    },
  };
});

fs.writeFileSync("data/orders.json", JSON.stringify({ household, generatedAt: new Date().toISOString(), orders }, null, 2));
console.log(`wrote data/orders.json: ${orders.length} orders from household ${RESPONSE_ID} (${household.income})`);
