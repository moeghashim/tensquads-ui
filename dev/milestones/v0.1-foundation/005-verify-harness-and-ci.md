---
id: 005
title: Add the verify harness and CI before any component
milestone: v0.1-foundation
category: ci
priority: high
files: [".github/workflows/**", "package.json", "playwright.config.*", "e2e/**", "scripts/check-css-tokens.mjs", "scripts/**"]
---

## Acceptance criteria
- [ ] `npm run check` runs Biome, typecheck, `design:check` and the unit tests.
- [ ] `npm run e2e` runs Playwright against the preview app. It has reusable helpers that later component tasks call: screenshot at 1440 px and 390 px in en/ltr and ar/rtl, light and dark; assert no horizontal scroll at 390 px; run axe; assert the focus ring is 2px in the `--ts-ring` colour of the active theme (`#0169cc` light, `#0285ff` dark) with a 2px offset.
- [ ] `scripts/check-css-tokens.mjs` fails on raw colour literals (hex, `rgb()`, `hsl()`, named colours) in `packages/ui/src/styles/**`. It allows `var(--…)` only. `npm run check` runs it.
- [ ] `npm run verify` runs `check` then `e2e`.
- [ ] GitHub Actions runs `npm run verify` on every pull request and on `main`. Playwright installs Chromium in CI.
- [ ] CI installs the PR head as a git dependency (`npm install git+file://…#<sha>` in a temporary fixture, so `prepare` runs) and imports every subpath. `check-pack` covers the tarball; this covers the real consumer path (D13).
- [ ] CI runs `npm run preview:install` and `npm run check:preview` (D16), and Biome also checks `apps/preview/src/**` (today Biome only covers packages/ and scripts/).
- [ ] Follow-ups from the PR #4 review: `apps/preview/src/routes/index.tsx` reuses `getPreviewState` from `state.ts` instead of repeating the locale, direction and theme parsing; the preview dev server binds to localhost by default (drop `--host 0.0.0.0`; Playwright uses localhost).
- [ ] A smoke e2e test opens the preview app home in both directions and passes.
- [ ] Report the local `npm run verify` command and its exit code in the PR.

## Suggested approach
This task moved forward from the end of the milestone (review by Opus, 2026-11-17). Every component task must be able to prove its §12 checklist in its own PR, so the harness and CI exist first. Later tasks add tests; they do not change this harness except to extend it. The milestone gate is the same command on the final merge: `npm run verify` exits 0 in CI.
