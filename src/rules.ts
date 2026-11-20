// Deterministic rule matching. No model decides whether money is owed or how much.
import type { Order, Policy } from "./types.ts";

export const SHORT: Record<string, string> = {
  SKIN_CLEANING_WIPE: "baby wipes", BLANKET: "heated blanket", SAUTE_FRY_PAN: "cast iron skillet",
  VACUUM_CLEANER: "handheld vacuum", ELECTRIC_FAN: "floor fan", COFFEE: "coffee",
  BATTERY: "AAA batteries", BABY_SEAT: "clip-on high chair",
};
export const shortName = (o: Order) => SHORT[o.category] ?? o.title.split(/[,(-]/)[0].trim().slice(0, 32);

const DAY = 86_400_000;
const usd = (n: number) => `$${n.toFixed(2)}`;
const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function lateness(o: Order): string {
  const mins = Math.round((+new Date(o.delivery!.deliveredAt) - +new Date(o.delivery!.promisedBy)) / 60000);
  return mins >= 90 ? `${Math.round(mins / 60)}h` : `${mins} min`;
}

export type Verdict =
  | { owed: true; amount: number; reason: string; headline: string; deadline: string; evidence: { label: string; value: string }[] }
  | { owed: false; reason: string };

export function evaluate(o: Order, p: Policy, now = new Date()): Verdict {
  const name = p.merchantName;
  if (p.kind === "late_delivery") {
    if (!o.delivery) return { owed: false, reason: "No delivery promise on this order." };
    const late = +new Date(o.delivery.deliveredAt) - +new Date(o.delivery.promisedBy);
    const grace = (p.graceMinutes ?? 0) * 60000;
    if (late <= grace) return { owed: false, reason: `Delivered on time (${fmt(o.delivery.deliveredAt)}).` };
    const amount = p.refund === "fixed" ? p.fixedAmount! : o.delivery.fee;
    if (!(amount > 0)) return { owed: false, reason: "Late, but no fee was paid and the policy refunds fees only." };
    const deadline = new Date(+new Date(o.delivery.deliveredAt) + p.windowDays * DAY).toISOString();
    if (now > new Date(deadline)) return { owed: false, reason: `Late, but the ${p.windowDays}-day claim window closed.` };
    const how = p.refund === "fixed" ? `credits ${usd(amount)}` : `refunds the ${usd(amount)} fee`;
    return {
      owed: true, amount, deadline,
      reason: `Delivered ${lateness(o)} after the promised time.`,
      headline: `${name} delivered your ${shortName(o)} ${lateness(o)} late. Their ${p.refund === "fixed" ? "on-time promise" : "guarantee"} ${how}.`,
      evidence: [
        { label: "Delivery option", value: `${o.delivery.type}${o.delivery.fee ? ` (${usd(o.delivery.fee)} fee paid)` : ""}` },
        { label: "Promised by", value: fmt(o.delivery.promisedBy) },
        { label: "Delivered at", value: fmt(o.delivery.deliveredAt) },
        { label: "Late by", value: lateness(o) },
      ],
    };
  }
  if (!o.priceCheck) return { owed: false, reason: "No price change seen." };
  const drop = Number(((o.price - o.priceCheck.priceNow) * o.qty).toFixed(2));
  if (drop <= 0) return { owed: false, reason: "Price has not dropped." };
  const daysIn = Math.floor((+new Date(o.priceCheck.seenAt) - +new Date(o.orderedAt)) / DAY);
  const deadline = new Date(+new Date(o.orderedAt) + p.windowDays * DAY).toISOString();
  if (daysIn > p.windowDays || now > new Date(deadline))
    return { owed: false, reason: `Price dropped ${usd(drop)}, but on day ${daysIn}. The ${p.windowDays}-day window closed ${Math.max(1, daysIn - p.windowDays)} days earlier.` };
  return {
    owed: true, amount: drop, deadline,
    reason: `Price dropped ${usd(drop)} on day ${daysIn} of a ${p.windowDays}-day window.`,
    headline: `${name} dropped the price of your ${shortName(o)} by ${usd(drop)}. Their price policy refunds the difference.`,
    evidence: [
      { label: "You paid", value: `${usd(o.price)} on ${fmt(o.orderedAt)}` },
      { label: "Price now", value: `${usd(o.priceCheck.priceNow)} (seen ${fmt(o.priceCheck.seenAt)})` },
      { label: "Days since purchase", value: `${daysIn} of ${p.windowDays}` },
      { label: "Difference", value: usd(drop) },
    ],
  };
}
