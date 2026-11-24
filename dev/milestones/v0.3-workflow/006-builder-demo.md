---
id: 006
title: Builder demo page
milestone: v0.3-workflow
category: site
priority: high
files: ["apps/preview/**", "e2e/**", "packages/ui/src/react/**/*.md", "llms.txt", "README.md"]
---

`design/agent-ui/README.md` (layout, Themes and shortcuts, Chat) and every v0.3 spec. D28 deferred the builder content of Toolbar and CommandPalette to this task.

Approved design (Moe, 2026-11-24): `apps/preview/.impeccable/mocks/nodes/nodes-light.html` and `nodes-dark.html`, built by `nodes.mjs`. The comp wins on layout and copy. The component specs win on component visuals. The comp uses text glyphs as icon placeholders; use the generated icons. This page is built on the design-system site from v0.3-design-system (D32), not on the old site.

## Acceptance criteria
- [ ] The site nav gets a "Nodes" link (Arabic "العُقَد"), between Components and Chat. It opens `/nodes`: the builder with the "Support triage" demo workflow, as in the comp.
- [ ] The builder header: the crumb "Workflows / <name>" (the "Workflows" part links to `/workflows`), the status Badge, then on the inline end a "Guide" toggle, "Search ⌘K" and "Tidy layout ⌘⇧L" buttons.
- [ ] `/workflows`: a grid of three WorkflowCards (the demo workflows). Each opens the builder for its workflow at `/nodes/<id>`; `/nodes` is the same as `/nodes/support`. `/workflows` is not in the nav.
- [ ] A "How to build a workflow" guide card floats over the canvas with six steps: Add, Connect, Edit, Move, Delete, Undo. Each step has a one-line how-to and its `kbd` hint, as in the comp. "Hide guide" closes it and the header "Guide" button reopens it. The page remembers the choice for the session only (page state).
- [ ] The Inspector, for the selected node: Title, Squadmate (agent nodes), Instructions, a Connections list (from and to, with the branch label, and "+ Connect to a step"), and footer actions "Duplicate ⌘D" and "Delete step ⌫". With nothing selected it shows a short hint to select a step.
- [ ] The MiniMap sits at the bottom inline start on this page, as in the comp, because the Inspector covers the inline end (MiniMap `placement="start"`, task 005).
- [ ] The builder: full-height Canvas; Palette floating at `page-gutter` on the inline start; Inspector at the inline end for the selected node (none when nothing is selected); MiniMap; the Toolbar at the bottom centre with pan and select (exclusive), undo and redo; a header with the workflow name, its status Badge and the ThemeToggle.
- [ ] All state is page state with an undo and redo history (moves, connects, inserts, deletes, field edits, tidy layout). No server, no storage beyond the theme.
- [ ] Shortcuts from the design README: `V` and `S` switch pan and select, `⌘Z` and `⇧⌘Z` undo and redo, `⌘D` duplicates the selection, Delete deletes it, `⌘⇧L` tidies the layout. A browser can reserve `⌘⇧L`, so the palette action is always available. They do not fire while typing in a field. Each appears as a `kbd` hint in its tooltip or palette row.
- [ ] CommandPalette on `⌘K` with the builder groups: Add node (every palette kind), Jump to (every node by title; selects it and pans it into view), Actions (undo, redo, tidy layout, toggle theme). It replaces the site palette on this page and keeps the site's page links in a last group.
- [ ] Tidy layout calls `tidyLayout` with the Canvas's measured sizes and applies every position as one undo step, then pans so the graph is in view. Selection and focus stay. It does nothing on an empty graph. Nodes move with a short transition, and without one under reduced motion. The Toolbar gets no tidy button (its spec allows pan, select and history).
- [ ] Inserting from the Palette places the node to the inline-end of the selection, or at the viewport centre.
- [ ] Both locales: Arabic node titles, labels and copy; the graph mirrors in RTL.
- [ ] Mobile (390px): the Palette and Inspector collapse into toggled sheets; no page overflow.
- [ ] E2E: build a small flow by keyboard only (insert, connect through the Inspector, move with Shift+arrows, undo); the same with the pointer; ⌘K jump; tidy a messy graph from the palette and from `⌘⇧L`, check that no nodes overlap and that one undo restores every position; both locales and themes; axe; no overflow.

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
