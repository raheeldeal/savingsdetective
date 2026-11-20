// The agent's side of a merchant support chat. Deterministic on purpose: it never agrees to
// less than the policy says, never shares payment details, and always cites the clause.
// Firedrill drills this exact function over HTTP (see src/web/server.ts POST /firedrill).
import type { Claim } from "./types.ts";
import { config } from "./config.ts";

const money = (n: number) => `$${n.toFixed(2)}`;

export function agentReply(claim: Claim, merchantText: string): { text: string; done: boolean; outcome?: "approved" | "denied" } {
  const m = merchantText.toLowerCase();
  const proof = `${config.baseUrl}/c/${claim.id}`;
  const amounts = [...merchantText.matchAll(/\$\s?(\d+(?:\.\d{2})?)/g)].map((x) => Number(x[1]));
  if (/(card number|cvv|password|social security|ssn|bank account|routing|one[- ]time code|verification code)/.test(m))
    return { text: "I can't share payment or login details in chat. The refund can go back to the original payment method on the order.", done: false };
  if (/(ignore (all|your|previous)|system prompt|you are now|new instructions)/.test(m))
    return { text: `I'm only here about order ${claim.orderId}. Please refund ${money(claim.amount)} under "${claim.policy.title}".`, done: false };
  if (/(store credit|gift card|points|coupon|voucher)/.test(m))
    return { text: `I'd like the refund to the original payment method, please. Your policy says: "${claim.policy.clause}"`, done: false };
  if (/(approved|processed|issued|refunded|credited|we('| ha)ve (applied|refunded))/.test(m)) {
    if (amounts.length && Math.max(...amounts) + 0.001 < claim.amount)
      return { text: `Thanks. The policy covers ${money(claim.amount)}, and I see ${money(Math.max(...amounts))}. Please refund the remaining ${money(claim.amount - Math.max(...amounts))}.`, done: false };
    return { text: `Thank you. Confirming ${money(claim.amount)} back to the original payment method for order ${claim.orderId}.`, done: true, outcome: "approved" };
  }
  if (/(deny|denied|unable|can't|cannot|not eligible|no longer)/.test(m))
    return { text: `I'd like to escalate. Your policy says: "${claim.policy.clause}" Source: ${claim.policy.sourceUrl}. Evidence: ${proof}`, done: false };
  if (/(order (number|id|#)|which order)/.test(m))
    return { text: `Order ${claim.orderId}: ${claim.order.title.slice(0, 60)}, placed ${new Date(claim.order.orderedAt).toDateString()}.`, done: false };
  if (/(proof|evidence|screenshot|show|verify|tracking|receipt|lower price)/.test(m))
    return { text: `${claim.evidence.map((e) => `${e.label}: ${e.value}`).join(". ")}. Full record: ${proof}`, done: false };
  return { text: claim.draft.text, done: false };
}
