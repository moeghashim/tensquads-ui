---
id: 001
title: Anthropic provider subpath and optional SDK
milestone: v0.2-server
category: package
priority: high
files: ["package.json", "package-lock.json", "packages/ui/src/openui/server/**", "packages/ui/src/entrypoints.test.ts", "packages/ui/src/react/Form/Form.test.tsx", "packages/ui/src/react/Chat/useChat.test.tsx", "scripts/check-pack.mjs", "scripts/check-git-install.mjs", "scripts/docs-examples.tsx", "apps/preview/src/routes/get-started.tsx", "apps/preview/src/routes/-get-started.test.ts", "e2e/get-started.spec.ts", ".agents/skills/tensquads-ui/SKILL.md", "README.md", "llms.txt"]
---

Decision D29 answers Q3. Today `@anthropic-ai/sdk` is a regular dependency and `@tensquads/ui/openui/server` re-exports the Anthropic provider, so every consumer installs the SDK and every server consumer loads it. This task makes the SDK optional.

This changes public API before 1.0. The changes are listed here and approved; do not add others.

## Acceptance criteria

### Package
- [ ] `@anthropic-ai/sdk` leaves `dependencies`. It is in `peerDependencies` with the exact version tested today (`1.10.0`), and `peerDependenciesMeta` marks it `{ "optional": true }`. It stays in `devDependencies` at `1.10.0` so tests and typecheck still run. `package-lock.json` is regenerated with `npm install`, not edited by hand.
- [ ] New export `./openui/server/anthropic` in the root `package.json`, with `types` and `import` like the other entries, pointing at a new entry file `packages/ui/src/openui/server/anthropic.ts`. That file exports `createAnthropicProvider` and `DEFAULT_ANTHROPIC_MODEL` from `./providers/anthropic.js`, and nothing else.
- [ ] `packages/ui/src/openui/server/index.ts` no longer exports or imports anything from `providers/anthropic`. Every other export stays.
- [ ] `providers/anthropic.ts` stays the only file that imports `@anthropic-ai/sdk`. Its behavior does not change.

### Checks
- [ ] `entrypoints.test.ts` covers the new entry.
- [ ] A test proves that `./openui/server` does not load the SDK: for example, a unit test that reads the built or source module graph of `openui/server/index.ts` and finds no `@anthropic-ai/sdk` import, or a pack-fixture import that succeeds with the SDK absent. Pick one and state which in the PR.
- [ ] `check:pack` installs the packed package in a fixture **without** the SDK and imports every export except `./openui/server/anthropic`. It then installs `@anthropic-ai/sdk@1.10.0` in the fixture and imports `./openui/server/anthropic`. Both steps must pass. `check:git-install` follows the same rule if it imports every export.
- [ ] `npm ls` in the fixture shows no `@anthropic-ai/sdk` before the explicit install (the optional peer is not auto-installed).

### Callers and docs
- [ ] Every test, script, doc and example that imports `createAnthropicProvider` or `DEFAULT_ANTHROPIC_MODEL` from `@tensquads/ui/openui/server` or `../server/index` uses the new path.
- [ ] README, `.agents/skills/tensquads-ui/SKILL.md` and the site's Get started page show two imports: provider-neutral helpers from `@tensquads/ui/openui/server`, and `createAnthropicProvider` from `@tensquads/ui/openui/server/anthropic`. Each says, in one sentence, that apps using the Anthropic provider install `@anthropic-ai/sdk` themselves, and gives the tested version.
- [ ] `npm run docs` regenerates `llms.txt`. `npm run verify` passes.

## Shared rules
- Read D29 in `PLAN.md` and Q3 in `dev/open-questions.md`.
- Branch `feat/v0.2-server-001-anthropic-subpath` from `v0.2-server`. Base the PR on `v0.2-server`. Work in the project checkout; do not create git worktrees (D25).
- No new dependencies. No module-scope randomness, dates or timers.
- Docs in Simplified Technical English.
