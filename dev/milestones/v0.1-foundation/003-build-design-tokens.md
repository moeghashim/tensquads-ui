---
id: 003
title: Generate package tokens from the synced design tokens
milestone: v0.1-foundation
category: tokens
priority: high
files: ["scripts/build-tokens.mjs", "packages/ui/src/tokens/tokens.css", "packages/ui/src/tokens/tokens.ts"]
---

## Acceptance criteria
- [ ] Generate CSS custom properties and typed token exports from `design/tokens.json`.
- [ ] Keep both light and dark token values and the source token names.
- [ ] `npm run tokens` produces stable output and does not write to `design/**`.
- [ ] Add a focused test for representative color, type, spacing, radius, shadow, and motion tokens.

## Suggested approach
Read the synced token schema before implementation. Generate output deterministically and preserve the Agent-UI naming convention. The generated CSS must support `data-theme` on the document root.
