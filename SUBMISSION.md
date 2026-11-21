# Submission packet (paste into the tokensand form)

## Title (under 300 characters)

SavingsDetective: a personal agent that finds money merchants owe you, texts you, and claims it with an audit trail. In one pass it found $232.90 for a family earning under $25k, led by a $200 Best Buy price drop nobody had noticed.

## What does it do, and for whom? (under 1,500 characters)

Andy, a dad of two in Dayton, Ohio, earning under $25,000, saved for months and bought a $699 TV at Best Buy. Nine days later Best Buy dropped it to $499. Best Buy's own Price Match Guarantee owes him $200. Nobody told them, and nobody in that house has an afternoon to spend on hold.

SavingsDetective is a background agent on your Mac that checks every order against each merchant's written policy and texts you over iMessage when it finds money: "Found: Best Buy dropped the price of your monitor by $200. Approve: <link>". One tap approves. The agent opens a chat with merchant support, quotes the clause, refuses the $3 gift card it gets offered, and texts back when the cash lands.

Every text links to an audit page: the amount, the clause and its source URL, the evidence with the numbers, the full merchant transcript, a timestamped trail of every step, and which fields are real versus simulated. Deterministic rules decide whether money is owed and how much. Claude only words the message.

It also records what it did not file: a Target price drop that landed on day 18 of a 14-day window, with the reason.

The demo runs on real Amazon orders from Open E-commerce 1.0 (Harvard Dataverse) with simulated service failures. Merchants are simulated. Before the agent talks to one, Firedrill-style crash tests throw eight hostile reps at it: card-number phishing, prompt injection, lowballs. Eight passes.

Instinct is a concierge for people who can afford one. SavingsDetective is a collections agent for everyone else.

## Tools used (tick these sponsor names)

- Senso.ai: live. The merchant rule book; every claim's clause is retrieved from Senso.
- Firedrill: integrated. `POST /firedrill` speaks the `http.v1` driver; CLI signed in; local drill report in `docs/drill-report.txt`. Cloud campaign not yet run.
- Amplitude + Statsig: live. Four claim lifecycle events; `auto_approve_small_claims` gate.
- Cognee: adapter built, local fallback.
- Superlinked: adapter built, local fallback.
- Arcee AI: adapter built (Trinity via OpenRouter); Anthropic Claude is the live drafting model today.
- Guild AI: local activity log only.

Also: Anthropic Claude Sonnet 4.5 (drafting), macOS Messages via AppleScript (live texts to the user's phone), Node 26, Remotion, Puppeteer.

## Event video requirements

Checked luma.com/tokensand, luma.com/personalagenthack, tokensand.com and tokensand.ai on Nov 20: no stated video length, format or hosting requirement. The agenda lists "4:30 PM Project Submission" only. The video is an mp4 in the repo, about 2 minutes, with a voiceover.

## Links

- Working project URL: none, local-first (runs on the user's Mac and texts their phone). `npm run demo` in the repo.
- Repo: https://github.com/raheeldeal/savingsdetective
- Video: `video/out/savingsdetective.mp4` (2 min 19 s)
- Screenshot: `docs/hero.png` (alt: `docs/claim-top.png`)

## 90-second spoken demo script (live finalist round)

**0:00 The orders.** "These are real Amazon orders from a family of three earning under twenty-five thousand a year. Nine orders. Nobody flagged anything. We layer simulated service failures on top and label them."

**0:12 The rule book.** "The agent doesn't guess. It pulls Best Buy's Price Match Guarantee from Senso, with the clause and source link, then runs the numbers: paid $699, now $499, day 9 of 15. Owed: $200. Rules decide the money. The model only writes the message."

**0:30 The miss.** "It also says no. Target dropped a fan $10, but on day 18 of a 14-day window. It records why it didn't file, so you see misses next to wins."

**0:42 The conversation.** "On approve, it chats with Best Buy support. The rep offers a $3 gift card. The agent declines, quotes the clause, gets the full $200 to the card. Before it talks to anyone, we crash-test it: eight hostile reps, card phishing, prompt injection, lowballs. Eight passes."

**1:00 The audit page.** "Every text links here. Amount, clause, evidence, one tap to approve, the transcript, a timestamped trail, and where each field came from: real purchase, simulated failure."

**1:15 The thread.** "The whole UX is iMessage. Found. Filed. Paid. Then: what I've saved you. $232.90 in one pass."

**1:25 Close.** "Instinct is a concierge for people who can afford one. SavingsDetective is a collections agent for everyone else."
