// Renders README and video images from the running audit server (npm run web).
// Usage: node scripts/screenshots.ts [baseUrl]
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? `http://localhost:${process.env.PORT || 4747}`;
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = path.resolve("docs");
fs.mkdirSync(out, { recursive: true });

const state = await (await fetch(`${base}/api/state`)).json();
const byMerchant = (m: string) => state.claims.find((c: any) => c.merchant === m);
const amazon = byMerchant("amazon");
const resolved = state.claims.find((c: any) => c.status === "resolved" && c.transcript.length >= 6) ?? state.claims.find((c: any) => c.status === "resolved");

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });
async function shot(url: string, file: string, opts: { w?: number; h?: number; dark?: boolean; full?: boolean } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: opts.w ?? 390, height: opts.h ?? 844, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: opts.dark ? "dark" : "light" }]);
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(out, file), fullPage: opts.full ?? false, omitBackground: file.startsWith("imessage") });
  await page.close();
  console.log("wrote docs/" + file);
}

await shot(`${base}/`, "index-light.png", { full: true });
await shot(`${base}/`, "index-dark.png", { dark: true });
if (amazon) { await shot(`${base}/c/${amazon.id}`, "claim-light.png", { full: true }); await shot(`${base}/c/${amazon.id}`, "claim-dark.png", { dark: true, full: true }); await shot(`${base}/c/${amazon.id}`, "claim-top.png"); }
if (resolved) await shot(`${base}/c/${resolved.id}`, "claim-resolved.png", { full: true });
await shot(`${base}/phone`, "imessage-recreation.png", { w: 460, h: 860 });

// Hero: phone recreation next to the audit page, as one image.
const img = (f: string) => `data:image/png;base64,${fs.readFileSync(path.join(out, f)).toString("base64")}`;
const hero = `<!doctype html><html><body style="margin:0;width:1280px;height:720px;background:linear-gradient(135deg,#f6f5f1,#e3f3ea);display:flex;align-items:center;justify-content:center;gap:56px;font-family:-apple-system,system-ui,sans-serif">
<div style="width:380px"><div style="font-size:15px;font-weight:600;color:#0f7b4f;letter-spacing:.06em;text-transform:uppercase">SavingsDetective</div>
<div style="font-size:44px;line-height:1.08;font-weight:700;letter-spacing:-.03em;color:#16181d;margin-top:12px">Finds money merchants owe you. Claims it, with proof.</div>
<div style="font-size:17px;color:#4a4f59;margin-top:16px;line-height:1.45">It texts you when it finds a refund, waits for your OK, files the claim, and links the evidence.</div></div>
<img src="${img("imessage-recreation.png")}" style="height:640px">
<img src="${img("claim-top.png")}" style="height:640px;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.18)">
</body></html>`;
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
await page.setContent(hero, { waitUntil: "load" });
await page.screenshot({ path: path.join(out, "hero.png") });
console.log("wrote docs/hero.png");
await browser.close();
