# Submission

## Title

SavingsDetective: a personal agent that finds money merchants owe you, texts you, and claims it with an audit trail of every step.

## What does it do, and for whom?

Merchants promise money back for late deliveries and price drops, and almost nobody claims it. The households that lose the most are the ones with the least time to chase fees.

SavingsDetective runs in the background on your Mac. It checks your orders against each merchant's written policy and texts you over iMessage when it finds money: "Found: Amazon delivered your baby wipes 2h late. Their guarantee refunds the $9.95 fee. Approve: <link>". One tap approves. The agent then chats with merchant support, cites the exact clause, refuses gift cards and lowballs, and texts back when it's paid.

Every text links to an audit page: the amount, the clause and its source URL, the evidence, the full merchant transcript, and a timestamped trail of every step. Rules decide whether money is owed. The model only words the message.

The demo uses real Amazon orders from a family of three earning under $25,000 a year (Open E-commerce 1.0, Harvard Dataverse) with simulated service failures, and finds $32.90 across five claims. The merchants are simulated; Firedrill crash-tests the agent with hostile support reps.

Instinct is a concierge for people who can afford one. SavingsDetective is a collections agent for everyone else.

## Tools used

- Firedrill: hostile merchant reps over the `http.v1` driver, plus a local drill report
- Senso: merchant policy rule book (adapter, local fallback)
- Amplitude: claim lifecycle events (live)
- Statsig: auto-approve-under-$5 feature gate (adapter, env fallback)
- Cognee: household memory (adapter, local fallback)
- Superlinked SIE: clause reranking (adapter, local fallback)
- Arcee Trinity via OpenRouter, or Claude: drafting merchant messages (adapter, template fallback)
- Guild AI: activity log (local)
- macOS Messages via AppleScript, Node 26, Remotion for the video, Puppeteer for screenshots

## Links

- Repo: https://github.com/raheeldeal/savingsdetective
- Video: `video/out/savingsdetective.mp4`

## Suggested screenshot

`docs/hero.png` (also `docs/claim-top.png` for a phone-width audit page)
