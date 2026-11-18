---
id: 006
title: Add the OpenUI foundation that each component plugs into
milestone: v0.1-foundation
category: openui
priority: high
files: ["packages/ui/src/openui/**", "packages/ui/src/schemas/**", "e2e/openui/**", "scripts/build-llms.mjs", "llms.txt", "packages/ui/package.json"]
---

## Acceptance criteria
- [ ] `defineComponent({ name, description, props, component })` helper. `props` is a zod schema. Each component's `X.openui.ts` uses it.
- [ ] A registry that component tasks add to by one import line. `createTensquadsLibrary(locale)` builds the library from it lazily and memoizes it. Nothing is built at module scope (Workers forbid random IDs at startup).
- [ ] `<TensquadsRenderer>` exported from `@tensquads/ui/openui` renders an OpenUI Lang stream with the library.
- [ ] A round-trip harness: a fixture file per component (`X.fixture.en.txt`, `X.fixture.ar.txt`) is rendered by the renderer in a unit test and in the preview app, with no error. A test fails if a registered component has no fixtures.
- [ ] `@tensquads/ui/schemas` holds the shared contracts used so far (`Locale`, `Direction`, `AgentSlug`, `AgentState`).
- [ ] `scripts/build-llms.mjs` builds `llms.txt` from every `X.md`. `npm run docs` runs it. `npm run check` fails if `llms.txt` is stale or a component has no `X.md`.
- [ ] A placeholder test component proves the whole path (definition, registry, fixture, renderer, llms entry). It is removed by task 009.
- [ ] No vendor SDK import in this task.

## Suggested approach
Split from the old task 014 (review by Opus, 2026-11-17) so that each component PR can meet its own "OpenUI round-trip fixture renders" and "`llms.txt` lists it" criteria. Use `@openuidev/react-lang` and `@openuidev/lang-core` 1.1.1. Use the website's `openui-library.tsx` as read-only prior art for lazy construction.
