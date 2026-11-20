---
id: 002
title: Toolbar
milestone: v0.2-tools
category: component
priority: high
files: ["packages/ui/src/react/Toolbar/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Spec: `design/agent-ui/components/Toolbar/README.md`. UI SDK: `toolbar.md`, `toggle.md`, `tooltip.md`.

## Acceptance criteria
- [ ] `Toolbar` built on UI SDK `Toolbar`: a 56px pill with `toolbar-bg`, `shadow-toolbar`, `space-2` padding and `space-2` gaps. Props: `label` (required accessible name), `items`, plus forwarded UI SDK Toolbar props.
- [ ] `items` is an array of `{ type: "toggle", id, label, icon, pressed, onPressedChange, disabled? }`, `{ type: "button", id, label, icon, onClick, disabled? }` and `{ type: "separator", id }`. Toggles use UI SDK `Toggle`; buttons use `ToolbarButton`; separators use `ToolbarSeparator` (a 1px `border` line, 24px tall, vertical).
- [ ] Each control is a 40px round ghost icon button with `label` as its accessible name and a library `Tooltip` with the same text. Pressed: `primary-soft` fill and `primary` ink. Disabled: `text-tertiary`, no hover.
- [ ] Mode groups are the consumer's job: document how to make pan and select exclusive (two toggles whose `pressed` comes from one state). The docs say the order is pan, select, then history, and at most six controls (spec rule).
- [ ] The toolbar does not position itself. Document a bottom-centre placement in `Toolbar.md` (`position: absolute; inset-block-end: space-6; inset-inline: 0; margin-inline: auto; inline-size: fit-content`).
- [ ] Keyboard from UI SDK: one tab stop, arrows move, Home and End jump. In RTL the arrows follow the reading direction.
- [ ] Preview: `/components/Toolbar` shows the toolbar at the bottom centre of a 320px dotted demo canvas: pan and select (exclusive), a separator, undo and redo. Undo is disabled until a mode change happens; redo is disabled. Both locales and themes.
- [ ] Tests: roles and names; one tab stop and arrow movement; exclusive mode toggles in the demo pattern; disabled buttons do not fire; RTL arrow direction; tooltip text; axe.
## Shared rules for this milestone
- Read D25 and D28 in `PLAN.md`, the named spec under `design/agent-ui/components/` in full, and the UI SDK docs named in the task (`node_modules/@ui-sdk/react/docs/components/`). The spec wins on visuals unless this file says otherwise.
- Branch `feat/v0.2-tools-NNN-slug` from `v0.2-tools`. Base the PR on `v0.2-tools`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.test.tsx`, `X.md` (state why there is no OpenUI definition, D28), `X.fixture.en.txt` and `X.fixture.ar.txt` (the preview copy, as other chrome components do), a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Wrap UI SDK parts; keep their part names, `data-slot`s, `render` prop and forwarded props. No hand-rolled roles UI SDK ships. Public entries only.
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Icons are inline SVG line icons (1.7 stroke, `currentColor`, `aria-hidden`), as in Chat.
- No module-scope randomness, dates, timers or `window` access; the components render on the server.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
