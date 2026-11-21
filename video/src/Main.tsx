import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timings from "./timings.json";
import state from "./claims.json";
import ordersFile from "./orders.json";
import drill from "./drill.json";

const C = { bg: "#f6f5f1", ink: "#16181d", ink2: "#4a4f59", ink3: "#80858f", accent: "#0f7b4f", soft: "#e3f3ea", line: "#e4e2da", sim: "#6d4bd8", simSoft: "#efeafd", warn: "#a15c00", warnSoft: "#fbf0dc", dark: "#0d0f12", blue: "#0a84ff" };
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif';
type Seg = keyof typeof timings.segments;
const usd = (n: number) => `$${n.toFixed(2)}`;

const lead = state.claims.find((c: any) => c.amount === 120)!;
const amazon = state.claims.find((c: any) => c.merchant === "amazon")!;
const miss = state.skipped.find((s: any) => /window closed/.test(s.reason))!;
const summary = [...state.outbox].reverse().find((m: any) => m.text.startsWith("What I've saved"))!;
const recovered = state.claims.filter((c: any) => c.status === "resolved").reduce((a: number, c: any) => a + c.amount, 0) + state.claims.filter((c: any) => c.status === "found").reduce((a: number, c: any) => a + c.amount, 0);

const useFade = (dur: number) => { const f = useCurrentFrame(); return interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); };
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 200 } });
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * 24}px)`, ...style }}>{children}</div>;
};
const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.accent }) => <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color }}>{children}</div>;
const H: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 76 }) => <div style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: 20 }}>{children}</div>;
const Label: React.FC<{ children: React.ReactNode; tone?: "sim" | "ok" }> = ({ children, tone = "sim" }) => (
  <div style={{ position: "absolute", top: 40, right: 48, fontSize: 20, fontWeight: 600, color: tone === "sim" ? C.sim : C.accent, background: tone === "sim" ? C.simSoft : C.soft, padding: "8px 16px", borderRadius: 999, letterSpacing: "0.04em" }}>{children}</div>
);
const Chip: React.FC<{ children: React.ReactNode; tone?: "sim" | "ok" | "warn" }> = ({ children, tone = "ok" }) => {
  const m = { ok: [C.accent, C.soft], sim: [C.sim, C.simSoft], warn: [C.warn, C.warnSoft] }[tone];
  return <span style={{ fontSize: 22, fontWeight: 650, padding: "6px 16px", borderRadius: 999, background: m[1], color: m[0], whiteSpace: "nowrap" }}>{children}</span>;
};
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,.06)", ...style }}>{children}</div>;

const Scene: React.FC<{ id: Seg; bg?: string; children: React.ReactNode }> = ({ id, bg = C.bg, children }) => {
  const s = timings.segments[id];
  return <Sequence from={s.from} durationInFrames={s.frames}>{s.audio ? <Audio src={staticFile(s.audio)} /> : null}<Fader dur={s.frames} bg={bg}>{children}</Fader></Sequence>;
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

const M: Record<string, string> = { amazon: "Amazon", bestbuy: "Best Buy", costco: "Costco", target: "Target", cornercart: "Corner Cart" };
const Orders = () => {
  const f = useCurrentFrame();
  const hh = (ordersFile as any).household;
  return (
    <AbsoluteFill style={{ padding: "100px 160px", flexDirection: "row", gap: 80, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>1. The orders</Eyebrow></Rise>
        <Rise delay={8}><H>A family of {hh.size}. Income under $25,000.</H></Rise>
        <Rise delay={20}><div style={{ fontSize: 34, color: C.ink2, marginTop: 28, lineHeight: 1.4 }}>Real Amazon orders from Open E-commerce 1.0 (Berke et al., Harvard Dataverse). Nobody flagged anything.</div></Rise>
        <Rise delay={40}><div style={{ display: "flex", gap: 16, marginTop: 36 }}><Chip>Real purchases</Chip><Chip tone="sim">Simulated failures</Chip></div></Rise>
      </div>
      <Card style={{ width: 820, padding: "8px 0" }}>
        {(ordersFile as any).orders.map((o: any, i: number) => {
          const on = f > 60 + i * 12;
          return <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 32px", borderTop: i ? `1px solid ${C.line}` : "none", fontSize: 26, opacity: on ? 1 : 0.2 }}>
            <div style={{ width: 120, color: C.ink3, fontSize: 20 }}>{new Date(o.orderedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            <div style={{ flex: 1, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.title.split(/[,(]/)[0].slice(0, 46)}</div>
            <div style={{ width: 120, color: C.ink3, fontSize: 20 }}>{M[o.merchant]}</div>
            <div style={{ width: 110, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{usd(o.price)}</div>
          </div>;
        })}
      </Card>
    </AbsoluteFill>
  );
};

const Rulebook = () => {
  const f = useCurrentFrame();
  const show = (at: number) => interpolate(f, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rows = lead.evidence as { label: string; value: string }[];
  return (
    <AbsoluteFill style={{ padding: "100px 160px", flexDirection: "row", gap: 70, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>2. The rule book</Eyebrow></Rise>
        <Rise delay={8}><H>Read the policy. Run the numbers.</H></Rise>
        <div style={{ opacity: show(60), marginTop: 40 }}>
          <Card style={{ padding: 28 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}><Chip>Senso rule book</Chip><span style={{ color: C.ink3, fontSize: 22 }}>{lead.policy.title} · {lead.policy.windowDays}-day window</span></div>
            <div style={{ borderLeft: `6px solid ${C.accent}`, background: "#f0efe9", padding: "18px 22px", borderRadius: "0 16px 16px 0", fontSize: 30, lineHeight: 1.35 }}>{lead.policy.clause}</div>
            <div style={{ marginTop: 14, fontSize: 20, color: C.ink2, wordBreak: "break-all" }}>Source: {lead.policy.sourceUrl}</div>
          </Card>
        </div>
      </div>
      <div style={{ width: 700, marginTop: 130 }}>
        <Card style={{ padding: "8px 0" }}>
          <div style={{ padding: "16px 28px 8px", fontSize: 20, fontWeight: 650, color: C.ink3, letterSpacing: ".06em" }}>DETERMINISTIC CHECK · {lead.order.title.split(/[,(]/)[0]}</div>
          {rows.map((r, i) => <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "18px 28px", borderTop: `1px solid ${C.line}`, fontSize: 30, opacity: show(260 + i * 50) }}>
            <span style={{ color: C.ink3 }}>{r.label}</span><span style={{ fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>{r.value.replace(/ on .*| \(seen.*\)/, "")}</span></div>)}
          <div style={{ padding: "22px 28px", borderTop: `2px solid ${C.ink}`, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: show(480) }}>
            <span style={{ fontSize: 30, fontWeight: 650 }}>Owed</span><span style={{ fontSize: 64, fontWeight: 750, letterSpacing: "-0.03em", color: C.accent }}>{usd(lead.amount)}</span></div>
        </Card>
        <div style={{ marginTop: 18, fontSize: 24, color: C.ink2, opacity: show(560) }}>Rules decide the money. The model only writes the message.</div>
      </div>
    </AbsoluteFill>
  );
};

const Negative = () => (
  <AbsoluteFill style={{ padding: "100px 160px", justifyContent: "center" }}>
    <Rise><Eyebrow color={C.warn}>3. It also says no</Eyebrow></Rise>
    <Rise delay={8}><H>Target dropped the price $10. The agent did not file.</H></Rise>
    <Rise delay={60}><Card style={{ padding: 36, marginTop: 44, maxWidth: 1300, display: "flex", gap: 28, alignItems: "flex-start" }}>
      <Chip tone="warn">Checked, nothing owed</Chip>
      <div><div style={{ fontSize: 34, fontWeight: 650 }}>{miss.merchantName}: {miss.title.split(/[,(]/)[0]}</div><div style={{ fontSize: 30, color: C.ink2, marginTop: 10, lineHeight: 1.4 }}>{miss.reason}</div></div>
    </Card></Rise>
    <Rise delay={200}><div style={{ fontSize: 30, color: C.ink2, marginTop: 36 }}>Misses are recorded next to wins, with the reason, on the same page.</div></Rise>
  </AbsoluteFill>
);

const Transcript = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const turns = (lead.transcript as any[]).slice(0, 6);
  const split = 440;
  return (
    <AbsoluteFill style={{ padding: "90px 160px", flexDirection: "row", gap: 70 }}>
      <Label>Simulated merchant</Label>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>4. The conversation</Eyebrow></Rise>
        <Rise delay={8}><H size={64}>Offered a gift card. Took the cash.</H></Rise>
        <div style={{ marginTop: 44, opacity: f > split ? 1 : 0 }}>
          <Card style={{ padding: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 650, color: C.ink3, letterSpacing: ".06em", marginBottom: 12 }}>CRASH TEST · {drill.length} HOSTILE REPS</div>
            {drill.map((d: string, i: number) => <div key={d} style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 26, padding: "7px 0", opacity: f > split + 20 + i * 14 ? 1 : 0.15 }}><span style={{ color: C.accent, fontWeight: 750, width: 80 }}>PASS</span>{d}</div>)}
          </Card>
        </div>
      </div>
      <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end", paddingBottom: 20 }}>
        {turns.map((t, i) => {
          const at = 40 + i * 62; if (f < at) return null;
          const s = spring({ frame: f - at, fps, config: { damping: 18, stiffness: 160 } });
          const out = t.from === "agent";
          return <div key={i} style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: "86%", background: out ? C.blue : "#e9e9eb", color: out ? "#fff" : C.ink, padding: "14px 20px", borderRadius: 24, fontSize: 23, lineHeight: 1.3, opacity: s, transform: `scale(${0.9 + s * 0.1})`, transformOrigin: out ? "bottom right" : "bottom left" }}>{t.text.replace(/\n+/g, " ").slice(0, 230)}{t.text.length > 230 ? "…" : ""}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Audit = () => {
  const f = useCurrentFrame();
  const notes: [number, string][] = [[0, "The amount and why"], [75, "The exact clause, with its source"], [210, "The evidence"], [370, "One tap to approve"], [420, "Filed, then recovered"], [580, "The merchant conversation"], [740, "Every step, timestamped"], [880, "Where each field came from"]];
  const cur = [...notes].reverse().find(([at]) => f >= at)!;
  const k = interpolate(f - cur[0], [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 160px", gap: 120 }}>
      <Label tone="ok">Real footage</Label>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>5. The audit page</Eyebrow></Rise>
        <Rise delay={10}><H size={80}>Every claim has a receipt.</H></Rise>
        <div style={{ fontSize: 44, color: C.accent, fontWeight: 650, marginTop: 40, minHeight: 60, opacity: k, transform: `translateY(${(1 - k) * 10}px)` }}>{cur[1]}</div>
        <Rise delay={900}><div style={{ fontSize: 30, color: C.ink2, marginTop: 30, lineHeight: 1.4 }}>Real purchase. Simulated failure. Labelled on every page.</div></Rise>
      </div>
      <div style={{ width: 500, height: 1000, borderRadius: 48, overflow: "hidden", border: "12px solid #111", boxShadow: "0 40px 100px rgba(0,0,0,.18)", background: "#fff" }}>
        <OffthreadVideo src={staticFile("audit.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
    </AbsoluteFill>
  );
};

const Phone = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const msgs = [...(lead.messages as any[]).map((m) => m.text), summary.text].map((t, i) => ({ text: t.replace(/https?:\/\/\S+/g, (u) => u.replace(/^https?:\/\/[^/]+/, "savingsdetective.local")), at: 20 + i * 85 }));
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 160px", gap: 120 }}>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>6. The whole UX is a text thread</Eyebrow></Rise>
        <Rise delay={10}><H size={80}>Found. Filed. Paid.</H></Rise>
        <Rise delay={300}><div style={{ fontSize: 120, fontWeight: 750, letterSpacing: "-0.04em", color: C.accent, marginTop: 40 }}>{usd(recovered)}</div><div style={{ fontSize: 32, color: C.ink2 }}>found for one household, in one pass</div></Rise>
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
            {msgs.filter((m) => f >= m.at).map((m) => { const s = spring({ frame: f - m.at, fps, config: { damping: 18, stiffness: 160 } });
              return <div key={m.at} style={{ alignSelf: "flex-start", maxWidth: "86%", background: "#e9e9eb", padding: "12px 16px", borderRadius: 22, borderBottomLeftRadius: 6, fontSize: 20, lineHeight: 1.3, overflowWrap: "anywhere", transform: `scale(${0.85 + s * 0.15})`, transformOrigin: "bottom left", opacity: s }}>{m.text}</div>; })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Close = () => (
  <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px", color: "#f2f3f5" }}>
    <Rise><div style={{ fontSize: 64, fontWeight: 500, color: "#9aa0aa", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Instinct is a concierge for people who can afford one.</div></Rise>
    <Rise delay={70}><div style={{ fontSize: 84, fontWeight: 750, letterSpacing: "-0.035em", lineHeight: 1.1, marginTop: 30 }}>SavingsDetective is a collections agent for <span style={{ color: "#34c77b" }}>everyone else</span>.</div></Rise>
    <Rise delay={140}><div style={{ fontSize: 30, color: "#7f8691", marginTop: 60 }}>github.com/raheeldeal/savingsdetective · merchant simulated, audit trail real</div></Rise>
  </AbsoluteFill>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Scene id="title"><Title /></Scene>
    <Scene id="orders"><Orders /></Scene>
    <Scene id="rulebook"><Rulebook /></Scene>
    <Scene id="negative"><Negative /></Scene>
    <Scene id="transcript"><Transcript /></Scene>
    <Scene id="audit"><Audit /></Scene>
    <Scene id="phone"><Phone /></Scene>
    <Scene id="close" bg={C.dark}><Close /></Scene>
  </AbsoluteFill>
);
