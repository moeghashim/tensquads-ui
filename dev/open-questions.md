# Open questions

## Q1 — Choose the npm git dependency package shape

**Context**: PLAN.md §6 and Decisions log D13 leave open whether the package root re-exports the package in `packages/ui` or a built `dist` branch supplies the package root. This choice affects the initial scaffold and consumer install path.
**Options**:
  1. Use the repository root as a thin npm package. Its exports point to `packages/ui` build output, and its prepare step builds that output for a pinned Git dependency.
  2. Publish a built `dist` branch with package files at its root.
**Recommendation**: Use a root package entry that exposes the workspace package; it keeps source, docs, preview, and package in one reviewed commit and avoids maintaining a second distribution branch.
**Status**: open
