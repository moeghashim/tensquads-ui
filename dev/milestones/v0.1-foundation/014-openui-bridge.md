---
id: 014
title: Add the OpenUI library, renderer, and server helpers
milestone: v0.1-foundation
category: openui
priority: high
files: ["packages/ui/src/openui/**", "packages/ui/src/schemas/**", "packages/ui/package.json"]
---

## Acceptance criteria
- [ ] Define each supported component with a Zod props schema and description beside the component.
- [ ] Build and memoize the OpenUI library lazily; do not create it at module scope.
- [ ] Implement `buildSystemPrompt` with component rules and English and Arabic examples.
- [ ] Add the client renderer and typed server helpers with request size and turn caps.
- [ ] Import `@anthropic-ai/sdk` only in `providers/anthropic.ts`; default to `claude-haiku-5-5`.
- [ ] Add round-trip fixtures for each component in both locales.
- [ ] Add tests for lazy construction, prompt locales, caps, and typed errors.
- [ ] Add no module-scope randomness or timers.

## Suggested approach
Use the website Petra OpenUI files as read-only prior art. Build on `@openuidev/react-lang` and `@openuidev/lang-core` pinned versions. Do not copy product-specific interview schemas or UI.
