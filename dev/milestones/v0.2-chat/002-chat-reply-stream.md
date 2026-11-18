---
id: 002
title: Render chat replies as markdown with OpenUI blocks
milestone: v0.2-chat
category: openui
priority: high
files: ["packages/ui/src/react/ChatReply/**", "packages/ui/src/openui/**", "packages/ui/src/react/index.ts", "e2e/**", "llms.txt"]
---

Implements D22. Runs in parallel with 001; it does not depend on the chat surface parts.

## Acceptance criteria
- [ ] `ChatReply` takes a (possibly partial, still streaming) reply string and renders it in reading order: markdown text segments and fenced ```openui blocks. Each OpenUI block renders through `TensquadsRenderer` with the active locale. A block that is still open renders progressively as OpenUI does today; an unclosed fence at the end is treated as streaming, not as text.
- [ ] Markdown support matches the Agent-UI reply styles: paragraphs, headings, ordered and unordered lists, inline code, code blocks (always LTR), links (safe protocols only: http, https, mailto). No raw HTML is ever rendered.
- [ ] No new runtime dependency unless approved: if a markdown library is needed, add an open question to `dev/open-questions.md` with the candidate, size and licence, and stop. A small in-house parser is acceptable.
- [ ] `buildSystemPrompt` gains `mode: "chat"` that teaches the D22 format (when to use text, when to use a block, one block per UI moment, close every fence), with English and Arabic examples. The default mode is unchanged.
- [ ] Fixtures `ChatReply.fixture.en.txt` / `.ar.txt` mixing text and two OpenUI blocks; a round-trip test renders them with no errors and checks reading order. A streaming test feeds the fixture character by character and asserts no crash and no flicker of fence text.
- [ ] Docs in `ChatReply.md`; `llms.txt` updated; tokens only; RTL.
- [ ] `npm run verify` passes.
