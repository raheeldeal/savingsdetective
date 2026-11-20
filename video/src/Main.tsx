import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import timings from "./timings.json";

const C = { bg: "#f6f5f1", ink: "#16181d", ink2: "#4a4f59", ink3: "#80858f", accent: "#0f7b4f", soft: "#e3f3ea", line: "#e4e2da", sim: "#6d4bd8", dark: "#0d0f12" };
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif';
type Seg = keyof typeof timings.segments;

const useFade = (dur: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 200 } });
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * 24}px)`, ...style }}>{children}</div>;
};
const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.accent }) => (
  <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color }}>{children}</div>
);
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", top: 40, right: 48, fontSize: 20, fontWeight: 600, color: C.sim, background: "#efeafd", padding: "8px 16px", borderRadius: 999, letterSpacing: "0.04em" }}>{children}</div>
);

const Scene: React.FC<{ id: Seg; bg?: string; children: React.ReactNode }> = ({ id, bg = C.bg, children }) => {
  const s = timings.segments[id];
  return (
    <Sequence from={s.from} durationInFrames={s.frames}>
      {s.audio ? <Audio src={staticFile(s.audio)} /> : null}
      <Fader dur={s.frames} bg={bg}>{children}</Fader>
    </Sequence>
  );
};
const Fader: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const o = useFade(dur);
  return <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: C.ink }}><AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill></AbsoluteFill>;
};

const Title = () => (
  <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
    <Rise><div style={{ width: 96, height: 96, borderRadius: 24, background: C.ink, color: C.bg, display: "grid", placeItems: "center", fontSize: 56, fontWeight: 700 }}>$</div></Rise>
    <Rise delay={8}><div style={{ fontSize: 132, fontWeight: 750, letterSpacing: "-0.04em", marginTop: 36 }}>SavingsDetective</div></Rise>
    <Rise delay={18}><div style={{ fontSize: 48, color: C.ink2, marginTop: 12, maxWidth: 1300, lineHeight: 1.25 }}>Finds money merchants owe you. Claims it, with proof.</div></Rise>
  </AbsoluteFill>
);

const Problem = () => (
  <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
    <Rise><Eyebrow>The problem</Eyebrow></Rise>
    <Rise delay={10}><div style={{ fontSize: 92, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, marginTop: 24, maxWidth: 1500 }}>
      Refunds are promised. Almost nobody claims them.</div></Rise>
    <Rise delay={50}><div style={{ fontSize: 46, color: C.ink2, marginTop: 36, maxWidth: 1400, lineHeight: 1.3 }}>
      The households that lose the most have the <span style={{ color: C.accent, fontWeight: 650 }}>least time to chase fees</span>.</div></Rise>
  </AbsoluteFill>
);

const ITEMS = [
  ["Baby wipes", "$24.99", "Amazon", "Late delivery"],
  ["Heated blanket", "$46.99", "Target*", "Price drop"],
  ["Cast iron skillet", "$42.99", "Costco*", "Price drop"],
  ["Handheld vacuum", "$32.94", "Best Buy*", "Price drop"],
  ["Floor fan", "$54.99", "Target*", "Drop after window"],
  ["Coffee", "$32.98", "Corner Cart*", "Late delivery"],
];
const Data = () => (
  <AbsoluteFill style={{ padding: "110px 160px", display: "flex", flexDirection: "row", gap: 90, alignItems: "center" }}>
    <div style={{ flex: 1 }}>
      <Rise><Eyebrow>The data</Eyebrow></Rise>
      <Rise delay={8}><div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 20 }}>A family of 3. Income under $25,000.</div></Rise>
      <Rise delay={20}><div style={{ fontSize: 34, color: C.ink2, marginTop: 28, lineHeight: 1.4 }}>Real Amazon orders from Open E-commerce 1.0 (Berke et al., Harvard Dataverse). Service failures simulated on top.</div></Rise>
      <Rise delay={40}><div style={{ display: "flex", gap: 16, marginTop: 36 }}>
        <span style={{ fontSize: 28, fontWeight: 650, padding: "10px 22px", borderRadius: 999, background: C.soft, color: C.accent }}>Real purchases</span>
        <span style={{ fontSize: 28, fontWeight: 650, padding: "10px 22px", borderRadius: 999, background: "#efeafd", color: C.sim }}>Simulated failures</span>
      </div></Rise>
    </div>
    <div style={{ width: 760, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 28, padding: "12px 0", boxShadow: "0 20px 60px rgba(0,0,0,.06)" }}>
      {ITEMS.map(([n, p, m, k], i) => (
        <Rise key={n} delay={30 + i * 10}><div style={{ display: "flex", alignItems: "center", padding: "20px 32px", borderTop: i ? `1px solid ${C.line}` : "none", fontSize: 30 }}>
          <div style={{ flex: 1, fontWeight: 600 }}>{n}<div style={{ fontSize: 22, color: C.ink3, fontWeight: 400 }}>{m} · {k}</div></div><div style={{ fontVariantNumeric: "tabular-nums" }}>{p}</div>
        </div></Rise>
      ))}
      <div style={{ fontSize: 18, color: C.ink3, padding: "10px 32px 6px" }}>* merchant reassigned for the demo</div>
    </div>
  </AbsoluteFill>
);

const MSGS = [
  { at: 20, text: "Found: Amazon delivered your baby wipes 2h late. Their guarantee refunds the $9.95 fee. Approve: savingsdetective.local/c/clm_56456548", me: false },
  { at: 250, text: "Filed. Proof: savingsdetective.local/c/clm_56456548", me: false },
  { at: 360, text: "Amazon approved $9.95.", me: false },
  { at: 440, text: "What I've saved you: $17.90 recovered so far. $15.00 is waiting on your OK.", me: false },
];
const Thread = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tap = interpolate(f, [170, 185, 200], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 160px", gap: 120 }}>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>The UX is a text thread</Eyebrow></Rise>
        <Rise delay={10}><div style={{ fontSize: 80, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 20 }}>It texts you first.</div></Rise>
        <Rise delay={22}><div style={{ fontSize: 36, color: C.ink2, marginTop: 28, lineHeight: 1.4 }}>No app. A background agent sends an iMessage from your Mac when it finds money, then waits for one tap.</div></Rise>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14, fontSize: 30 }}>
          {[["Found", 20], ["You approve", 185], ["Filed", 250], ["Paid", 360]].map(([t, at]) => (
            <div key={t as string} style={{ opacity: f > (at as number) ? 1 : 0.25, display: "flex", alignItems: "center", gap: 14, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: f > (at as number) ? C.accent : C.line }} />{t}</div>))}
        </div>
      </div>
      {timings.hasPhoneClip ? (
        <div style={{ width: 520, height: 960, borderRadius: 60, overflow: "hidden", border: "14px solid #111" }}><OffthreadVideo src={staticFile("phone.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted /></div>
      ) : (
        <div style={{ width: 480, height: 940, background: "#fff", borderRadius: 64, border: "14px solid #111", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,.2)" }}>
          <div style={{ position: "absolute", top: 14, width: "100%", textAlign: "center", fontSize: 14, letterSpacing: "0.1em", color: "#999" }}>RECREATION</div>
          <div style={{ padding: "54px 0 14px", textAlign: "center", background: "#f7f7f7", borderBottom: "1px solid #e5e5ea" }}>
            <div style={{ width: 58, height: 58, borderRadius: 29, background: C.accent, color: "#fff", margin: "0 auto", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 700 }}>$</div>
            <div style={{ fontSize: 16, marginTop: 6 }}>SavingsDetective</div>
          </div>
          <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 }}>
            {MSGS.filter((m) => f >= m.at).map((m) => {
              const s = spring({ frame: f - m.at, fps, config: { damping: 18, stiffness: 160 } });
              return <div key={m.at} style={{ alignSelf: "flex-start", maxWidth: "84%", background: "#e9e9eb", padding: "12px 16px", borderRadius: 22, borderBottomLeftRadius: 6, overflowWrap: "anywhere", fontSize: 21, lineHeight: 1.3, transform: `scale(${0.85 + s * 0.15})`, transformOrigin: "bottom left", opacity: s }}>{m.text}</div>;
            })}
          </div>
          <div style={{ position: "absolute", left: 120, top: 640, width: 80, height: 80, borderRadius: 40, background: "rgba(10,132,255,.35)", opacity: tap, transform: `scale(${0.6 + tap * 0.6})` }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const Audit = () => {
  const f = useCurrentFrame(); const dur = timings.segments.audit.frames;
  const y = interpolate(f, [50, dur - 30], [0, -4229], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const notes: [number, string][] = [[0, "The amount and why"], [90, "The exact clause, with its source"], [180, "The evidence"], [250, "The merchant conversation"], [320, "Every step, timestamped"]];
  const current = [...notes].reverse().find(([at]) => f >= at)![1];
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 160px", gap: 120 }}>
      <Label>Real screenshots</Label>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>The audit trail</Eyebrow></Rise>
        <Rise delay={10}><div style={{ fontSize: 80, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 20 }}>Every claim has a receipt.</div></Rise>
        <div style={{ fontSize: 44, color: C.accent, fontWeight: 650, marginTop: 40, minHeight: 60 }}>{current}</div>
        <Rise delay={300}><div style={{ fontSize: 32, color: C.ink2, marginTop: 30, lineHeight: 1.4 }}>Rules decide the money. The model only writes the message.</div></Rise>
      </div>
      <div style={{ width: 520, height: 940, borderRadius: 48, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: "0 40px 100px rgba(0,0,0,.15)", background: "#fff" }}>
        <Img src={staticFile("claim-light.png")} style={{ width: 520, transform: `translateY(${y}px)` }} />
      </div>
    </AbsoluteFill>
  );
};

const Index = () => (
  <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 80 }}>
    <Label>Real screenshots</Label>
    <Rise><Img src={staticFile("index-light.png")} style={{ width: 460, height: 900, objectFit: "cover", objectPosition: "top", borderRadius: 40, boxShadow: "0 40px 100px rgba(0,0,0,.15)" }} /></Rise>
    <Rise delay={20}><Img src={staticFile("index-dark.png")} style={{ width: 460, height: 900, objectFit: "cover", objectPosition: "top", borderRadius: 40, boxShadow: "0 40px 100px rgba(0,0,0,.3)" }} /></Rise>
    <Rise delay={40} style={{ width: 560 }}><Eyebrow>Light and dark, phone first</Eyebrow>
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 20 }}>Recovered, waiting, and missed.</div></Rise>
  </AbsoluteFill>
);

const Box: React.FC<{ x: number; y: number; w?: number; t: string; s?: string; d: number; tone?: "ink" | "accent" | "sim" }> = ({ x, y, w = 300, t, s, d, tone = "ink" }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f - d, fps, config: { damping: 200 } });
  const border = tone === "accent" ? C.accent : tone === "sim" ? C.sim : C.line;
  return <div style={{ position: "absolute", left: x, top: y, width: w, padding: "22px 24px", background: "#fff", border: `2px solid ${border}`, borderRadius: 22, opacity: k, transform: `scale(${0.92 + k * 0.08})`, boxShadow: "0 12px 30px rgba(0,0,0,.05)" }}>
    <div style={{ fontSize: 30, fontWeight: 650 }}>{t}</div>{s && <div style={{ fontSize: 21, color: C.ink3, marginTop: 4 }}>{s}</div>}</div>;
};
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; d: number }> = ({ x1, y1, x2, y2, d }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [d, d + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={C.ink3} strokeWidth={3} markerEnd={p > 0.95 ? "url(#a)" : undefined} />;
};
const Arch = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 160, top: 90 }}><Eyebrow>Architecture</Eyebrow></div>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={C.ink3} /></marker></defs>
      <Arrow x1={460} y1={330} x2={640} y2={330} d={30} />
      <Arrow x1={790} y1={400} x2={790} y2={520} d={60} />
      <Arrow x1={940} y1={590} x2={1110} y2={590} d={90} />
      <Arrow x1={1260} y1={520} x2={1260} y2={410} d={120} />
      <Arrow x1={1260} y1={660} x2={1260} y2={780} d={150} />
      <Arrow x1={1110} y1={850} x2={940} y2={850} d={180} />
    </svg>
    <Box x={160} y={270} t="Orders" s="Open E-commerce 1.0 slice" d={10} />
    <Box x={640} y={270} t="Rule book" s="Senso · policies.json" d={40} />
    <Box x={640} y={530} t="Rule matcher" s="Deterministic · Superlinked rank" d={70} tone="accent" />
    <Box x={1110} y={280} t="iMessage" s="osascript · Messages.app" d={130} />
    <Box x={1110} y={530} t="Claim agent" s="Drafts with Claude or Arcee" d={100} tone="accent" />
    <Box x={1110} y={790} t="Simulated merchant" s="Firedrill crash tests" d={160} tone="sim" />
    <Box x={640} y={790} t="Audit page" s="Timeline · clause · proof" d={190} />
    <Box x={160} y={600} w={340} t="Memory + metrics" s="Cognee · Amplitude · Statsig" d={210} />
  </AbsoluteFill>
);

const TOOLS = [
  ["Senso", "Rule book of merchant policies"], ["Firedrill", "Hostile merchant reps, drill report"], ["Amplitude", "Claim lifecycle events"], ["Statsig", "Auto-approve under $5 flag"],
  ["Cognee", "Household memory"], ["Superlinked", "Ranks clauses against the order"], ["Guild AI", "Agent activity log"], ["Arcee", "Trinity drafts merchant messages"],
];
const Sponsors = () => (
  <AbsoluteFill style={{ padding: "110px 160px" }}>
    <Rise><Eyebrow>Sponsor tools</Eyebrow></Rise>
    <Rise delay={6}><div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 16 }}>Each one behind an adapter with a local fallback.</div></Rise>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 60 }}>
      {TOOLS.map(([n, d], i) => (
        <Rise key={n} delay={20 + i * 14}><div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 24, padding: "32px 28px", height: 200 }}>
          <div style={{ fontSize: 38, fontWeight: 700 }}>{n}</div><div style={{ fontSize: 24, color: C.ink2, marginTop: 10, lineHeight: 1.35 }}>{d}</div></div></Rise>
      ))}
    </div>
  </AbsoluteFill>
);

const Honest = () => (
  <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
    <Rise><Eyebrow color={C.sim}>What is simulated</Eyebrow></Rise>
    <Rise delay={8}><div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, marginTop: 20, maxWidth: 1500 }}>The merchant is simulated. No real refund lands today. The audit trail is real.</div></Rise>
  </AbsoluteFill>
);

const Close = () => (
  <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px", color: "#f2f3f5" }}>
    <Rise><div style={{ fontSize: 64, fontWeight: 500, color: "#9aa0aa", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Instinct is a concierge for people who can afford one.</div></Rise>
    <Rise delay={70}><div style={{ fontSize: 84, fontWeight: 750, letterSpacing: "-0.035em", lineHeight: 1.1, marginTop: 30 }}>SavingsDetective is a collections agent for <span style={{ color: "#34c77b" }}>everyone else</span>.</div></Rise>
    <Rise delay={140}><div style={{ fontSize: 30, color: "#7f8691", marginTop: 60 }}>github.com/raheeldeal/savingsdetective</div></Rise>
  </AbsoluteFill>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Scene id="title"><Title /></Scene>
    <Scene id="problem"><Problem /></Scene>
    <Scene id="data"><Data /></Scene>
    <Scene id="thread"><Thread /></Scene>
    <Scene id="audit"><Audit /></Scene>
    <Scene id="index"><Index /></Scene>
    <Scene id="arch"><Arch /></Scene>
    <Scene id="sponsors"><Sponsors /></Scene>
    <Scene id="honest"><Honest /></Scene>
    <Scene id="close" bg={C.dark}><Close /></Scene>
  </AbsoluteFill>
);
