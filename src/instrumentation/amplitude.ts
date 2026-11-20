import { init } from "@amplitude/analytics-node";

const key = process.env.AMPLITUDE_API_KEY;

// Resolves once the SDK is ready to accept events. Await this before the first track().
export const amplitudeReady: Promise<void> = (() => {
  if (!key) {
    console.error("[amplitude] AMPLITUDE_API_KEY is not set, so no events will be sent");
    return Promise.resolve();
  }
  // serverZone is 'US' by default; pass 'EU' only for EU-residency projects.
  return init(key, { serverZone: "US" }).promise;
})();
