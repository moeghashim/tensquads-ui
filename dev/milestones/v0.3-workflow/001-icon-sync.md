---
id: 001
title: Sync the Agent-UI icon set and generate icons.ts
milestone: v0.3-workflow
category: design
priority: high
files: ["scripts/sync-design.mjs", "scripts/build-icons.mjs", "design/**", "packages/ui/src/icons/**", "package.json", "AGENTS.md"]
---

The node kinds and builder actions need the Agent-UI glyphs (`design/agent-ui/README.md`, Iconography). They live in the design repo's `agent-ui/components/bundle.js` as `var ICONS = { name: 'path', ... }`, which we do not sync today.

## Acceptance criteria
- [ ] `scripts/sync-design.mjs` also copies `agent-ui/components/bundle.js` to `design/agent-ui/components/bundle.js`, hashed in `MANIFEST.json` like every other file.
- [ ] Run `npm run design:sync -- 513505617794ee8bdb82cdc019b137910c60c52f` (the commit already pinned). The only design change is the new file and its manifest entry. If anything else changes, stop and report it.
- [ ] New `scripts/build-icons.mjs`, run by `npm run icons`, reads the `ICONS` object from the synced bundle without executing it (parse the object literal text; do not `eval` or `import` the file) and writes `packages/ui/src/icons/icons.ts`: `export const ICON_PATHS = { ... } as const` and `export type IconName = keyof typeof ICON_PATHS`, sorted by name, with a "generated, do not edit" header. `npm run icons -- --check` (`icons:check`) fails when the file is stale and joins `npm run check`.
- [ ] `packages/ui/src/icons/Icon.tsx`: an internal `Icon` component (`name`, `size` 14, 16 or 28, default 16) that draws one path in a 16×16 viewBox, `stroke="currentColor"`, `stroke-width="1.5"`, round caps and joins, `fill="none"`, `aria-hidden="true"`. Not exported from `@tensquads/ui/react` in this task.
- [ ] Tests: the generator output matches the bundle (count and three sample paths); `icons:check` fails on a stale file; `Icon` renders the right path and is hidden from assistive technology.
- [ ] AGENTS.md is not changed by Luna; report the new command for Opus to add.

## Shared rules for this milestone
- Read D25, D30 and D31 in `PLAN.md`, the named specs under `design/agent-ui/components/` in full, `design/agent-ui/README.md` (Canvas, Iconography, Themes and shortcuts), and the UI SDK docs the task names (`node_modules/@ui-sdk/react/docs/`). The spec wins on visuals unless this file says otherwise.
- Branch `feat/v0.3-workflow-NNN-slug` from `v0.3-workflow`. Base the PR on `v0.3-workflow`. Work in the project checkout; do not create git worktrees (D25).
- This task adds no component.
- Build what UI SDK does not ship from `@ui-sdk/core` (`definePrimitive`, `createParts`, `createRovingFocus`, `spatialMove`, drag behaviors, `createCommit`). Wrap what it ships. Public entries only. No hand-rolled roles UI SDK ships.
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Icons come from the generated `icons.ts` (task 001), never hand-drawn.
- No module-scope randomness, dates, timers or `window` access; the components render on the server.
- Lists keyed by id, never by index.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
