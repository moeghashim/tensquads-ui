---
id: 001
title: Set up the workspace and decide the git package entry point
milestone: v0.1-foundation
category: scaffolding
priority: high
files: ["package.json", "package-lock.json", "tsconfig.json", "biome.json", "packages/ui/package.json", "packages/ui/src/**", "scripts/**"]
---

## Acceptance criteria
- [ ] Resolve D13 with Opus before implementing the package entry point. Record the approved value in PLAN.md §13.
- [ ] Create the npm 11 workspace and `@tensquads/ui` package with the exports listed in PLAN.md §4.
- [ ] Add the strict TypeScript, Biome, Vitest, Testing Library, and build configuration required by PLAN.md §§3–5.
- [ ] Add a smoke test for the workspace and package entry points.
- [ ] Do not add runtime dependencies beyond PLAN.md §3 without an open question and approval.
- [ ] Confirm no randomness or timers run at module scope.

## Suggested approach
Use Q1's recommendation as the proposal. The root package entry should preserve a single source commit and consumer install path. Treat D13 as unresolved until Opus approves it; do not ship either shape before that approval. Keep package subpath exports aligned with PLAN.md §4.
