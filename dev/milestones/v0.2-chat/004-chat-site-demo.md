---
id: 004
title: Show a chat with inline elements on the site
milestone: v0.2-chat
category: preview
priority: medium
files: ["apps/preview/**", "e2e/**", "README.md"]
---

Starts after 003 merges. D21 still applies: no live model and no API key on the site.

## Acceptance criteria
- [ ] A `/chat` page (linked from the header nav and the home page) plays a scripted Petra conversation in the real chat components: user message, steps routed to squadmates, replies that mix text and OpenUI blocks, and at least one action (Approve plan) that becomes the next turn and locks its element. The script replays from fixtures through a mock transport passed to `useChat`, so the real code path runs.
- [ ] English and Arabic scripts; light and dark; Replay control; reduced motion shows the final state; no layout shift while it plays (reserve space as the home stream demo does).
- [ ] The composer is live but sends only to the scripted transport, which answers with a fixed reply explaining that the site has no live model.
- [ ] e2e and screenshots (D20); axe; no overflow at 390 px. `npm run verify` passes.
