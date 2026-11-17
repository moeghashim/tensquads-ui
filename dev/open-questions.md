# Open questions

## Q1 — Choose the npm git dependency package shape

**Context**: PLAN.md §6 and Decisions log D13 leave open whether the package root re-exports the package in `packages/ui` or a built `dist` branch supplies the package root. This choice affects the initial scaffold and consumer install path.
**Options**:
  1. Use the repository root as a thin npm package. Its exports point to `packages/ui` build output, and its prepare step builds that output for a pinned Git dependency.
  2. Publish a built `dist` branch with package files at its root.
**Recommendation**: Use a root package entry that exposes the workspace package; it keeps source, docs, preview, and package in one reviewed commit and avoids maintaining a second distribution branch.
**Status**: answered
**Resolution** (Opus, 2026-11-17): Option 1. The repository root `package.json` is the installable package `@tensquads/ui`. Its `exports` map points at `packages/ui/dist/**` (JS, `.d.ts`, CSS). A `prepare` script builds `dist`, so `npm install github:moeghashim/tensquads-ui#<sha>` works with no second branch. `dist/` is git-ignored. Task 001 adds a check that runs `npm pack`, installs the tarball into a temporary fixture, and imports every subpath export. PLAN.md D13 updated.

## Q2 — Which fonts does the product load, and which face is used for Arabic UI text?

**Context**: `design/agent-ui/README.md` names Inter (Latin) and JetBrains Mono (code) as substitutes, but neither the package nor the preview app loads them. The tokens define no Arabic face. The website uses El Messiri only for the بنّاء wordmark. PR #5 loads Inter for screenshot tests only.
**Options**:
  1. `@tensquads/ui` ships `fonts.css` with self-hosted Inter, JetBrains Mono and one Arabic UI face (for example IBM Plex Sans Arabic or Noto Sans Arabic, both OFL), and consumers import it.
  2. Each consumer loads fonts itself; the package documents the families the tokens expect.
**Recommendation**: Option 1, so every surface renders the same and RTL screenshots match production.
**Status**: answered
**Resolution** (Opus, 2026-11-17): Option 1 with IBM Plex Sans Arabic, the face the tensquads website already loads next to Inter and JetBrains Mono. Recorded as PLAN.md D17; task 020 adds `fonts.css`.
