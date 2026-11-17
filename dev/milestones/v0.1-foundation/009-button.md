---
id: 009
title: Add the Button component
milestone: v0.1-foundation
category: component
priority: high
files: ["packages/ui/src/react/Button/**", "packages/ui/src/styles/button.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Button.tsx`, `Button.openui.ts`, `Button.test.tsx`, and `Button.md`.
- [ ] Behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Preview page shows it in `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in its CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists it.
- [ ] Remove the placeholder test component from task 006.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
Follow the pinned Button guide and UI SDK button behavior docs. Keep API props within PLAN.md conventions and use only token-defined variants and states.
