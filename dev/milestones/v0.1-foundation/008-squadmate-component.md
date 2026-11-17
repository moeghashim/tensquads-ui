---
id: 008
title: Move Squadmate into the shared UI package
milestone: v0.1-foundation
category: squadmates
priority: high
files: ["packages/ui/src/squadmates/**", "packages/ui/src/react/Squadmate/**", "packages/ui/package.json"]
---

## Acceptance criteria
- [ ] Move the approved `draw.ts`, `index.ts`, `mascots.ts`, and `roster.ts` behavior from tensquads `packages/squadmates` at `0a1d7f9`; do not edit that repository.
- [ ] Export the Squadmate component, roster, state types, and markup API through `@tensquads/ui/squadmates`.
- [ ] Add the four component files: `Squadmate.tsx`, `Squadmate.openui.ts`, `Squadmate.test.tsx`, and `Squadmate.md`.
- [ ] Add a preview for `en/ltr` and `ar/rtl`, light and dark.
- [ ] Behavior tests cover keyboard, focus, and every documented state. All pass.
- [ ] Playwright screenshots cover 1440 px and 390 px in both directions; there is no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px `#0169cc`, offset 2px.
- [ ] Only Agent-UI tokens appear in component CSS; a lint script checks for raw color literals.
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists Squadmate. `npm run verify` exits 0 in CI.

## Suggested approach
Keep the moved drawing and roster behavior faithful to the source commit. Avoid module-scope randomness or timers. If the component has no meaningful OpenUI use, explain why in `Squadmate.md` and keep its definition consistent with the shared API.
