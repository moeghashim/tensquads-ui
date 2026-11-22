---
id: 002
title: Workflow graph schema, Node and BranchNode
milestone: v0.3-workflow
category: component
priority: high
files: ["packages/ui/src/schemas/**", "packages/ui/src/react/Node/**", "packages/ui/src/react/workflow/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Specs: `Node`, `BranchNode`, `Canvas` (ports and connectors). Design reference: `design/agent-ui/components/bundle.js` (`Node`, `FAMILY`, `edgePath`).

## Acceptance criteria

### Schema (`@tensquads/ui/schemas`)
- [ ] `WorkflowNodeKindSchema`: `agent`, `classify`, `if-else`, `while`, `user-approval`, `start`, `end`, `note`, `file-search`, `guardrails`, `mcp`, `transform`, `set-state`.
- [ ] `WORKFLOW_KIND_FAMILY` maps each kind to one of six families: `agent`, `logic`, `end`, `note`, `tool`, `data` (D30). `WORKFLOW_KIND_ICON` maps each kind to an `IconName`: agent→`agent`, classify→`classify`, if-else→`ifelse`, while→`while`, user-approval→`approval`, start→`play`, end→`end`, note→`note`, file-search→`file`, guardrails→`shield`, mcp→`mcp`, transform→`transform`, set-state→`state`.
- [ ] `WorkflowGraphSchema` (strict): `nodes`: `{ id, kind, title, meta?, position: { x, y }, branches?: string[] }`; `edges`: `{ id, from, fromPort?, to }`. `fromPort` is the branch index for a branch node and is absent otherwise. Refinements: unique node and edge ids; every edge's `from` and `to` exist; `fromPort` is in range; no edge into `start`, none out of `end`; `branches` only on `classify`, `if-else` and `guardrails`, with at least two entries. Export the inferred types.

### Geometry (`packages/ui/src/react/workflow/geometry.ts`, exported)
- [ ] `edgePath(x1, y1, x2, y2)` returns the spec's path exactly: horizontal tangents, both control points at the midpoint x.
- [ ] `NODE_METRICS` holds the numbers ports depend on (head row height, branch row height 28, `space-1` and `space-2` gaps in px, port size 8) as constants read from the token values, and `portPosition(node, "in" | { out: index })` returns the port centre in graph coordinates from the node position and its measured width. Width is measured by Canvas (task 003); here, accept it as an argument.

### Tidy layout (`packages/ui/src/react/workflow/tidy.ts`, exported)
- [ ] `tidyLayout(graph, sizes?)` returns new positions as `Record<string, { x, y }>`. It is pure and deterministic, and it never changes its input. `sizes` is `Record<string, { width, height }>`. A missing size uses a default width and the height from `NODE_METRICS`.
- [ ] Columns: a node sits one column after its furthest predecessor. Edges that close a loop (for example, back to a `while`) are found in node order and ignored for columns. Start is in the first column.
- [ ] Order inside a column follows the order of the parents and their branch ports, so branches read top to bottom without needless crossings. Ties keep the order in `graph.nodes`.
- [ ] Gaps: 80px between columns (measured from the widest node) and 40px between nodes in a column. Columns are centred on one horizontal axis. Positions snap to the 20px grid without reducing a gap below 40px.
- [ ] Nodes with no edges, including notes, go in one row under the flow, in `graph.nodes` order. The top inline-start corner of the graph's bounds stays where it was, snapped to the 20px grid.
- [ ] Running it twice gives the same positions. `x` is logical, so the function needs no direction argument.
- [ ] Tests: a chain, a branch that joins again, a loop, unconnected nodes and notes, an empty graph, varied sizes (no two nodes overlap), repeat runs, and an unchanged input.

### Node (one component; BranchNode is `Node` with `branches`)
- [ ] `Node` props: `kind`, `title`, `meta?`, `branches?`, `selected?`, plus forwarded div props. It is presentational: no position, no events of its own. Canvas (task 003) places it.
- [ ] Visuals from the spec: `node-surface` card, `radius-2xl`, `node-ring` (`node-ring-selected` when selected; no fill change), 28px tile tinted by family with the glyph in `node-ink`, `node-title` and `node-meta` type, one line, the card grows to fit. Note shows no meta line.
- [ ] Ports: input dot on the inline-start edge centred on the head row (none for `start`); output dot on the inline-end edge (none for `end`); with branches, one output per branch row and none on the head. 8px `handle` with `shadow-handle`. Ports carry `data-port="in"` or `data-port="out"` and `data-port-index`.
- [ ] Branch rows: 28px, `branch-bg`, `radius-md`, label end-aligned in `branch-label` and `text-tertiary`, `space-1` between rows, `space-2` under the head. Rows are never coloured by outcome.
- [ ] In RTL the ports swap sides through logical properties.
- [ ] Preview `/components/Node`: one node of each of the thirteen kinds on a dotted ground, a selected node, an If/else with two conditions and Else, a Guardrails with Pass and Fail. Both locales and themes.
- [ ] Tests: schema valid and invalid cases for each refinement; `edgePath` exact string; ports per kind and per branch; selected ring; RTL port sides; axe.

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
