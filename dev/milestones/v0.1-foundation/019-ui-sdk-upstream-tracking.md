---
id: 019
title: Track every UI SDK release with a daily update job and a compatibility check
milestone: v0.1-foundation
category: ci
priority: high
files: [".github/workflows/ui-sdk-update.yml", "scripts/check-ui-sdk-usage.mjs", "scripts/ui-sdk-update.mjs", "scripts/check-pack.mjs", ".agents/skills/ui-sdk/**", ".claude/skills", "package.json", "package-lock.json"]
---

Runs right after task 005 (CI must exist), before task 006. Added by Opus on 2026-11-17 for decision D14 and PLAN.md §14.

## Acceptance criteria
- [ ] `@ui-sdk/core` and `@ui-sdk/react` are regular dependencies of `@tensquads/ui`, pinned exactly to the same version: the newest release on npm (the `beta` dist-tag while UI SDK is in pre-release; `latest` after 1.0).
- [ ] `npm run check` fails if the two versions differ, and `check-pack` fails if the fixture install holds more than one copy of either package.
- [ ] `scripts/check-ui-sdk-usage.mjs` lists every `@ui-sdk/*` import under `packages/ui/src`. It fails on any `internal` path and on any entry that is not a public entry in the installed UI SDK docs (`node_modules/@ui-sdk/react/docs/llms.txt`, and the core docs for `@ui-sdk/core` imports). `npm run check` runs it. With no components yet, it passes on an empty list and has a unit test with a fake import set.
- [ ] `.agents/skills/ui-sdk/` holds the `ui-sdk` skill from `vercel-labs/ui` at the tag that matches the pinned version, and `.claude/skills` links to `.agents/skills`.
- [ ] `scripts/ui-sdk-update.mjs` does one update: reads the target dist-tag version from npm; if newer, bumps both packages and the lockfile, refreshes the skill from the matching tag, and writes a PR body with the upstream release notes for `@ui-sdk/core` and `@ui-sdk/react` (from the GitHub releases of `vercel-labs/ui`) and the public entries added or removed. It exits 0 with no change when already current. It can run locally (`npm run ui-sdk:update`).
- [ ] `.github/workflows/ui-sdk-update.yml` runs it daily and on manual dispatch. On a change it runs `npm run verify` and opens or updates one PR `chore(deps): ui-sdk <version>` against `main`. If verify fails, the PR still opens, labelled `ui-sdk-break`, with the failing output in the body. It never merges. It uses only the default `GITHUB_TOKEN` with `contents: write` and `pull-requests: write`; ask first if that is not enough for CI to run on the bot PR.
- [ ] A dry-run test of `ui-sdk-update.mjs` against recorded npm and GitHub responses (no network in tests).
- [ ] `npm run verify` exits 0 in CI.

## Suggested approach
UI SDK uses changesets with `fixed: [["@ui-sdk/*"]]`, so all packages share one version, and GitHub releases are tagged per package (`@ui-sdk/react@0.1.0-beta.7`). Bump to the newest release in this PR as part of the work (beta.7 on 2026-11-17, or newer). Do not copy UI SDK source into this repo. The upgrade playbook text belongs in `AGENTS.md` (task 007), not here.
