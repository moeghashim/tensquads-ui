---
id: 003
title: Write the getting-started page for coding agents
milestone: v0.2-home
category: preview
priority: medium
files: ["apps/preview/src/routes/get-started.tsx", "apps/preview/src/copy/**", "e2e/**"]
---

Starts after 001 merges. Runs in parallel with 002. Only add keys to the copy modules; do not restructure them.

## Acceptance criteria
- [ ] `/get-started` explains, in en and ar, how a coding agent uses the library: install from a pinned commit, the CSS setup, the `tensquads-ui` and `ui-sdk` skills (where they live and how to install them), and `llms.txt` (link to it on `main`).
- [ ] A short server-agent section: `buildSystemPrompt`, `readOpenUIRequest`, `streamOpenUIResponse` and the Anthropic provider, with one minimal Worker example taken from the existing docs. Text only; no live endpoint.
- [ ] Code blocks are copyable, with the same copy control as 002 if it has merged, otherwise a local one that 002 can replace.
- [ ] Every code sample is checked against the real exports (a unit test imports each named export it shows).
- [ ] No horizontal scroll at 390 px; axe clean; both directions and themes; screenshots as in D20.
- [ ] `npm run verify` passes.
