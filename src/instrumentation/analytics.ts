// Claim lifecycle events. Uses the Amplitude SDK when AMPLITUDE_API_KEY is set; no-op otherwise.
import { track, flush } from "@amplitude/analytics-node";
import { amplitudeReady } from "./amplitude.ts";
import { config, has } from "../config.ts";

export const analyticsEngine = () => (has("AMPLITUDE_API_KEY") ? "amplitude" : "off");

export async function event(name: "Claim Found" | "Claim Approved" | "Claim Filed" | "Claim Resolved" | "Run Completed", props: Record<string, unknown>) {
  await amplitudeReady;
  if (analyticsEngine() === "off") return;
  track(name, props, { user_id: config.userId });
}
export async function flushEvents() { if (analyticsEngine() !== "off") await flush().promise; }
