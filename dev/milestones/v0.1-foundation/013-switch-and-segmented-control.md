---
id: 013
title: Add Switch and SegmentedControl components
milestone: v0.1-foundation
category: component
priority: high
files: ["packages/ui/src/react/Switch/**", "packages/ui/src/react/SegmentedControl/**", "packages/ui/src/styles/switch.css", "packages/ui/src/styles/segmented-control.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Switch.tsx`, `Switch.openui.ts`, `Switch.test.tsx`, and `Switch.md`.
- [ ] Add `SegmentedControl.tsx`, `SegmentedControl.openui.ts`, `SegmentedControl.test.tsx`, and `SegmentedControl.md`.
- [ ] Switch behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] SegmentedControl behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Both preview pages show `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots for both at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in their CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixtures render in both locales.
- [ ] `llms.txt` lists both components.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
Follow both pinned design guides and the UI SDK switch and radio/segmented behavior entries. Keep the switch label external to the track and use SegmentedControl for exclusive modes only.
