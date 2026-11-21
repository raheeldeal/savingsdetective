import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timings from "./timings.json";
import state from "./claims.json";
import drill from "./drill.json";

const C = { bg: "#f6f5f1", ink: "#16181d", ink2: "#4a4f59", ink3: "#80858f", accent: "#0f7b4f", soft: "#e3f3ea", line: "#e4e2da", sim: "#6d4bd8", simSoft: "#efeafd", dark: "#0d0f12", blue: "#0a84ff", warn: "#a15c00" };
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif';
type Seg = keyof typeof timings.segments;
const usd = (n: number) => `$${n.toFixed(2)}`;
const lead = state.claims.find((c: any) => c.amount === 200)!;
const T = timings.segments;

const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = spring({ frame: f - delay, fps, config: { damping: 200 } });
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * 24}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 180 } });
  return <div style={{ opacity: f < at ? 0 : 1, transform: `scale(${0.7 + 0.3 * s})`, ...style }}>{children}</div>;
};
const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.accent }) => <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color }}>{children}</div>;
const H: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 72 }) => <div style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 20 }}>{children}</div>;
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,.06)", ...style }}>{children}</div>;
const Badge: React.FC<{ size?: number }> = ({ size = 96 }) => <div style={{ width: size, height: size, borderRadius: size / 4, background: C.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: size * 0.58, fontWeight: 750, boxShadow: `0 0 ${size / 2}px rgba(15,123,79,.35)` }}>$</div>;

const Counter = () => {
  const f = useCurrentFrame();
  const landAt = T.enter.from + 420 + 2 * 95;
  const v = f < landAt ? 0 : interpolate(f, [landAt, landAt + 40], [0, 200], { extrapolateRight: "clamp" });
  const v2 = f > T.fight.from + 300 ? 207.95 : v;
  const dark = f >= T.close.from;
  return <div style={{ position: "absolute", top: 36, right: 48, fontFamily: FONT, background: dark ? "#1c2027" : "#fff", border: `1px solid ${dark ? "#262b33" : C.line}`, borderRadius: 999, padding: "10px 22px", fontSize: 24, color: dark ? "#f2f3f5" : C.ink, display: "flex", gap: 12, alignItems: "center", zIndex: 5 }}>
    <span style={{ color: C.ink3 }}>Recovered</span><b style={{ fontVariantNumeric: "tabular-nums", color: v2 > 0 ? "#34c77b" : undefined }}>{usd(v2)}</b></div>;
};

const Scene: React.FC<{ id: Seg; bg?: string; children: React.ReactNode }> = ({ id, bg = C.bg, children }) => {
  const s = T[id];
  return <Sequence from={s.from} durationInFrames={s.frames}><Audio src={staticFile(s.audio)} /><Fader dur={s.frames} bg={bg}>{children}</Fader></Sequence>;
};
const Fader: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: C.ink }}><AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill></AbsoluteFill>;
};

