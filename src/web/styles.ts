export const CSS = /* css */ `
:root{
  --bg:#f6f5f1; --surface:#ffffff; --surface-2:#f0efe9; --ink:#16181d; --ink-2:#4a4f59; --ink-3:#80858f;
  --line:#e4e2da; --accent:#0f7b4f; --accent-ink:#ffffff; --accent-soft:#e3f3ea; --warn:#a15c00; --warn-soft:#fbf0dc;
  --danger:#b4232a; --blue:#0a84ff; --bubble-in:#e9e9eb; --bubble-in-ink:#111; --sim:#6d4bd8; --sim-soft:#efeafd;
  --radius:16px; --shadow:0 1px 2px rgba(20,20,20,.04),0 8px 24px rgba(20,20,20,.05);
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --bg:#0d0f12; --surface:#15181d; --surface-2:#1c2027; --ink:#f2f3f5; --ink-2:#b5bac4; --ink-3:#7f8691;
  --line:#262b33; --accent:#34c77b; --accent-ink:#06110b; --accent-soft:#11291c; --warn:#f0b45a; --warn-soft:#2b2112;
  --danger:#ff6b6b; --bubble-in:#26282d; --bubble-in-ink:#f2f3f5; --sim:#a68cff; --sim-soft:#211a38; --shadow:none;
}}
:root[data-theme="dark"]{
  --bg:#0d0f12; --surface:#15181d; --surface-2:#1c2027; --ink:#f2f3f5; --ink-2:#b5bac4; --ink-3:#7f8691;
  --line:#262b33; --accent:#34c77b; --accent-ink:#06110b; --accent-soft:#11291c; --warn:#f0b45a; --warn-soft:#2b2112;
  --danger:#ff6b6b; --bubble-in:#26282d; --bubble-in-ink:#f2f3f5; --sim:#a68cff; --sim-soft:#211a38; --shadow:none;
}
*{box-sizing:border-box} html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit} .wrap{max-width:640px;margin:0 auto;padding:20px 16px 64px}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.brand{display:flex;align-items:center;gap:10px;font-weight:650;letter-spacing:-.01em;text-decoration:none}
.mark{width:28px;height:28px;border-radius:8px;background:var(--ink);color:var(--bg);display:grid;place-items:center;font-size:15px;font-weight:700}
.chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--surface-2);color:var(--ink-2);white-space:nowrap}
.chip.sim{background:var(--sim-soft);color:var(--sim)} .chip.ok{background:var(--accent-soft);color:var(--accent)} .chip.warn{background:var(--warn-soft);color:var(--warn)}
.dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.hero{padding:8px 0 24px}
.eyebrow{font-size:13px;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px}
.big{font-size:56px;line-height:1;font-weight:700;letter-spacing:-.035em;margin:0;font-variant-numeric:tabular-nums}
.big small{font-size:22px;color:var(--ink-3);font-weight:600;letter-spacing:-.01em}
.sub{color:var(--ink-2);margin:10px 0 0;font-size:15px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0 8px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px}
.stat b{display:block;font-size:18px;font-variant-numeric:tabular-nums;letter-spacing:-.01em} .stat span{font-size:12px;color:var(--ink-3)}
h2{font-size:13px;font-weight:650;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em;margin:32px 0 10px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
.list a{display:flex;gap:12px;align-items:center;padding:14px 16px;text-decoration:none;border-top:1px solid var(--line)}
.list a:first-child{border-top:0}
.logo{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;font-weight:700;font-size:15px;flex:none;color:#fff}
.m-amazon{background:#232f3e}.m-bestbuy{background:#0046be}.m-costco{background:#e31837}.m-target{background:#cc0000}.m-cornercart{background:#2f7d5b}
.grow{flex:1;min-width:0} .t1{font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .t2{font-size:13px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.amt{font-weight:650;font-variant-numeric:tabular-nums;text-align:right} .amt .chip{margin-top:4px}
.skip{padding:12px 16px;border-top:1px solid var(--line);font-size:14px} .skip:first-child{border-top:0} .skip .t2{white-space:normal}
.claim-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.headline{font-size:22px;line-height:1.3;font-weight:650;letter-spacing:-.015em;margin:12px 0 0}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:22px 0 6px}
.step{height:4px;border-radius:4px;background:var(--line)} .step.on{background:var(--accent)}
.steplabels{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:12px;color:var(--ink-3)} .steplabels .on{color:var(--ink);font-weight:600}
.cta{margin:20px 0 4px;display:flex;flex-direction:column;gap:8px}
button.primary{appearance:none;border:0;border-radius:14px;padding:16px 18px;font:inherit;font-weight:650;font-size:17px;background:var(--accent);color:var(--accent-ink);cursor:pointer;width:100%}
button.primary:disabled{opacity:.6}
.fine{font-size:13px;color:var(--ink-3);margin:0}
.section{padding:16px}
blockquote{margin:0;padding:14px 16px;border-left:3px solid var(--accent);background:var(--surface-2);border-radius:0 12px 12px 0;font-size:15px}
.src{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;font-size:13px;color:var(--ink-3)}
.src a{color:var(--ink-2);word-break:break-all}
dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:0} dt,dd{padding:10px 16px;border-top:1px solid var(--line);margin:0;font-size:14px}
dt{color:var(--ink-3)} dd{text-align:right;font-variant-numeric:tabular-nums} dl > :nth-child(-n+2){border-top:0}
.chat{padding:16px;display:flex;flex-direction:column;gap:6px}
.who{font-size:11px;color:var(--ink-3);margin:8px 4px 0;text-transform:uppercase;letter-spacing:.05em}
.b{max-width:82%;padding:9px 13px;border-radius:18px;font-size:15px;line-height:1.35;word-wrap:break-word}
.b.in{align-self:flex-start;background:var(--bubble-in);color:var(--bubble-in-ink);border-bottom-left-radius:6px}
.b.out{align-self:flex-end;background:var(--blue);color:#fff;border-bottom-right-radius:6px}
.who.out{align-self:flex-end}
.tl{list-style:none;margin:0;padding:8px 16px 16px}
.tl li{position:relative;padding:10px 0 10px 22px;border-left:1px solid var(--line);margin-left:5px}
.tl li::before{content:"";position:absolute;left:-6px;top:15px;width:11px;height:11px;border-radius:50%;background:var(--surface);border:2px solid var(--ink-3)}
.tl li.user::before{border-color:var(--blue)} .tl li.merchant::before{border-color:var(--sim)} .tl li.done::before{background:var(--accent);border-color:var(--accent)}
.tl .when{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums} .tl .what{font-weight:600;font-size:14px} .tl .det{font-size:13px;color:var(--ink-2);word-break:break-word}
.prov{padding:4px 16px 12px} .prov p{margin:10px 0 0;font-size:14px;display:flex;gap:10px;align-items:flex-start} .prov p .chip{flex:none}
.foot{margin-top:40px;font-size:13px;color:var(--ink-3);text-align:center}
.foot a{color:var(--ink-2)}
code{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--surface-2);padding:2px 6px;border-radius:6px}
.thread{padding:16px;display:flex;flex-direction:column;gap:6px}
.thread .b{background:var(--bubble-in);color:var(--bubble-in-ink);align-self:flex-start;border-bottom-left-radius:6px}
.thread .meta{font-size:11px;color:var(--ink-3);margin:6px 4px 0}
@media (min-width:700px){ .big{font-size:72px} .wrap{padding-top:40px} }
`;
