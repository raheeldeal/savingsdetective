// Proactive texts through the Messages app on this Mac (AppleScript via osascript).
// Recipient comes only from IMESSAGE_TO. Without it, messages go to the console and the audit page.
import { execFile } from "node:child_process";
import { has } from "../config.ts";
import { update } from "../store.ts";

export const imessageEngine = () => (has("IMESSAGE_TO") ? "imessage" : "console");

const SCRIPT = `on run argv
  set theHandle to item 1 of argv
  set theText to item 2 of argv
  tell application "Messages"
    set svc to 1st account whose service type = iMessage
    send theText to participant theHandle of svc
  end tell
end run`;

function osa(handle: string, text: string): Promise<void> {
  // Arguments are passed as argv, never spliced into the script, so message text cannot inject AppleScript.
  return new Promise((res, rej) => execFile("osascript", ["-e", SCRIPT, handle, text], { timeout: 15000 }, (err, _o, stderr) => (err ? rej(new Error(stderr || err.message)) : res())));
}

export async function sendText(text: string): Promise<string> {
  let delivered = "console";
  if (imessageEngine() === "imessage") {
    try { await osa(process.env.IMESSAGE_TO!, text); delivered = "imessage"; }
    catch (e) { console.warn(`[imessage] send failed: ${(e as Error).message.trim()}`); delivered = "console (iMessage failed)"; }
  }
  console.log(`\n  \x1b[44m\x1b[97m iMessage \x1b[0m ${text}\n`);
  update((s) => { s.outbox.push({ at: new Date().toISOString(), text, delivered }); });
  return delivered;
}
