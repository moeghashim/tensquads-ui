---
id: 015
title: Add the Dialog component
milestone: v0.1-foundation
category: component
priority: high
files: ["packages/ui/src/react/Dialog/**", "packages/ui/src/styles/dialog.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Dialog.tsx`, `Dialog.openui.ts`, `Dialog.test.tsx`, and `Dialog.md`.
- [ ] Behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Preview page shows it in `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in its CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists it.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
No Dialog component guide exists in the pinned design source. Use the UI SDK Dialog behavior docs and only documented Agent-UI tokens for the surface, radius, and shadow. If a required visual value is missing, add an open question before implementation.
