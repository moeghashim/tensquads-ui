---
id: 004
title: Palette and Inspector
milestone: v0.3-workflow
category: component
priority: high
files: ["packages/ui/src/react/Palette/**", "packages/ui/src/react/Inspector/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Specs: `Palette`, `Inspector`. UI SDK: `select.md`, `textarea` if shipped, the library's Input, Switch, Chip, Button and Menu.

## Acceptance criteria

### Palette
- [ ] 200px (`palette-width`) panel: `panel`, 0.5px `panel-border`, `radius-2xl`, `space-2` padding. Props: `label`, `sections: { id, label, items: { kind, label }[] }[]`, `onInsert(kind, details)`, where `details` has the `source` and, for a drop, the `position`. `DEFAULT_PALETTE_SECTIONS` (exported, one list for each of `en` and `ar`) has Core (agent, end, note), Tools (file-search, guardrails, mcp), Logic (if-else, while, user-approval, classify), Data (transform, set-state), in that order. Start is not in the palette.
- [ ] Section labels in `palette-section` and `text-tertiary`; 40px rows with a 24px tinted tile (14px glyph) and the label in `palette-item`. Hover `ghost-hover`, press `ghost-active`. No search, no descriptions.
- [ ] A row inserts on click or Enter. It is also draggable: dropping it on a Canvas calls `onInsert` with the drop position in graph coordinates. `CanvasHandle` gets `pointAt(clientX, clientY)`, which returns the logical graph position, or null outside the canvas or on an overlay. The Palette takes that handle's ref as an optional `canvas` prop. Dragging is for mouse and pen; a touch press scrolls or inserts. Keyboard: one roving group (UI SDK vertical Toolbar), arrows move, Home and End jump.
- [ ] The palette does not position itself; document the spec placement.

### Inspector
- [ ] 360px panel: `panel`, 0.5px `panel-border`, `radius-2xl`, `space-4` padding. Props: `title`, `description`, `fields`, `onDuplicate?`, `onDelete?`, `footer?` (defaults to `More` and `Evaluate` ghost buttons with callbacks `onMore?` and `onEvaluate?`; hidden when neither is given).
- [ ] Head: `panel-title`, a one-line `panel-description` in `text-tertiary`, duplicate and delete ghost icon buttons (`copy`, `trash`) with labels and tooltips.
- [ ] `fields` is a list of `{ type: "text", id, label, value, onValueChange }`, `{ type: "select", id, label, value, options, onValueChange }`, `{ type: "switch", id, label, checked, onCheckedChange }`, `{ type: "longtext", id, label, value, onValueChange, actions? }`, `{ type: "chips", id, label, items, onAdd?, onRemove? }`, and `{ type: "connections", id, label, targets: { id, title }[], value: string[], onValueChange }`. Each row is 28px: label on the inline start (`field-label`, `text-emphasis`, 60px minimum), control on the inline end. Text uses the soft Input (`input-bg`, no border). Select is inline: `field-value` with the `updown` glyph and no border, the whole row is the trigger (UI SDK Select). Long text stacks with a textarea.
- [ ] `connections` is the keyboard path for connecting (D30): a multiple Select of target nodes. The builder demo maps it to `onConnect` and edge deletes.
- [ ] A `border` divider precedes the footer. No section headings, no input borders.
- [ ] The Canvas preview page passes the page direction to `Canvas`, so it follows the direction control.
- [ ] Preview: `/components/Palette` and `/components/Inspector` with an agent node's fields (Name, Instructions, Model select, Reasoning switch, Output schema chips, Connects to). Both locales and themes.
- [ ] Tests: palette order and insert by click, keyboard and drop; inspector rows by type, the inline select, connections changes, duplicate and delete callbacks; axe.

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
