# Repository instructions

## What this repository is

tensquads-ui is the shared React UI library for tensquads and بنّاء. It provides token-based components for hand-built screens and OpenUI streams, with behavior from UI SDK and visuals from the synced Agent-UI design system. Each component has one React implementation and, where applicable, one OpenUI definition.

## Source of truth

Use this order when sources disagree:

1. The Decisions log in `PLAN.md`.
2. The task file for the work.
3. Files under `design/`, which are synced reference files. Never edit them by hand. Only `npm run design:sync` writes `design/`.

`PLAN.md` defines architecture and shared rules. The task file defines the approved scope. Stop and record an open question when the task and Decisions log conflict.

## Read order and session receipt

At the start of every session, read:

1. `AGENTS.md`.
2. `PLAN.md`, including its full Decisions log and any relevant sections.
3. The assigned task file.
4. `README.md`, `.agents/skills/ui-sdk/SKILL.md`, and `.agents/skills/tensquads-ui/SKILL.md` before component work.
5. The files named by the task.

Before changing code, send a receipt listing the files read and the output of `npm run check`. State any conflicts or questions. If a decision is required, stop and wait for the owner.

## Workflow

- Work on one task, one branch, and one pull request. Name the branch `feat/<milestone>-NNN-slug`, using hyphens. Git cannot create a task branch nested under a milestone branch with the same prefix.
- Start every run with `no-mistakes axi run --base-branch <milestone branch> --intent "<one line>"` and drive it to an `outcome:` before pushing.
- Set the PR base to the milestone branch when opening it. Do not open it against `main`; that makes the DCO check include the full milestone history.
- Use Conventional Commit messages and sign off every commit with the required DCO identity. Do not amend or rewrite commits during a run. A rewrite can strand the branch in the gate.
- Push only through `no-mistakes`. If a commit is unsigned, stop and report its SHA. If a branch is stranded, stop and report it. Never force-push.
- Handle `ask-user` findings by accepting fixes that bring the change into line with `PLAN.md`; reject out-of-scope findings with a reason. Stop if a finding conflicts with the Decisions log.
- Opus reviews and merges after its sign-off and green checks (PLAN.md D15). Do not merge your own PR.
- Report evidence for completion, including commands and exit codes, CI status, and gate status.

### DCO merge rule

GitHub may author a squash merge as `Moes`. The DCO app requires the sign-off name and email to match the author exactly. For that merge, use `gh pr merge --squash --author-email mohanadgh@gmail.com` and include `Signed-off-by: Moes <mohanadgh@gmail.com>` in the squash body. Alternatively, merge locally with author `Moe Ghashim`. Opus owns the merge.

### Decide or escalate

| Decide in the task | Escalate in `dev/open-questions.md` |
|---|---|
| File and function names | New dependencies |
| Internal types | Public API changes |
| Test structure | Token values missing from `design/tokens.json` |
|  | Conflicts with the Decisions log |
|  | Work across milestone boundaries |

Do not resolve escalations by guessing. Keep work within the assigned task.

## Protected files and boundaries

Do not edit `PLAN.md`, `AGENTS.md`, `dev/**`, or `design/**` as part of routine implementation. Task and plan files define scope; report a gap instead. Design files are generated from the design-system source and only `npm run design:sync` writes them.

- Import UI SDK only from its public per-component entries. Never import `internal/*`.
- Wrap UI SDK components; do not fork or copy their source. Keep their part names, slots, `render` prop, value-change shape, and forwarded props. Use `@ui-sdk/core` primitives for behaviors it does not provide.
- Import `@anthropic-ai/sdk` only in `providers/anthropic.ts`.
- Do not use randomness or timers at module scope.
- Use Agent-UI tokens only. Use logical CSS properties for direction support.
- Keep public API and module boundaries in line with PLAN.md §§7–8.

## UI SDK updates

Follow PLAN.md §14. Keep `@ui-sdk/core` and `@ui-sdk/react` on the same exact newest version: use the `beta` tag before 1.0 and `latest` after 1.0. The daily update job refreshes both packages and the installed UI SDK skill, runs `npm run verify`, and opens a PR with release notes and public-entry changes. Review upstream release notes, fix breaks in the smallest change, and never pin back without an open question. If UI SDK adds a component we built from core primitives, open a task to replace the local implementation. The bot's CI gate is the exception to pushing through `no-mistakes`.

## Component completion

Use the checklist in PLAN.md §12. Each component has four files: `X.tsx`, `X.openui.ts`, `X.test.tsx`, and `X.md`. If it has no OpenUI definition, explain why in `X.md`. Add English and Arabic fixture files (`X.fixture.en.txt` and `X.fixture.ar.txt`) and a registry line. Check keyboard and focus behavior, documented states, preview coverage in both directions and themes, screenshots attached to CI for review (no baselines, PLAN.md D20), mobile overflow, accessibility, token-only styles, round-trip fixtures, and `llms.txt`. `npm run verify` must pass in CI.

## Commands

- `npm run check` runs Biome, type checking, design and generated-file checks, unit tests, and package checks.
- `npm run verify` runs `check`, preview installation and checks, then end-to-end tests.
- `npm run e2e` runs Playwright behavior, accessibility, focus-ring, overflow, RTL and OpenUI round-trip checks. It also takes full-page screenshots and attaches them to the run; CI uploads them as the `screenshots` artifact. There are no pixel comparisons and no committed baselines (PLAN.md D20). Never add `toHaveScreenshot`.
- `npm run docs` rebuilds `llms.txt` from component docs.
- `npm run tokens` rebuilds token CSS and TypeScript from `design/tokens.json`.
- `npm run design:check` verifies synced design files against their manifest.
- `npm run design:sync -- <commit>` syncs design files at the specified commit and updates the manifest. Use a full commit SHA. This change needs its own PR.
- `npm run ui-sdk:update` checks for a newer UI SDK release and prepares the package and skill update.

## Pull request

Write in Simplified Technical English: short, direct sentences and one idea per sentence. Use this body:

```markdown
## Task
<task id> — <task title>

## Linked
<issue or task link>

## Acceptance criteria
- [x] <criterion and evidence>

## Files touched
- <path>

## Tests
- `<command>` — exit <code>
- CI: <status>

## Decisions
- <decision or none>

Implemented by GPT-6 Luna; reviewed by Claude Opus 5.5.
```