const Stat: React.FC<{ at: number; big: string; small: string; src: string }> = ({ at, big, small, src }) => (
  <Pop at={at}><Card style={{ padding: "28px 32px", width: 500 }}><div style={{ fontSize: 72, fontWeight: 750, letterSpacing: "-0.04em", color: C.accent }}>{big}</div><div style={{ fontSize: 26, lineHeight: 1.3, marginTop: 6 }}>{small}</div><div style={{ fontSize: 16, color: C.ink3, marginTop: 12 }}>{src}</div></Card></Pop>
);
const Pain = () => {
  const f = useCurrentFrame();
  const story = f > 300;
  return (
    <AbsoluteFill style={{ padding: "90px 120px" }}>
      {!story ? <>
        <Rise><Eyebrow color={C.warn}>The pain</Eyebrow><H>Money people are owed, and never see.</H></Rise>
        <div style={{ display: "flex", gap: 28, marginTop: 50 }}>
          <Stat at={20} big="37%" small="of US adults could not cover a $400 surprise expense with cash" src="Federal Reserve, SHED 2024" />
          <Stat at={110} big="48M" small="Americans had a package stolen last year, worth $7.7B" src="security.org package theft report, 2026" />
          <Stat at={200} big="$69k" small="median household income, Ohio. Andy's is lower." src="US Census ACS, 2023" />
        </div>
      </> : <>
        <Rise><Eyebrow>Meet Andy</Eyebrow><H>Dayton, Ohio. Two kids. Saved for months.</H></Rise>
        <div style={{ display: "flex", gap: 28, marginTop: 50 }}>
          <Pop at={330}><Card style={{ padding: 32, width: 520 }}><div style={{ fontSize: 24, color: C.ink3 }}>Best Buy</div><div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>27" TV, $699</div><div style={{ fontSize: 24, color: C.ink2, marginTop: 10 }}>Bought with months of savings.</div></Card></Pop>
          <Pop at={430}><Card style={{ padding: 32, width: 520, border: `2px solid ${C.warn}` }}><div style={{ fontSize: 24, color: C.ink3 }}>Two weeks later, at a friend's</div><div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>Same TV, $499</div><div style={{ fontSize: 24, color: C.warn, marginTop: 10, fontWeight: 650 }}>Gut punch. $200 gone.</div></Card></Pop>
          <Pop at={560}><Card style={{ padding: 32, width: 520 }}><div style={{ fontSize: 24, color: C.ink3 }}>Later that month</div><div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>Amazon, 2h late</div><div style={{ fontSize: 22, color: C.ink2, marginTop: 10 }}>$9.95 guaranteed fee. Stolen packages are the bigger version of the same problem.</div></Card></Pop>
        </div>
        <Rise delay={640}><div style={{ fontSize: 34, color: C.ink2, marginTop: 50 }}>Nobody told Andy he was owed anything.</div></Rise>
        <Pop at={700}><Card style={{ padding: "32px 40px", marginTop: 40, display: "flex", gap: 60, alignItems: "center", border: `2px solid ${C.warn}` }}>
          <div><div style={{ fontSize: 22, color: C.ink3 }}>Owed to Andy this month</div><div style={{ fontSize: 84, fontWeight: 750, letterSpacing: "-0.04em", color: C.warn }}>$209.95</div></div>
          <div><div style={{ fontSize: 22, color: C.ink3 }}>Claimed</div><div style={{ fontSize: 84, fontWeight: 750, letterSpacing: "-0.04em" }}>$0</div></div>
          <div style={{ fontSize: 24, color: C.ink2, lineHeight: 1.4, maxWidth: 640 }}>A household like Andy's placed 308 Amazon orders in a year. If 2 to 3 percent carry a claim, that is roughly $150 to $230 a year left on the table. Assumptions in docs/video-sources.md.</div>
        </Card></Pop>
      </>}
    </AbsoluteFill>
  );
};

