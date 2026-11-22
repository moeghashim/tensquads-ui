---
id: 003
title: Canvas
milestone: v0.3-workflow
category: component
priority: high
files: ["packages/ui/src/react/Canvas/**", "packages/ui/src/react/workflow/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Spec: `Canvas`. UI SDK core: `definePrimitive`, `createRovingFocus`, `spatialMove`, the drag and commit behaviors (`core.md`, Drag and Drop, Commits, `settleDraft`). Read `agents.md` "Your Own Components": add the `agent` key now (`select`, `move`, `connect`), so v0.3-agent only adds confirmations.

## Acceptance criteria

### Shape and API
- [ ] `Canvas` is a `definePrimitive` primitive (`workflow-canvas`) rendered in React. Props: `graph: WorkflowGraph`, `label` (accessible name), `selection?: { nodes: string[]; edges: string[] }`, `onSelectionChange?`, `viewport?: { x, y, zoom }` with `defaultViewport?` and `onViewportChange?`, `onNodeMove?(id, position, details)`, `onConnect?({ from, fromPort?, to }, details)`, `onDelete?({ nodes, edges }, details)`, `grid?: boolean` (default true), `mode?: "select" | "pan"` (default `select`), `children` (overlays such as MiniMap and Toolbar). `details.source` follows UI SDK (`"pointer"`, `"keyboard"`, `"agent"`).
- [ ] The host owns the graph. Canvas never mutates it; during a drag it shows a draft position and commits once on release (`createCommit` and `settleDraft`).
- [ ] Ground is `canvas` with an optional 20px dot grid. Edges are one SVG layer under the nodes: 1.5px `edge`, `edge-selected` when selected, no arrowheads or labels; while connecting, a 1px dashed `connection-line`. Each edge has an invisible 12px hit stroke for pointer selection.
- [ ] Canvas measures each node's width (ResizeObserver inside an effect, not at module scope) and draws edges between real port positions from `portPosition`. A typed ref handle exposes `getNodeSizes()`, which returns the measured sizes by node id for `tidyLayout`.

### Pointer
- [ ] Drag a node in `select` mode to move it (cursor `grab`, `grabbing` while dragging). A 3px threshold separates a click (select) from a drag.
- [ ] Drag from an output port to any node's body or input port to connect. Self-connections, edges into `start`, edges out of `end`, and an exact duplicate are refused without calling `onConnect`.
- [ ] Drag the empty ground, or anything in `pan` mode, to pan. Wheel pans; ⌘ or Ctrl with the wheel zooms around the pointer, clamped to 0.5–2.
- [ ] Click a node or edge to select it; Shift-click adds to the selection; click the ground to clear it.

### Keyboard and assistive technology
- [ ] The nodes form one roving group: Tab enters at the selected or first node, arrows move to the nearest node in that direction (`spatialMove`, mirrored in RTL), Tab leaves.
- [ ] Enter or Space selects the focused node. Shift+arrow moves the focused node 20px (one commit per key press). Delete or Backspace calls `onDelete` with the selection. Escape clears the selection.
- [ ] Each node has an accessible name of kind and title, and a description listing its outgoing connections by target title ("Connects to Draft reply, Escalate"). Selection is exposed with `aria-selected` in a `listbox` named by `label`, or with the role UI SDK core recommends for a selectable roving group. State the choice in `Canvas.md`.
- [ ] Connecting needs no pointer: `Canvas.md` documents that the Inspector (task 004) offers the keyboard path.

### Direction, themes, layout
- [ ] Graph positions are logical (`x` from the inline start). In RTL the node layer uses `inset-inline-start` and the edge layer mirrors, so flow runs right to left with node text upright.
- [ ] The canvas fills its container and never causes page overflow at 390px.

### Preview and tests
- [ ] `/components/Canvas`: a support workflow (Start → Classify [Refund, Question, Other] → agents → User approval → End, plus a Note) with working move, connect, select, delete, pan and zoom held in page state. Both locales and themes.
- [ ] Tests: controlled behavior (no mutation; one commit per drag); refused connections; selection rules; keyboard focus movement in LTR and RTL; Shift+arrow move; Delete; accessible names and descriptions; the agent key lists `select`, `move`, `connect`; axe. E2E: drag a node, connect two nodes, pan and zoom, in both directions.

## Shared rules for this milestone
- Read D25, D30 and D31 in `PLAN.md`, the named specs under `design/agent-ui/components/` in full, `design/agent-ui/README.md` (Canvas, Iconography, Themes and shortcuts), and the UI SDK docs the task names (`node_modules/@ui-sdk/react/docs/`). The spec wins on visuals unless this file says otherwise.
- Branch `feat/v0.3-workflow-NNN-slug` from `v0.3-workflow`. Base the PR on `v0.3-workflow`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.test.tsx`, `X.md` (state why there is no OpenUI definition, D30, except WorkflowCard), `X.fixture.en.txt` and `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Build what UI SDK does not ship from `@ui-sdk/core` (`definePrimitive`, `createParts`, `createRovingFocus`, `spatialMove`, drag behaviors, `createCommit`). Wrap what it ships. Public entries only. No hand-rolled roles UI SDK ships.
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Icons come from the generated `icons.ts` (task 001), never hand-drawn.
- No module-scope randomness, dates, timers or `window` access; the components render on the server.
- Lists keyed by id, never by index.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
