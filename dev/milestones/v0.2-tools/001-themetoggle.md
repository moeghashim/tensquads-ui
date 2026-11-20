---
id: 001
title: ThemeToggle
milestone: v0.2-tools
category: component
priority: high
files: ["packages/ui/src/react/ThemeToggle/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Spec: `design/agent-ui/components/ThemeToggle/README.md`. UI SDK: `preferences.md`, `button.md`; `@ui-sdk/core` `createPreference` and `createLocalStorage`.

## Acceptance criteria
- [ ] `ThemeToggle`: a 36px round ghost icon button (the header control size, `control-md`). It shows a sun in light and a moon in dark. Its accessible name says what a press does: "Switch to dark theme" / "التبديل إلى المظهر الداكن", and "Switch to light theme" / "التبديل إلى المظهر الفاتح". It is not a pressed toggle; it has no `aria-pressed`.
- [ ] Uncontrolled (default): a `themePreference` built with `createPreference({ values: ["light", "dark"], attribute: "data-theme", storage: createLocalStorage("tensquads.theme") })` on `document.documentElement`. With nothing stored, the first value follows `prefers-color-scheme`. A press stores the other value. Export `themePreference` so hosts can read or set it.
- [ ] Controlled: `value` and `onValueChange(next)` props. When `value` is given, the component neither reads nor writes storage nor `data-theme`.
- [ ] `locale` and `labels` props (`toLight`, `toDark`) override the copy.
- [ ] Export `themeInitScript`: a short inline script string for the host's `<head>` that sets `data-theme` from storage, or from the OS, before first paint. Document it in `ThemeToggle.md` with a TanStack Start example. It must not throw when storage is blocked.
- [ ] Before hydration the button renders the light icon with no theme attribute writes; after mount it shows the current theme. No hydration warning.
- [ ] The sun and moon swap with a 120ms opacity and rotate transition; `prefers-reduced-motion` removes it.
- [ ] Preview: `/components/ThemeToggle` shows the toggle in controlled mode wired to the site's existing `theme` search parameter, so the page and screenshots stay URL-driven. Do not change the site header's segmented control.
- [ ] Tests: the accessible name in both states and both locales; a press calls `onValueChange` with the other value; uncontrolled mode writes `data-theme` and storage; OS dark with nothing stored starts dark; `themeInitScript` evaluated in jsdom sets the attribute and survives a throwing `localStorage`; axe.
## Shared rules for this milestone
- Read D25 and D28 in `PLAN.md`, the named spec under `design/agent-ui/components/` in full, and the UI SDK docs named in the task (`node_modules/@ui-sdk/react/docs/components/`). The spec wins on visuals unless this file says otherwise.
- Branch `feat/v0.2-tools-NNN-slug` from `v0.2-tools`. Base the PR on `v0.2-tools`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.test.tsx`, `X.md` (state why there is no OpenUI definition, D28), `X.fixture.en.txt` and `X.fixture.ar.txt` (the preview copy, as other chrome components do), a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Wrap UI SDK parts; keep their part names, `data-slot`s, `render` prop and forwarded props. No hand-rolled roles UI SDK ships. Public entries only.
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Icons are inline SVG line icons (1.7 stroke, `currentColor`, `aria-hidden`), as in Chat.
- No module-scope randomness, dates, timers or `window` access; the components render on the server.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