const Enter = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ticks = ["Reads the merchant's written policy, so it knows what Andy is owed", "Texts Andy first. Acts only on his OK", "Leaves a receipt for every step"];
  const msgs = (lead.messages as any[]).map((m) => m.text.replace(/https?:\/\/\S+/g, "savingsdetective.local/c/…"));
  return (
    <AbsoluteFill style={{ padding: "90px 120px", flexDirection: "row", gap: 80, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <Rise><div style={{ display: "flex", gap: 24, alignItems: "center" }}><Badge /><div><Eyebrow>Enter</Eyebrow><div style={{ fontSize: 64, fontWeight: 750, letterSpacing: "-0.03em" }}>SavingsDetective</div></div></div></Rise>
        <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 22 }}>
          {ticks.map((t, i) => <Pop key={t} at={90 + i * 120} style={{ display: "flex", gap: 18, alignItems: "center", fontSize: 32 }}><span style={{ width: 48, height: 48, borderRadius: 24, background: C.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 800 }}>✓</span>{t}</Pop>)}
        </div>
      </div>
      <div style={{ width: 440, height: 820, marginTop: 110, background: "#fff", borderRadius: 60, border: "14px solid #111", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,.2)" }}>
        <div style={{ position: "absolute", top: 14, width: "100%", textAlign: "center", fontSize: 13, letterSpacing: "0.1em", color: "#999" }}>RECREATION</div>
        <div style={{ padding: "50px 0 12px", textAlign: "center", background: "#f7f7f7", borderBottom: "1px solid #e5e5ea" }}><div style={{ margin: "0 auto", width: 56 }}><Badge size={56} /></div><div style={{ fontSize: 15, marginTop: 6 }}>SavingsDetective</div></div>
        <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 }}>
          {msgs.map((m, i) => { const at = 420 + i * 95; if (f < at) return null; const s = spring({ frame: f - at, fps, config: { damping: 18, stiffness: 160 } });
            return <div key={i} style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#e9e9eb", padding: "12px 16px", borderRadius: 22, borderBottomLeftRadius: 6, fontSize: 21, lineHeight: 1.3, overflowWrap: "anywhere", opacity: s, transform: `scale(${0.85 + s * 0.15})`, transformOrigin: "bottom left" }}>{m}</div>; })}
          {f > 470 && f < 520 && <div style={{ position: "absolute", left: 180, top: 520, width: 70, height: 70, borderRadius: 35, background: "rgba(10,132,255,.35)" }} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LAYERS: [string, string, [string, boolean, boolean][]][] = [
  ["Interface", "iMessage thread", [["iMessage daemon", true, true]]],
  ["Agent loop", "npm run watch", [["Rule matcher", true, true], ["Anthropic (words only)", false, true], ["Arcee Trinity", false, false]]],
  ["Context", "policies and memory", [["Senso rule book", false, true], ["Superlinked rerank", false, false], ["Cognee memory", false, false]]],
  ["Trust gate", "human approval", [["Approval gate", true, true], ["Statsig auto-approve <$5", false, true]]],
  ["Action", "merchant channel", [["Simulated merchant", true, true], ["Firedrill crash test", false, true]]],
  ["Audit", "receipts", [["Audit page", true, true], ["Amplitude events", false, true]]],
];
const ORDER = ["Rule matcher", "Approval gate", "Audit page", "iMessage daemon", "Simulated merchant", "Senso rule book", "Firedrill crash test", "Amplitude events", "Statsig auto-approve <$5", "Anthropic (words only)", "Cognee memory", "Superlinked rerank"];
const Stack = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const at = (n: string) => { const i = ORDER.indexOf(n); return i < 0 ? 9999 : i < 5 ? 60 + i * 42 : 330 + (i - 5) * 115; };
  return (
    <AbsoluteFill style={{ padding: "70px 120px" }}>
      <Rise><Eyebrow>What we built</Eyebrow><H size={56}>Six layers. Our parts, then the sponsors.</H></Rise>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30 }}>
        {LAYERS.map(([name, sub, items]) => <div key={name} style={{ display: "flex", alignItems: "center", gap: 24, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: "14px 24px" }}>
          <div style={{ width: 230 }}><div style={{ fontSize: 26, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 18, color: C.ink3 }}>{sub}</div></div>
          {items.map(([n, ours, live]) => { const a = at(n); const s = spring({ frame: f - a, fps, config: { damping: 12, stiffness: 200 } }); const hot = f >= a && f < a + 60; const glow = hot ? interpolate(f, [a, a + 60], [1, 0]) : 0;
            return <div key={n} style={{ padding: "12px 20px", borderRadius: 14, fontSize: 24, fontWeight: 650, background: ours ? C.soft : C.simSoft, color: ours ? C.accent : C.sim, opacity: f < a ? 0.25 : 1, transform: `scale(${f < a ? 1 : 1 + 0.15 * (1 - Math.min(1, s)) + glow * 0.08})`, boxShadow: `0 0 ${glow * 40}px rgba(15,123,79,${glow * .6})`, display: "flex", gap: 10, alignItems: "center" }}>{n}{!live && <span style={{ fontSize: 14, fontWeight: 600, background: "#fff", color: C.ink3, padding: "2px 8px", borderRadius: 999 }}>local fallback</span>}</div>; })}
        </div>)}
      </div>
    </AbsoluteFill>
  );
};

const Fight = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const turns = (lead.transcript as any[]).slice(2, 6);
  return (
    <AbsoluteFill style={{ padding: "80px 120px", flexDirection: "row", gap: 60 }}>
      <div style={{ width: 760 }}>
        <Rise><Eyebrow color={C.sim}>The merchant fight · simulated</Eyebrow><H size={54}>Offered a gift card. Took the cash.</H></Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 30 }}>
          {turns.map((t, i) => { const a = 40 + i * 70; if (f < a) return null; const s = spring({ frame: f - a, fps, config: { damping: 18, stiffness: 160 } }); const out = t.from === "agent";
            return <div key={i} style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: "88%", background: out ? C.blue : "#e9e9eb", color: out ? "#fff" : C.ink, padding: "12px 18px", borderRadius: 22, fontSize: 22, lineHeight: 1.3, opacity: s }}>{!out && <b>Jordan, Best Buy support: </b>}{t.text.replace(/\n+/g, " ").slice(0, 220)}</div>; })}
        </div>
        <Pop at={330}><Card style={{ padding: 22, marginTop: 24 }}><div style={{ fontSize: 18, fontWeight: 650, color: C.ink3, letterSpacing: ".06em" }}>CRASH TEST · {drill.length} HOSTILE REPS · {drill.length} PASSES</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{drill.map((d: string) => <span key={d} style={{ fontSize: 18, background: C.soft, color: C.accent, padding: "4px 12px", borderRadius: 999 }}>PASS {d.replace(/ \(.*\)/, "")}</span>)}</div></Card></Pop>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 420, height: 800, marginTop: 110, borderRadius: 44, overflow: "hidden", border: "12px solid #111", background: "#fff" }}><OffthreadVideo src={staticFile("audit.mp4")} muted startFrom={120} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} /></div>
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 60, fontSize: 18, color: C.accent, background: C.soft, padding: "6px 14px", borderRadius: 999, fontWeight: 600 }}>Real audit page footage</div>
    </AbsoluteFill>
  );
};

