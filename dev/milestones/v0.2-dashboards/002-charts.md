---
id: 002
title: Build BarChart, Bars and Distribution
milestone: v0.2-dashboards
category: component
priority: high
files: ["packages/ui/src/react/BarChart/**", "packages/ui/src/react/Bars/**", "packages/ui/src/react/Distribution/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

Specs: `BarChart`, `Bars`, `Distribution`. Starts after 001 merges (charts render inside `Card`).

## Acceptance criteria
- [ ] `BarChart`: vertical columns for counts over time. Props: `points` (label plus value, or segments), optional `keys` for stacked series, optional `highlight` (a range of point indexes drawn in the strong ink). Owner references: "Revenue, last 14 days" draws the previous week in `gray-250` and this week in `primary-solid` with a legend "Previous week / This week"; "Companies created, last 8 weeks" draws all bars light and the latest bar dark. Bars at most 28px wide, 4px rounded data end, zero baseline, x labels per spec. Hover or focus on a column shows a UI SDK Tooltip with the label and value; the card subtitle can say "Hover a bar for the day's total".
- [ ] Columns are keyboard reachable (one tab stop, arrow keys move between columns) and each has an accessible name such as "Oct 26: 3 companies". The chart has a text summary for screen readers.
- [ ] `Bars`: horizontal ranked bars per spec. Also a `progress` style for the owner's "Companies by plan" card: label at the inline start, the value text at the inline end ("4 companies · 27 squads"), a 6px track under each row with a fill scaled to the maximum, and a caption under the rows ("Average of 7.3 squads per company"). Fills stay one ink; a row may take `tone: "info"` only when the owner's reference shows it (Growth is blue there): record that exception in `Bars.md`.
- [ ] `Distribution`: per spec (stacked grey segments plus a key with bold counts), capped at six parts with "Other".
- [ ] OpenUI definitions for all three with fixtures in both locales.
- [ ] Tests: scaling, highlight range, tooltip text, keyboard movement, RTL order, axe. No overflow at 390px (the 14-day chart may scroll inside its card; it must not widen the page).

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
