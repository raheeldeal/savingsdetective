// Loads data/policies.json into your Senso knowledge base. Run once after adding SENSO_API_KEY.
import { local, policyText } from "../src/adapters/policies.ts";

const key = process.env.SENSO_API_KEY;
if (!key) {
  console.log("SENSO_API_KEY is not set. See USER_STEPS.md. The agent keeps using data/policies.json.");
  process.exit(0);
}
const base = process.env.SENSO_BASE_URL || "https://apiv2.senso.ai/api/v1";
for (const p of local) {
  const r = await fetch(`${base}/org/kb/raw`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": key },
    body: JSON.stringify({ title: `${p.merchantName}: ${p.title}`, text: policyText(p) }),
  });
  console.log(`${p.id}: ${r.status === 409 ? "already loaded" : r.status}`);
}
console.log("Done. The agent uses Senso automatically when SENSO_API_KEY is present.");
