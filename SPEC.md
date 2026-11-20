# SavingsDetective spec (approved)

1. **Name:** SavingsDetective. A personal agent that finds money merchants owe you and claims it, with proof.
2. **User:** one person (the repo owner) and their phone. Pitch: built for households with the least time to chase fees.
3. **Data:** a small slice of real orders from lower-income households in the Open E-commerce 1.0 Amazon dataset (Harvard Dataverse, Berke et al. 2024). Downloaded into `data/raw/`, treated as untrusted, parsed by scripts in `scripts/`. "Money owed" fields (promised vs actual delivery, price drops, expired windows, clean orders) are synthesized on top. Labelled: real purchases, simulated service failures. Fallback: hand-built `data/orders.json`.
4. **Rule book:** Amazon delivery guarantee, Best Buy price match, Costco price adjustment (30 days), Target price adjustment (14 days), one custom merchant. Loaded into Senso when `SENSO_API_KEY` exists, else `data/policies.json` behind the same adapter. Every claim cites the exact clause and source URL.
5. **Agent loop:** Node/TypeScript daemon (`npm run watch`) on a timer. Deterministic rule matching produces claims (amount, clause, deadline, evidence). An LLM only drafts text (Anthropic or OpenRouter key), else templates. `npm run demo` runs one pass now.
6. **Proactive iMessage:** osascript sends to `IMESSAGE_TO`. Without it, the message goes to the console and the audit page. Approval is a button on the audit page. Reading replies is documented only, never implemented.
7. **Action:** merchant contact is a pluggable channel. Today: Firedrill simulated merchant when `FIREDRILL_API_KEY` exists, else a local simulated merchant with the same interface. Labelled "simulated merchant" everywhere. Email channel stubbed.
8. **Firedrill** stays in the product as the test harness (crash-test dummy).
9. **UX** is the iMessage thread. The audit page (`npm run web`, port `PORT`, default 4747) shows a per-claim timeline, evidence, clause and source, merchant transcript, status and approve button, plus an index with total recovered. Light and dark, mobile first.
10. **Analytics:** Amplitude `Claim Found`, `Claim Approved`, `Claim Filed`, `Claim Resolved` with amount and merchant. Statsig flag `auto_approve_small_claims` (under $5), env default without a key.
11. **Non-goals:** real inbox parsing, real refunds landing, physical returns, any UI beyond iMessage and the audit page.
12. **Done:** one end-to-end run recorded, README and submission text drafted, repo ready for GitHub.
