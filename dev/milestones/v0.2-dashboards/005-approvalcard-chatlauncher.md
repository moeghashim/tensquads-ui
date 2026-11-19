---
id: 005
title: Build ApprovalCard and ChatLauncher
milestone: v0.2-dashboards
category: component
priority: high
files: ["packages/ui/src/react/ApprovalCard/**", "packages/ui/src/react/Chat/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

No Agent-UI spec exists (D24). Starts after 004 merges.

## Acceptance criteria
- [ ] `ApprovalCard`: an inset card (from 001) for one agent request. Head: 20px `Squadmate`, agent name in 600 and its role ("Giza · Inventory"), and at the inline end either a kind badge (solid "Mission") or an amount ("$42", "+$20/day") in 600 tabular. Body: a 16px/600 title ("Refund $42 on #A-1012"), one or two lines of `text-secondary` reason, optional outline chips for targets ("Stock-outs: 0"). Footer: a solid pill for approve and a soft pill for the second choice ("Decline" or "Ask for another"), labels from props.
- [ ] Its OpenUI definition makes both buttons OpenUI actions (`Approve` and `Decline` with the request id), so in a chat they become action turns and lock under D23. Fixtures in both locales.
- [ ] A card list wrapper for "Needs your approval" uses `Card` with `count`.
- [ ] `ChatLauncher` in the `Chat` folder: a floating pill fixed at the inline-end bottom (`space-6` from the edges), `primary-solid` fill, `shadow-300`, 32px `Squadmate` on a light circle, label ("Ask Petra"), and an optional count badge in `orange` status colour if a token exists (otherwise `danger-solid`; record the choice). It is a button; `onOpen` is the host's. It respects safe areas on mobile and never covers the composer of an open chat.
- [ ] Tests: action events and lock, amount and badge heads, launcher name includes the count ("Ask Petra, 4 waiting"), RTL position, axe.

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
