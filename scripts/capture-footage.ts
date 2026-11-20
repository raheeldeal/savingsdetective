// Records real footage of the audit page: open a pending claim, read it, tap Approve,
// watch it file and resolve, scroll the evidence and transcript. Needs `npm run web` running
// and at least one claim waiting for approval (`npm run demo -- --fresh --exit`).
// Usage: node scripts/capture-footage.ts [out.mp4], then convert to video/public/audit.mp4 with ffmpeg -c:v libx264 -pix_fmt yuv420p -r 30
import path from "node:path";
import puppeteer from "puppeteer-core";

const base = `http://localhost:${process.env.PORT || 4747}`;
const out = path.resolve(process.argv[2] ?? "video/public/audit-footage.mp4");
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const state = await (await fetch(`${base}/api/state`)).json();
const claim = state.claims.find((c: any) => c.status === "found");
if (!claim) { console.error("No pending claim. Run npm run demo -- --fresh --exit first."); process.exit(1); }

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
await page.goto(`${base}/c/${claim.id}`, { waitUntil: "networkidle0" });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const scrollTo = async (y: number, ms: number) => {
  await page.evaluate(async (y, ms) => {
    const start = scrollY; const t0 = performance.now();
    await new Promise<void>((done) => { const step = (t: number) => { const p = Math.min(1, (t - t0) / ms); const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2; scrollTo(0, start + (y - start) * e); p < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
  }, y, ms);
};
const recorder = await page.screencast({ path: out as `${string}.mp4` });
await wait(2500);
await scrollTo(620, 2200); await wait(2200);           // the clause and its source
await scrollTo(1050, 1600); await wait(1800);          // evidence
await scrollTo(0, 1500); await wait(800);
await page.click("button.primary");                    // approve
await wait(1200);
await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
await wait(3500);                                      // page refreshes through Filed to Recovered
await page.reload({ waitUntil: "networkidle0" });
await wait(1500);
const chatY = await page.evaluate(() => { const h = [...document.querySelectorAll("h2")].find((x) => x.textContent?.startsWith("Merchant")); return h ? h.getBoundingClientRect().top + scrollY - 20 : 1400; });
await scrollTo(chatY, 2200); await wait(3000);         // merchant conversation
const tlY = await page.evaluate(() => { const h = [...document.querySelectorAll("h2")].find((x) => x.textContent?.startsWith("Audit")); return h ? h.getBoundingClientRect().top + scrollY - 20 : 2400; });
await scrollTo(tlY, 2200); await wait(3000);           // audit trail
await recorder.stop();
await browser.close();
console.log(`wrote ${out} (claim ${claim.id})`);
