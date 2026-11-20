export type MerchantId = "amazon" | "bestbuy" | "costco" | "target" | "cornercart";

export interface Order {
  id: string; merchant: MerchantId; title: string; asin: string; category: string;
  price: number; qty: number; orderedAt: string;
  delivery: { type: string; fee: number; promisedBy: string; deliveredAt: string } | null;
  priceCheck: { priceNow: number; seenAt: string } | null;
  provenance: { item: string; merchant: string; failure: string };
}

export interface Policy {
  id: string; merchant: MerchantId; merchantName: string; kind: "late_delivery" | "price_drop";
  title: string; clause: string; refund: "shipping_fee" | "price_difference" | "fixed";
  fixedAmount?: number; graceMinutes?: number; windowDays: number; sourceUrl: string;
  verified: boolean; verifiedNote: string; score?: number;
}

export type ClaimStatus = "found" | "approved" | "filed" | "resolved" | "denied";

export interface TimelineEvent { at: string; kind: string; title: string; detail?: string; actor: "agent" | "user" | "merchant" | "system" }
export interface Turn { from: "agent" | "merchant"; text: string; at: string }

export interface Claim {
  id: string; orderId: string; merchant: MerchantId; merchantName: string;
  amount: number; reason: string; headline: string;
  policy: Pick<Policy, "id" | "title" | "clause" | "sourceUrl" | "verified" | "verifiedNote" | "windowDays">;
  policySource: string; // "senso" | "local"
  rerank: { engine: string; candidates: { id: string; score: number }[] };
  deadline: string;
  evidence: { label: string; value: string }[];
  provenance: Order["provenance"];
  order: Pick<Order, "title" | "asin" | "price" | "orderedAt" | "category">;
  status: ClaimStatus;
  autoApproved: boolean;
  draft: { text: string; engine: string };
  transcript: Turn[];
  channel: string;
  messages: { at: string; text: string; delivered: string }[];
  timeline: TimelineEvent[];
  createdAt: string; updatedAt: string;
}

export interface Skipped { orderId: string; title: string; merchantName: string; reason: string }
