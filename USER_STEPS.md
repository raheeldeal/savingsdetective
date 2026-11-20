# What only you can do

SavingsDetective runs without any of these steps. Each one swaps a local fallback for the real service. Do them in order of value. All keys go in one file: `.env.local` in the repo root (it is gitignored). Open it with:

```
open -e /Users/raheelahmed/personal-agents-hackathon/.env.local
```

Paste each line as `NAME=value`, with no quotes and no spaces around `=`. Save. Restart `npm run demo` or `npm run watch` after any change. Run `npm run demo -- --exit` and read the "SavingsDetective adapters" table at the top to confirm each one switched from fallback to live.

The repo is already public at https://github.com/raheeldeal/savingsdetective. If you ever need to push again: `git push origin main`.

---

## 1. Get real iMessages on your phone (5 minutes, highest value)

1. In `.env.local`, add `IMESSAGE_TO=+1XXXXXXXXXX` (your number with country code) or the Apple ID email your iPhone uses for iMessage.
2. Open the **Messages** app on this Mac. Confirm you are signed in: **Messages > Settings > iMessage**, and your Apple ID shows as enabled.
3. In Terminal, in the repo folder, run `npm run demo -- --fresh`.
4. The first time, macOS asks: **"Terminal" wants access to control "Messages"**. Click **Allow**. If you missed it: **System Settings > Privacy & Security > Automation > Terminal (or your editor)**, turn on **Messages**, then run step 3 again.
5. Your phone should receive "Found: Amazon delivered your baby wipes 2h late..." with a link.
6. To open the link on your phone, your phone must be on the same Wi-Fi as this Mac. The link uses your Mac's local address automatically. If it does not open, check **System Settings > Network > Firewall** and allow incoming connections for `node`, or set `PUBLIC_BASE_URL` to a tunnel URL (for example from `npx localtunnel --port 4747`).
7. Tap **Approve and file** on the page. You get "Filed. Proof: ..." and then "Amazon approved $9.95."

## 2. Record your real phone for the video (10 minutes)

1. Connect your iPhone to this Mac with a cable. Unlock it and tap **Trust**.
2. Open **QuickTime Player > File > New Movie Recording**. Click the small arrow next to the red record button and choose your iPhone as the **Camera** and **Microphone**.
3. Click record. On the Mac, run `npm run demo -- --fresh`. Wait for the "Found" text on the phone, tap the link, tap **Approve and file**, wait for "Amazon approved $9.95." Stop recording (about 30 seconds).
4. Save as `phone.mov`, then convert it: `ffmpeg -i ~/Desktop/phone.mov -vf scale=-2:1080 -an /Users/raheelahmed/personal-agents-hackathon/video/public/phone.mp4`
5. Rebuild: `cd video && npm install && npm run voice && npm run render`. `npm run voice` regenerates the macOS `say` voiceover and notices `public/phone.mp4`, so the phone scene plays your real clip instead of the recreation. Output: `video/out/savingsdetective.mp4` (about 2.5 minutes).
6. Better voice, no signup: **System Settings > Accessibility > Spoken Content > System Voice > Manage Voices**, download an "Enhanced" or "Premium" English voice (for example Ava (Premium)), then run `SAY_VOICE="Ava (Premium)" npm run voice && npm run render`.
7. To re-capture the real audit-page footage: from the repo root, with `npm run web` running, run `npm run demo -- --fresh --exit`, then `node scripts/capture-footage.ts /tmp/f.mp4 && ffmpeg -y -i /tmp/f.mp4 -c:v libx264 -pix_fmt yuv420p -r 30 video/public/audit.mp4`.

## 3. Senso rule book (10 minutes)

1. Go to https://docs.senso.ai/sign-up and create an account.
2. Go to https://docs.senso.ai/api-keys (needs admin; the account creator is admin). Click **+ New key**, name it `savingsdetective`, click **Create key**. Copy it now; it is shown once. It starts with `tgr_`.
3. In `.env.local`: `SENSO_API_KEY=tgr_...`
4. Run `npm run senso:load`. It uploads the five policies. Each line should print `202`.
5. Wait one minute for Senso to index, then `npm run demo -- --fresh --exit`. The adapter table shows `Rule book  senso` and each audit page says "Rule book: Senso".

