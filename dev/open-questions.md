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

## Q3 — Should consumers that only render UI install the Anthropic SDK?

**Context**: PR #13 adds `@anthropic-ai/sdk` 1.10.0 as a regular dependency of `@tensquads/ui`, and `@tensquads/ui/openui/server` re-exports the Anthropic provider. Browser-only consumers install the SDK, and every server consumer loads it even with another provider. The adapter is tested only with a fake client.
**Options**:
  1. Move the provider to its own subpath `@tensquads/ui/openui/server/anthropic` and make the SDK an optional peer dependency.
  2. Keep it as is.
**Recommendation**: Option 1 in v0.2, plus one live smoke test against the API when the tensquads app adopts the server helpers.
**Status**: open — v0.2

## Q4 — Fields the UI needs that the platform message contract lacks

**Context**: D26 maps the platform's owner messages (`moeghashim/tensquads-platform-amp`, commit `c5eaad4`) to library components. The UI restates the contract and must not invent fields. These gaps are known; the platform decides them.
1. `approval_request` has no amount. It has only `limit` (millionths of a US dollar). The owner's reference cards show "$42" and "+$20/day". The card shows the limit, not the amount.
2. `approval_request` has no `bot` and no `taskId`. ApprovalCard accepts both as optional and shows them when present.
3. `action` is a tool id ("refund", "send_reply"). The owner app supplies localized labels through `actionLabels`. The contract has no human title.
4. `status.bot` is an id. It is not confirmed that bot ids are squadmate slugs (petra, pisa, kyoto, rio, zurich, giza). The view shows a squadmate only when the id matches one.
5. No message says that an approval was decided or a question was answered. The view locks a card locally after a decision; after a reload it cannot restore that state unless the host passes `decision`. An `approval_decided` message, or a decided field, would close this.
6. It is not stated whether `reply.text` and `evidence` are plain text or Markdown. The view treats them as plain text and links URLs.
**Status**: open — for the platform owner
