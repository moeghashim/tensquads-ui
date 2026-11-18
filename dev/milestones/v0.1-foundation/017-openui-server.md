---
id: 017
title: Add the OpenUI server helpers and the Anthropic provider
milestone: v0.1-foundation
category: openui
priority: high
files: ["packages/ui/src/openui/server/**", "packages/ui/package.json"]
---

## Acceptance criteria
- [ ] `buildSystemPrompt({ library, locale, persona?, extra? })` exported from `@tensquads/ui/openui/server`. It lists every registered component with its description and props, the rules, and examples in the requested locale. Arabic prompts have Arabic examples.
- [ ] Typed server helpers: request validation with body-size and turn caps, and a typed error that a client can turn into its scripted fallback.
- [ ] A stream helper that returns a `Response` with the model's OpenUI Lang output, for use in a Cloudflare Worker route.
- [ ] `providers/anthropic.ts` is the only file that imports `@anthropic-ai/sdk`. Default model `claude-haiku-5-5`. A test fails if any other file imports it.
- [ ] Tests for prompt content in both locales, caps, typed errors and the provider seam (with a fake client; no network).
- [ ] No module-scope randomness or timers.

## Suggested approach
The client side (definitions, lazy library, renderer, round-trip fixtures) already exists from task 006, and every v0.1 component is registered by now. This task adds only the server side. Use the website's `src/lib/petra.ts` and `src/routes/api/petra.ts` as read-only prior art. Do not copy product-specific interview schemas or UI.
