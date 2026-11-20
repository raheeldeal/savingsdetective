import fs from "node:fs";
import type { Order } from "./types.ts";

// data/orders.json is generated with dates relative to its build time.
// Shift every timestamp by the same offset so the demo windows stay live on any day.
export function loadOrders(): { household: any; orders: Order[] } {
  const raw = JSON.parse(fs.readFileSync("data/orders.json", "utf8"));
  const offset = Date.now() - new Date(raw.generatedAt).getTime();
  const shift = (iso: string) => new Date(new Date(iso).getTime() + offset).toISOString();
  for (const o of raw.orders as Order[]) {
    o.orderedAt = shift(o.orderedAt);
    if (o.delivery) { o.delivery.promisedBy = shift(o.delivery.promisedBy); o.delivery.deliveredAt = shift(o.delivery.deliveredAt); }
    if (o.priceCheck) o.priceCheck.seenAt = shift(o.priceCheck.seenAt);
  }
  return raw;
}
