---
id: 005
title: MiniMap and WorkflowCard
milestone: v0.3-workflow
category: component
priority: high
files: ["packages/ui/src/react/MiniMap/**", "packages/ui/src/react/WorkflowCard/**", "packages/ui/src/react/workflow/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Specs: `MiniMap`, `WorkflowCard`. UI SDK: `menu.md`.

## Acceptance criteria

### MiniMap
- [ ] Rendered as a Canvas child. It reads the graph, the viewport and the canvas size from Canvas context and shows only while the graph's bounds exceed the visible area; it hides again when everything fits.
- [ ] 180×110 `panel` card, `radius-xl`, at the bottom inline-end corner, 16px from the edges. A `placement?: "end" | "start"` prop (default `"end"`) moves it to the bottom inline-start corner; the Nodes page (task 006) needs it because its Inspector covers the inline end. Nodes are family-tinted rectangles at scale; no labels, no edges. The viewport is an `alpha-06` mask with an `alpha-20` outline. Dragging the mask, or clicking the map, pans the canvas through `onViewportChange`.
- [ ] It has an accessible name ("Minimap") and is hidden from the Canvas roving group; arrow keys on the focused minimap pan by 10% of the viewport.

### WorkflowCard
- [ ] Props: `name`, `status: "draft" | "live"`, `meta`, `stats` (exactly three `{ label, value }`: runs in the last 7 days, grader pass rate, last run), `graph: WorkflowGraph`, `href` (the card is one link), `onAction?(action)` for Open, Duplicate, Publish or Unpublish, and Delete.
- [ ] A 132px thumbnail drawn from `graph` (never a screenshot): dotted `canvas` ground, nodes as small white cards with family tiles, hairline edges, fitted to the box, mirrored in RTL. Decorative (`aria-hidden`); the card's name carries meaning.
- [ ] Name at 16px/600 beside a Draft (neutral) or Live (success) Badge; the meta line; a `border-subtle` rule; the three stats.
- [ ] The `…` button (`more` glyph, labelled) opens the library Menu: Open, Duplicate, Publish or Unpublish, a separator, then Delete in `danger`. Pressing it does not follow the link. Hover lifts the card with `shadow-300`.
- [ ] OpenUI definition `WorkflowCard` (D30): props `name`, `status`, `meta`, `stats`, `graph`; no `href` and no actions in streamed content. Round-trip fixtures in both locales.
- [ ] Preview: `/components/MiniMap` (a large graph so the map shows, and a small one so it hides) and `/components/WorkflowCard` (a grid of three: live, draft, an empty graph). Both locales and themes.
- [ ] Tests: minimap visibility rule, mask drag and click pan, keyboard pan; card link, menu does not navigate, menu items and danger last, stats count, thumbnail fit; OpenUI round trip; axe.

## Shared rules for this milestone
- Read D25, D30 and D31 in `PLAN.md`, the named specs under `design/agent-ui/components/` in full, `design/agent-ui/README.md` (Canvas, Iconography, Themes and shortcuts), and the UI SDK docs the task names (`node_modules/@ui-sdk/react/docs/`). The spec wins on visuals unless this file says otherwise.
- Branch `feat/v0.3-workflow-NNN-slug` from `v0.3-workflow`. Base the PR on `v0.3-workflow`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.test.tsx`, `X.md` (state why there is no OpenUI definition, D30, except WorkflowCard), `X.fixture.en.txt` and `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Build what UI SDK does not ship from `@ui-sdk/core` (`definePrimitive`, `createParts`, `createRovingFocus`, `spatialMove`, `createViewport`, `createMove`, `createConnect`). Wrap what it ships. Public entries only. No hand-rolled roles UI SDK ships.
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Icons come from the generated `icons.ts` (task 001), never hand-drawn.
- No module-scope randomness, dates, timers or `window` access; the components render on the server.
- Lists keyed by id, never by index.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
