---
id: 004
title: Build the Sidebar
milestone: v0.2-dashboards
category: component
priority: high
files: ["packages/ui/src/react/Sidebar/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

No Agent-UI spec exists (D24). Follow the owner's references described here. Starts after 003 merges.

## Acceptance criteria
- [ ] `Sidebar` is a `<nav>` with an accessible name, 248px wide on the `canvas` ground, `space-3` padding, beside a content area that sits on a `surface` panel with `radius-2xl` on its inline-start corners (the "Platform admin" reference).
- [ ] Parts: `SidebarBrand` (36px dark rounded tile with an icon, a 14px/600 title "Platform admin", a 12px `text-secondary` line "Your company account"); `SidebarItem` (16px line icon, 14px label, optional count badge at the inline end in `danger-surface` for attention, active state with an `alpha-08` fill, `radius-lg`, `aria-current="page"`, rendered through `render` so a router Link works); `SidebarSection` (12px `text-secondary` label such as "Coming next"; its items may be `disabled`, shown in `text-tertiary` and not focusable as links); `SidebarUser` (initials avatar, name, role) pinned under the items.
- [ ] Squad list variant for the store owner: `SidebarAgent` rows with a 28px `Squadmate`, the agent name, its role in `text-secondary` ("Pisa  Orders"), and a status dot at the inline end (`success` online, `gray-300` idle) with the status as text for screen readers. A head row shows the lead agent (Petra, "Runs 5 squads · Demo store").
- [ ] Under 960px the sidebar collapses behind a menu button into a Dialog sheet from the inline start; focus moves in and returns on close.
- [ ] No OpenUI definition: navigation is app chrome, not streamed content. Say so in `Sidebar.md`.
- [ ] Tests: active item, disabled items skipped by Tab, count badge text, collapse at 390px, RTL mirror, axe.

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
