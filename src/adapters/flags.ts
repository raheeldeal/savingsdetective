// Feature flag: auto-approve small claims. Statsig when STATSIG_SERVER_KEY is set,
// env AUTO_APPROVE_SMALL_CLAIMS (default on) otherwise.
import { config, has } from "../config.ts";

export const flagEngine = () => (has("STATSIG_SERVER_KEY") ? "statsig" : "env");
const GATE = process.env.STATSIG_GATE || "auto_approve_small_claims";

export async function autoApproveSmallClaims(): Promise<boolean> {
  if (flagEngine() === "statsig") {
    try {
      const r = await fetch("https://api.statsig.com/v1/check_gate", {
        method: "POST", signal: AbortSignal.timeout(5000),
        headers: { "Content-Type": "application/json", "statsig-api-key": process.env.STATSIG_SERVER_KEY! },
        body: JSON.stringify({ gateName: GATE, user: { userID: config.userId } }),
      });
      if (!r.ok) throw new Error(`statsig ${r.status}`);
      const j: any = await r.json();
      return Boolean(j.value ?? j[GATE]?.value);
    } catch (e) { console.warn(`[statsig] ${(e as Error).message}; using env default`); }
  }
  return (process.env.AUTO_APPROVE_SMALL_CLAIMS ?? "true") !== "false";
}
