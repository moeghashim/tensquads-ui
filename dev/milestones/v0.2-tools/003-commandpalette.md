---
id: 003
title: CommandPalette and the site palette
milestone: v0.2-tools
category: component
priority: high
files: ["packages/ui/src/react/CommandPalette/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Spec: `design/agent-ui/components/CommandPalette/README.md`. UI SDK: `command.md`, `dialog.md`. The builder groups (Add node with node tiles, Jump to) wait for v0.3 (D28).

## Acceptance criteria
- [ ] `CommandPalette` built on UI SDK `Dialog` and `Command`. Props: `open`, `onOpenChange`, `groups`, `locale`, `labels` (`placeholder`, `empty`, `navigate`, `select`, `close`, `title`), plus `className`.
- [ ] `groups` is an array of `{ id, label, items }`. An item is `{ id, label, keywords?, icon?, hint?, onSelect }`. `hint` shows as `kbd` keys at the row end (for example `["⌘", "D"]`). No nested groups.
- [ ] Layout: the dialog floats at 12vh from the top over the library backdrop. A 560px card (`max-inline-size: calc(100vw - 2 * space-4)`), `surface-elevated`, `radius-2xl`, `shadow-400`. The search row is 16px text with a search glyph at the start and an `esc` key hint at the end. Then the grouped list (max block size 60vh, scrolls), then a footer with the key hints `↑↓` navigate, `↵` select, `esc` close.
- [ ] Rows are 40px with a 16px icon slot. The highlighted row uses `ghost-hover`. Group labels are `text-xs` `text-secondary`.
- [ ] Typing filters across all groups by label and keywords. A group with no matches disappears. No matches at all shows "No matches" / "لا توجد نتائج". The query resets each time the palette opens.
- [ ] Selecting an item calls `onSelect` and then closes the palette. `esc` and a backdrop click close it. Focus returns to the element that had it.
- [ ] Export `useCommandPaletteShortcut(onOpen)`: binds `⌘K` on Apple platforms and `Ctrl+K` elsewhere, prevents the browser default, and ignores the key while an IME composition is active. It attaches in an effect, never at module scope.
- [ ] RTL: the search glyph and hints follow the reading direction; the `↑↓` hint keeps its glyphs.
- [ ] Site palette: the preview site mounts one palette in the site shell, opened by the shortcut and by a 36px "Search" ghost button with a `⌘K` hint in the header (icon only below 640px, with an accessible name). Groups: **Pages** (Home, Get started, Components, Chat, Admin dashboard, Store owner dashboard), **Components** (every registry entry, keywords from its description), **Settings** (Switch to Arabic or English, Light, Dark, System). Settings change the existing search parameters. Both locales.
- [ ] Preview: `/components/CommandPalette` shows a button that opens a demo palette with three groups.
- [ ] Tests: open and close by shortcut, button, `esc` and backdrop; filtering and group hiding; "No matches"; arrow and enter selection calls `onSelect` and closes; focus return; IME guard; both locales; axe on the open dialog. E2E: open the site palette with the shortcut, filter to a component, press enter, and land on its page.
## Shared rules for this milestone
- Read D25 and D28 in `PLAN.md`, the named spec under `design/agent-ui/components/` in full, and the UI SDK docs named in the task (`node_modules/@ui-sdk/react/docs/components/`). The spec wins on visuals unless this file says otherwise.
- Branch `feat/v0.2-tools-NNN-slug` from `v0.2-tools`. Base the PR on `v0.2-tools`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.test.tsx`, `X.md` (state why there is no OpenUI definition, D28), `X.fixture.en.txt` and `X.fixture.ar.txt` (the preview copy, as other chrome components do), a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Wrap UI SDK parts; keep their part names, `data-slot`s, `render` prop and forwarded props. No hand-rolled roles UI SDK ships. Public entries only.
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Icons are inline SVG line icons (1.7 stroke, `currentColor`, `aria-hidden`), as in Chat.
- No module-scope randomness, dates, timers or `window` access; the components render on the server.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
