---
id: 001
title: Build Card, PageHeader and StatTile
milestone: v0.2-dashboards
category: component
priority: high
files: ["packages/ui/src/react/Card/**", "packages/ui/src/react/PageHeader/**", "packages/ui/src/react/StatTile/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

Specs: `Card`, `PageHeader`, `StatTile`, `Dashboard`. First task of the milestone; later tasks put their bodies inside `Card`.

## Acceptance criteria
- [ ] `Card`: `panel` fill, 0.5px `panel-border` (use `border-subtle` if no hairline token exists), `radius-2xl`, `space-5` padding. Parts: `title` (14px/600 `text-emphasis`), optional `subtitle` (12px `text-tertiary`), optional `count` shown as a small round badge at the inline end of the head (the "3" beside "Open bugs"), optional head `actions` slot (D24 exception: search and filter chips for a table), optional `legend` pairs, body, optional footer under a `border-subtle` rule. A `flush` prop removes body padding so a DataTable runs edge to edge under the head.
- [ ] `Card` also has an `inset` variant for items inside a card (approval items, bug rows): `surface-secondary` fill, `radius-xl`, `space-4` padding, no border.
- [ ] `PageHeader`: title in the `page-title` style (36px) or `heading` 28px per spec, one subtitle line in `text-secondary`, an `actions` slot at the inline end, and an optional `meta` row under the subtitle for status pills (for example "Demo data" and "53 squads online now"). It wraps cleanly at 390px.
- [ ] `StatTile`: label 12px `text-secondary`, optional 14px glyph, value 32px/600 tabular, optional unit at 16px `text-tertiary`, optional `foot` line. `delta` takes `{ text, tone: "positive" | "negative" | "neutral" }`: positive uses `success-text`, negative `danger-text`, neutral `text-secondary`. Render the delta as coloured text, as in the owner's references (`+12% vs last week`), not a pill. Optional `series` draws the 112×32 sparkline (one `gray-400` 1.5px line over an `alpha-05` area, dot on the last point); `series: null` hides it.
- [ ] Tiles sit six across at 1440px in the demo (references show six); provide a `StatGrid` wrapper or document the CSS grid so tiles wrap to 3, 2 and 1 columns at 1180, 760 and 480px.
- [ ] OpenUI definitions for all three, so an agent can stream a tile row inside a card. Round-trip fixtures in both locales.
- [ ] Tests: rendering of every part, delta tones, `series: null`, RTL sparkline direction, axe.

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
