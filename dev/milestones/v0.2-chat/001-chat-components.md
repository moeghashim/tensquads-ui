---
id: 001
title: Build the chat surface components
milestone: v0.2-chat
category: component
priority: high
files: ["packages/ui/src/react/Chat/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/chat.css", "packages/ui/src/styles/styles.css", "apps/preview/**", "e2e/**", "llms.txt"]
---

Spec: `design/agent-ui/components/Chat/README.md` (read it in full). Decisions D22 and D23 shape later tasks; this task builds the surface only. Runs in parallel with 002.

## Acceptance criteria
- [ ] Parts in one `Chat/` folder, exported from `@tensquads/ui/react`: `Chat` (root, fills its container), `ChatHeader` with a ghost "New chat" button slot, `ChatLog` (`role="log"`, `aria-live="polite"`, 12px gap, scrolls, keeps the newest entry in view unless the reader scrolled up), `ChatUserMessage` (`primary-soft` pill at the inline end, max 85% wide), `ChatStep` (glyph slot, name, optional status word with a `danger` variant, optional mono response id, reply slot indented to align with the name; a `running` state shows a 14px spinner in place of the glyph), `ChatEmptyState` (32px `primary-soft` tile, title, one line), and `ChatComposer` (surface card, 24px corners, hairline ring; textarea grows to 160px; Enter sends, Shift+Enter breaks the line, IME composition never sends; attach slot at the start; 32px `primary-solid` send pill at the end, disabled on empty text; while `busy` it becomes Stop with a 10px square and calls `onStop`).
- [ ] Agent replies are never in a bubble; only the user message is (Agent-UI rule).
- [ ] Built on UI SDK and `@ui-sdk/core` where they provide the behavior; no hand-rolled roles UI SDK ships. Tokens only, logical CSS, light and dark, RTL.
- [ ] Spinner honours reduced motion.
- [ ] No OpenUI definitions for these surface parts: `Chat.md` explains that the chat hosts OpenUI content rather than being streamed (D22).
- [ ] English and Arabic copy defaults (New chat, Send, Stop, empty state) come from props with localized defaults; Arabic is D18-neutral.
- [ ] §12 checklist: tests for keyboard (Enter, Shift+Enter, IME), focus, empty-send disabled, Stop; preview page `/components/Chat` with a static conversation in both directions and themes; screenshots (D20); axe; no overflow at 390 px; `llms.txt` updated.
- [ ] `npm run verify` passes.
