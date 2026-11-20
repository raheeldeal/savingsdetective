// Tiny audit-page server. No framework: node:http and string templates.
import http from "node:http";
import fs from "node:fs";
import { config } from "../config.ts";
import { load, getClaim } from "../store.ts";
import { approveClaim, sendSummary } from "../agent.ts";
import { agentReply } from "../negotiator.ts";
import { indexPage, claimPage, phonePage } from "./views.ts";

const drills = new Map<string, { at: string; merchant: string; agent: string }[]>();

function send(res: http.ServerResponse, code: number, body: string, type = "text/html; charset=utf-8") {
  res.writeHead(code, { "content-type": type, "cache-control": "no-store" }); res.end(body);
}
const body = (req: http.IncomingMessage) => new Promise<string>((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b)); });

export function startServer(): Promise<http.Server> {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://x");
      const p = url.pathname;
      if (req.method === "GET" && p === "/") return send(res, 200, indexPage());
      if (req.method === "GET" && p === "/phone") return send(res, 200, phonePage());
      if (req.method === "GET" && p === "/api/state") return send(res, 200, JSON.stringify(load(), null, 2), "application/json");
      if (req.method === "GET" && p === "/api/drills") return send(res, 200, JSON.stringify(Object.fromEntries(drills), null, 2), "application/json");
      let m = p.match(/^\/c\/(clm_[a-f0-9]+)$/);
      if (req.method === "GET" && m) { const c = getClaim(m[1]); return c ? send(res, 200, claimPage(c)) : send(res, 404, "Claim not found"); }
      m = p.match(/^\/api\/claims\/(clm_[a-f0-9]+)$/);
      if (req.method === "GET" && m) { const c = getClaim(m[1]); return c ? send(res, 200, JSON.stringify(c, null, 2), "application/json") : send(res, 404, "{}", "application/json"); }
      m = p.match(/^\/c\/(clm_[a-f0-9]+)\/approve$/);
      if (req.method === "POST" && m) {
        const id = m[1];
        // Respond right away; filing runs in the background and the page refreshes itself.
        res.writeHead(303, { location: `/c/${id}` }); res.end();
        approveClaim(id).then(() => sendSummary()).catch((e) => console.error("[approve]", e));
        return;
      }
      // Firedrill http.v1 driver: Firedrill plays merchant support, we answer as the agent.
      if (req.method === "POST" && p === "/firedrill") {
        const j = JSON.parse((await body(req)) || "{}");
        const claims = load().claims;
        const claim = claims.find((c) => c.id === process.env.FIREDRILL_CLAIM_ID) ?? claims[0];
        if (!claim) return send(res, 200, JSON.stringify({ reply: "No open claim yet. Run npm run demo first." }), "application/json");
        const r = agentReply(claim, String(j.message ?? ""));
        const key = String(j.session ?? "default");
        drills.set(key, [...(drills.get(key) ?? []), { at: new Date().toISOString(), merchant: String(j.message ?? ""), agent: r.text }]);
        fs.mkdirSync("data/state", { recursive: true }); fs.writeFileSync("data/state/drills.json", JSON.stringify(Object.fromEntries(drills), null, 2));
        return send(res, 200, JSON.stringify({ reply: r.text, done: r.done, claim: claim.id }), "application/json");
      }
      if (p === "/healthz") return send(res, 200, "ok", "text/plain");
      send(res, 404, "Not found", "text/plain");
    } catch (e) { console.error(e); send(res, 500, "Server error", "text/plain"); }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, "0.0.0.0", () => { console.log(`[web] audit pages at ${config.baseUrl}/ (also http://localhost:${config.port}/)`); resolve(server); });
  });
}

if (import.meta.main) startServer();
