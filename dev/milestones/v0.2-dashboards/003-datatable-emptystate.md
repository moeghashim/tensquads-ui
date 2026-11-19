---
id: 003
title: Build DataTable and EmptyState
milestone: v0.2-dashboards
category: component
priority: high
files: ["packages/ui/src/react/DataTable/**", "packages/ui/src/react/EmptyState/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

Specs: `DataTable`, `EmptyState`. Starts after 005 merges.

## Acceptance criteria
- [ ] `DataTable`: a real `<table>` with `<caption>` (visually hidden is fine). Columns: `key`, `label`, `align` (`start` or `end`; numeric columns end-aligned with tabular numerals), optional `width`, optional `mono`. Cells take strings or React nodes. Rows keyed by an `id`, never by index.
- [ ] Cell helpers used by the demos: an `entity` cell (28px rounded initials tile on a soft hue, bold name, one truncated secondary line: "DS / Demo store / Reach $1M in annual sales…"), a `person` cell (name plus email in `text-secondary`), a two-line `stack` cell ("$149 / mo" over "billed monthly"), and status through `Badge` (word plus tone, never colour alone). Long text truncates with an ellipsis and keeps the full text in `title`.
- [ ] Selectable rows: `onRowSelect(id)` and `selectedId`. Rows hover to `ghost-hover`, the selected row uses a `primary-soft` fill, rows are reachable with the keyboard (Enter and Space select) and expose `aria-selected`.
- [ ] Table toolbar for the card head (D24 exception): a search `Input` with a placeholder ("Search companies") and filter chips (All, Active, Trial, Paused) as a UI SDK SegmentedControl or Chip group, plus a count in the title ("All companies (9 of 9)"). Filtering and search are the host's job; the toolbar is controlled.
- [ ] Narrow screens: the table scrolls inside its card (`overflow-inline: auto`) and never widens the page at 390px.
- [ ] `EmptyState` per spec, also used when a search matches nothing ("No companies match" plus a Clear search button).
- [ ] OpenUI definitions for both with fixtures in both locales.
- [ ] Tests: sorting is out of scope; test selection by mouse and keyboard, truncation title, empty search state, RTL alignment, axe.

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