const Close = () => (
  <AbsoluteFill style={{ justifyContent: "center", padding: "0 120px", color: "#f2f3f5" }}>
    <Rise><div style={{ fontSize: 22, color: "#7f8691", marginBottom: 24 }}>Simulated in this demo: the merchants, the service failures, the $699 price. Real: the purchases, the clauses, the audit trail. SavingsDetective is its own personal agent today; it can live next to your other agents later.</div></Rise>
    <Rise delay={20}><div style={{ fontSize: 56, fontWeight: 500, color: "#9aa0aa", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Instinct is a concierge for people who can afford one.</div></Rise>
    <Rise delay={80}><div style={{ fontSize: 76, fontWeight: 750, letterSpacing: "-0.035em", lineHeight: 1.1, marginTop: 24 }}>SavingsDetective is a collections agent for <span style={{ color: "#34c77b" }}>everyone else</span>.</div></Rise>
    <Rise delay={140}><div style={{ fontSize: 28, color: "#7f8691", marginTop: 48 }}>github.com/raheeldeal/savingsdetective</div></Rise>
  </AbsoluteFill>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Scene id="pain"><Pain /></Scene>
    <Scene id="enter"><Enter /></Scene>
    <Scene id="stack"><Stack /></Scene>
    <Scene id="fight"><Fight /></Scene>
    <Scene id="close" bg={C.dark}><Close /></Scene>
    <Counter />
  </AbsoluteFill>
);
