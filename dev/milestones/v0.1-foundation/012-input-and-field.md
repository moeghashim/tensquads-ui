---
id: 012
title: Add Input and Field components
milestone: v0.1-foundation
category: component
priority: high
files: ["packages/ui/src/react/Input/**", "packages/ui/src/react/Field/**", "packages/ui/src/styles/input.css", "packages/ui/src/styles/field.css", "apps/preview/**"]
---

## Acceptance criteria
- [ ] Add `Input.tsx`, `Input.openui.ts`, `Input.test.tsx`, and `Input.md`.
- [ ] Add `Field.tsx`, `Field.openui.ts`, `Field.test.tsx`, and `Field.md`.
- [ ] Input behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Field behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Both preview pages show `en/ltr` and `ar/rtl`, light and dark.
- [ ] Playwright screenshots for both at 1440 and 390 px in both directions; no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens in their CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixtures render in both locales.
- [ ] `llms.txt` lists both components.
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
Follow the pinned Input guide and UI SDK field/input entries. Keep labels connected to controls and follow the source distinction between soft and outline inputs.
