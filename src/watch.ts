// npm run watch: the background daemon. Checks orders on a timer and texts you when it finds money.
import { runPass } from "./agent.ts";
import { startServer } from "./web/server.ts";
import { config } from "./config.ts";
import { status } from "./status.ts";
import { flushEvents } from "./instrumentation/analytics.ts";

status();
await startServer().catch(() => console.log("[web] port busy, assuming `npm run web` is already serving"));
async function tick() {
  try { await runPass({ quiet: false }); await flushEvents(); } catch (e) { console.error("[watch]", e); }
}
await tick();
setInterval(tick, config.watchIntervalSec * 1000);
console.log(`[watch] checking every ${config.watchIntervalSec}s. Ctrl+C to stop.`);