## 4. Drafting model: Anthropic or Arcee (5 minutes)

Option A, Anthropic: https://console.anthropic.com > **API Keys** > **Create Key**. In `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

Option B, Arcee Trinity via OpenRouter: https://openrouter.ai > sign in > **Keys** (https://openrouter.ai/keys) > **Create Key**, add a few dollars of credit. In `.env.local`: `OPENROUTER_API_KEY=sk-or-...`. If the model name changed, search "trinity" at https://openrouter.ai/models and set `OPENROUTER_MODEL` to the exact id.

The model only writes the merchant message. Rules decide whether money is owed and how much.

## 5. Firedrill merchant drills (done, nothing to click)

Done from the CLI on 2026-11-20: signed in, registered the agent, created 5 personas, an evaluation, a scenario and a world, and ran a 2-drill campaign. Report: `docs/firedrill-report/`.

Notes:
1. The CLI version that works with your workspace (3.x) needs Node 26.13.1 or newer; this Mac has 26.0.0. Updating Node (`brew upgrade node`) lets you run `npm install -g firedrill-run@latest` and use `firedrill` directly.
2. Optional: redeem `TOKENSAND` for 1,500 more credits. There is no CLI command for it. Open https://app.firedrill.run/settings/billing, paste `TOKENSAND` under **Event code**, click **Apply code**. The included 500 credits covered this run (each drill reserves up to about 190).
3. To run all five personas, set `"repetitions": 5` in `firedrill/world.json` after redeeming credits, then follow the rerun commands in `firedrill/README.md`.

## 6. Statsig flag: auto-approve small claims (5 minutes)

1. Sign up at https://console.statsig.com.
2. **Feature Gates > Create**, name it exactly `auto_approve_small_claims`. Add a rule **Everyone**, pass 100%. Save.
3. **Settings (gear) > Keys & Environments**, copy the **Server Secret Key** (starts with `secret-`).
4. In `.env.local`: `STATSIG_SERVER_KEY=secret-...`
5. Turn the gate off in the console and run `npm run demo -- --fresh --exit`: the Best Buy $4.95 claim now waits for your OK.

## 7. Amplitude (already done)

`AMPLITUDE_API_KEY` moved from `first-agent/.env.local` to `.env.local`. To see events: https://app.amplitude.com > your project > **Data > Events**, look for `Claim Found`, `Claim Approved`, `Claim Filed`, `Claim Resolved`.

## 8. Cognee household memory (optional, needs a paid Cloud plan)

1. Cognee Cloud: open the **API keys** page (sidebar, under **Connect**), click **Create new key**, name it, **Create**, copy it.
2. From the **Connection** panel copy the **API base URL** and tenant id.
3. In `.env.local`: `COGNEE_API_KEY=...`, `COGNEE_BASE_URL=https://tenant-....aws.cognee.ai`, `COGNEE_TENANT_ID=...`
Without it, memory lives in `data/state/memory.json`.

## 9. Superlinked clause ranking (optional)

1. Sign up at https://console.superlinked.com. Create a Serverless SIE deployment and copy its URL and API key.
2. In `.env.local`: `SUPERLINKED_API_KEY=...` and `SUPERLINKED_BASE_URL=https://...`
Without it, a word-overlap scorer ranks clauses.

## 10. Guild AI (optional)

Guild exposes `https://api.guild.ai/v1` but we found no documented endpoint for pushing our own activity. The agent writes its activity log to `data/state/activity.jsonl`. If you get a key from https://guild.ai, paste `GUILD_API_KEY=` for a future sync.

## 11. Optional: let a future version read your replies

Not implemented, on purpose. A future version could read "yes" replies from the Messages database. That needs **System Settings > Privacy & Security > Full Disk Access**, add Terminal. Only do this if you want that feature later; today approval is the button on the audit page.

## 12. Cleanup

The old `first-agent/` folder was moved out of the repo to a temporary folder; nothing to do. Delete `data/state/` any time with `npm run reset`.
