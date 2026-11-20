// Merchant contact is a pluggable channel. Today the only live channel is a SIMULATED merchant:
// a scripted support rep per merchant. No real merchant is ever contacted.
// Firedrill plays the merchant against our agent from the outside (see firedrill/README.md).
// Email is stubbed for a future version.
import type { Claim, Turn } from "../types.ts";
import { agentReply } from "../negotiator.ts";

export interface MerchantChannel {
  name: string;
  label: string;
  file(claim: Claim): Promise<{ transcript: Turn[]; outcome: "approved" | "denied"; refunded: number }>;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const SCRIPTS: Record<string, ((c: Claim) => string)[]> = {
  amazon: [
    () => "Hi, this is Sam from Amazon Customer Service. How can I help?",
    () => "Sorry about that. Can you confirm the order number?",
    () => "Thanks. Can you share the delivery tracking evidence?",
    (c) => `I see the package arrived after the guaranteed time. I've issued a refund of ${usd(c.amount)} for the shipping fee to your original payment method.`,
  ],
  bestbuy: [
    () => "Thanks for contacting Best Buy. I'm Jordan. What can I do for you?",
    () => "I can offer you a $3.00 Best Buy gift card for the trouble.",
    (c) => `Understood. Since the item is still in the return period, I've processed a price adjustment of ${usd(c.amount)} to your card.`,
  ],
  costco: [
    () => "Costco Member Services, this is Priya. How can I help?",
    () => "Which order is this for?",
    (c) => `Confirmed, the price dropped within 30 days. A price adjustment of ${usd(c.amount)} has been issued. Allow 5 to 10 business days.`,
  ],
  target: [
    () => "Hi! Target Guest Services here, I'm Alex.",
    () => "Can you show me the lower price you found?",
    (c) => `Got it. I've refunded the ${usd(c.amount)} difference to your original payment.`,
  ],
  cornercart: [
    () => "Corner Cart here. What happened with your delivery?",
    (c) => `Sorry we were late. We've credited ${usd(c.amount)} to your account.`,
  ],
};

export const simulatedMerchant: MerchantChannel = {
  name: "simulated-merchant",
  label: "Simulated merchant: a scripted support rep. No real merchant is contacted.",
  async file(claim) {
    const script = SCRIPTS[claim.merchant] ?? SCRIPTS.amazon;
    const t0 = Date.now();
    const at = (i: number) => new Date(t0 + i * 23000).toISOString();
    const transcript: Turn[] = [];
    let i = 0;
    let outcome: "approved" | "denied" = "denied";
    for (const line of script) {
      const mText = line(claim);
      transcript.push({ from: "merchant", text: mText, at: at(i++) });
      const reply = transcript.length === 1 ? { text: claim.draft.text, done: false } : agentReply(claim, mText);
      transcript.push({ from: "agent", text: reply.text, at: at(i++) });
      if (reply.done) { outcome = reply.outcome ?? "approved"; break; }
    }
    return { transcript, outcome, refunded: outcome === "approved" ? claim.amount : 0 };
  },
};

export const emailChannel: MerchantChannel = {
  name: "email",
  label: "Email (stub, not enabled)",
  async file() { throw new Error("Email channel is a stub in this version. No email is sent."); },
};

export function channel(): MerchantChannel {
  return process.env.MERCHANT_CHANNEL === "email" ? emailChannel : simulatedMerchant;
}
