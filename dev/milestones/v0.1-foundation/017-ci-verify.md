---
id: 017
title: Run the full verification pipeline in CI
milestone: v0.1-foundation
category: ci
priority: high
files: [".github/workflows/**", "package.json", "playwright.config.*", "e2e/**", "scripts/**"]
---

## Acceptance criteria
- [ ] Add CI that runs `npm run verify` on supported changes.
- [ ] `verify` runs the check and browser suites from PLAN.md §5.
- [ ] Playwright covers 1440 px and 390 px screenshots, axe, both directions, and OpenUI round trips.
- [ ] Unit and behavior tests cover the smoke floor and each component's documented keyboard, focus, and state behavior.
- [ ] CI fails on design hash drift, raw color literals in component CSS, type errors, lint errors, and test failures.
- [ ] Report the exact local command and exit code used to verify the workflow.

## Suggested approach
Run verification after the preview and all component and bridge tasks are merged. Keep CI commands aligned with `npm run verify`; exit 0 is the milestone gate.
