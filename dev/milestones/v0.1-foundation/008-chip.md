---
id: 008
title: Add the Chip component
milestone: v0.1-foundation
category: component
priority: high
files: ["packages/ui/src/react/Chip/**", "packages/ui/src/styles/chip.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Chip.tsx`, `Chip.openui.ts`, `Chip.test.tsx`, and `Chip.md`.
- [ ] Behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Preview page shows it in `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in its CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists it.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
Follow the pinned Chip guide. Preserve its object-attachment meaning and wrap long identifiers rather than truncating below the documented limit.
