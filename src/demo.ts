// npm run demo: one full pass right now, then keep the audit pages up so the links in the texts work.
// Flags: --fresh clears old claims first. --approve-all approves every claim (for recordings). --exit quits after the pass.
import { runPass, approveClaim, sendSummary } from "./agent.ts";
import { startServer } from "./web/server.ts";
import { reset, load } from "./store.ts";
import { status } from "./status.ts";
import { flushEvents } from "./instrumentation/analytics.ts";

const args = new Set(process.argv.slice(2));
if (args.has("--fresh")) reset();
status();
let server = null;
if (!args.has("--exit")) server = await startServer().catch(() => { console.log("[web] port busy, assuming `npm run web` is already serving"); return null; });
await runPass();
if (args.has("--approve-all")) {
  for (const c of load().claims.filter((c) => c.status === "found")) await approveClaim(c.id, "you (demo --approve-all)");
  await sendSummary();
}
await flushEvents();
if (args.has("--exit") || !server) process.exit(0);
console.log("Audit pages stay up. Approve claims there. Ctrl+C to stop.");
