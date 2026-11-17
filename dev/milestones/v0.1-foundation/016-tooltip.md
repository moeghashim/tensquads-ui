---
id: 016
title: Add the Tooltip component
milestone: v0.1-foundation
category: component
priority: medium
files: ["packages/ui/src/react/Tooltip/**", "packages/ui/src/styles/tooltip.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Tooltip.tsx`, `Tooltip.openui.ts`, `Tooltip.test.tsx`, and `Tooltip.md`.
- [ ] Behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Preview page shows it in `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in its CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists it.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
No Tooltip component guide exists in the pinned design source. Use the UI SDK Tooltip behavior docs and the documented `shadow-overlay` and `shadow-hairline` tokens. If a required visual value is missing, add an open question before implementation.
