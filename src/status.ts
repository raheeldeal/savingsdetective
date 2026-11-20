// Prints which sponsor adapters are live and which are using local fallbacks. Never prints values.
import { policyEngine } from "./adapters/policies.ts";
import { rerankEngine } from "./adapters/rerank.ts";
import { memoryEngine } from "./adapters/memory.ts";
import { flagEngine } from "./adapters/flags.ts";
import { llmEngine } from "./adapters/llm.ts";
import { imessageEngine } from "./adapters/imessage.ts";
import { activityEngine } from "./adapters/activity.ts";
import { analyticsEngine } from "./instrumentation/analytics.ts";

export function engines() {
  return {
    "Rule book": policyEngine(), "Clause ranking": rerankEngine(), "Household memory": memoryEngine(),
    "Feature flag": flagEngine(), "Drafting": llmEngine(), "Texts": imessageEngine(),
    "Merchant": "simulated", "Activity log": activityEngine(), "Analytics": analyticsEngine(),
  };
}
export function status() {
  console.log("\nSavingsDetective adapters");
  for (const [k, v] of Object.entries(engines())) console.log(`  ${k.padEnd(18)} ${v}`);
  console.log("");
}
