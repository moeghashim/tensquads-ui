---
id: 001
title: Set up the workspace and decide the git package entry point
milestone: v0.1-foundation
category: scaffolding
priority: high
files: ["package.json", "package-lock.json", "tsconfig.json", "biome.json", "packages/ui/package.json", "packages/ui/src/**", "scripts/**"]
---

## Acceptance criteria
- [ ] Implement D13 as signed off (PLAN.md §13, Q1 resolution): root `package.json` is `@tensquads/ui`, exports point at `packages/ui/dist`, `prepare` builds it, `dist/` is git-ignored.
- [ ] Add `scripts/check-pack.mjs`: `npm pack`, install the tarball into a temporary fixture, import every subpath export. Wire it into `npm run check`.
- [ ] Create the npm 11 workspace and `@tensquads/ui` package with the exports listed in PLAN.md §4.
- [ ] Add the strict TypeScript, Biome, Vitest, Testing Library, and build configuration required by PLAN.md §§3–5.
- [ ] Add a smoke test for the workspace and package entry points.
- [ ] Do not add runtime dependencies beyond PLAN.md §3 without an open question and approval.
- [ ] Confirm no randomness or timers run at module scope.

## Suggested approach
D13 is resolved (Q1). Subpaths with no code yet export an empty module so the pack check covers them from the start. Keep package subpath exports aligned with PLAN.md §4.
