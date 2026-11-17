---
id: 011
title: Add the Menu component
milestone: v0.1-foundation
category: component
priority: high
files: ["packages/ui/src/react/Menu/**", "packages/ui/src/styles/menu.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Menu.tsx`, `Menu.openui.ts`, `Menu.test.tsx`, and `Menu.md`.
- [ ] Behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Preview page shows it in `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in its CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists it.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
Follow the pinned Menu guide and UI SDK menu behavior docs. Preserve Escape and outside-click dismissal, logical placement, item limits, and destructive-item ordering.
