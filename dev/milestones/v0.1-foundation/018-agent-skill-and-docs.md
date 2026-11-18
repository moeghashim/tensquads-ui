---
id: 018
title: Add the agent skill, README, and generated component index
milestone: v0.1-foundation
category: docs
priority: high
files: [".agents/skills/tensquads-ui/SKILL.md", ".claude/skills", "README.md", "llms.txt"]
---

## Acceptance criteria
- [ ] Add `.agents/skills/tensquads-ui/SKILL.md` over the installed UI SDK skill.
- [ ] Link `.claude/skills` to `.agents/skills` as specified by PLAN.md §4.
- [ ] Add the human README with install, styles, locale, React, Squadmate, and OpenUI usage.
- [ ] Install the UI SDK skill at `.agents/skills/ui-sdk/` from vercel-labs/ui.
- [ ] Review every `X.md` against its exports and tests; regenerate `llms.txt` (the generator exists from task 006).
- [ ] Use Simplified Technical English. Keep component API docs aligned with exports and tests.

- [ ] AGENTS.md follow-ups from the task 007 review: the PR template uses `<task id> — <task title>` instead of a fixed `007`; the workflow section says to start every run with `no-mistakes axi run --base-branch <milestone branch>` ; it says screenshot baselines come only from the `e2e-baselines.yml` workflow (task 022), never from a local macOS run; and `pr.base_branch` in `.no-mistakes.yaml` was not honoured (PR #9 opened against main); the read order tells agents to load `.agents/skills/ui-sdk/SKILL.md` and `.agents/skills/tensquads-ui/SKILL.md` before component work.

- [ ] AGENTS.md matches D20: no `e2e:update`, no screenshot baselines; screenshots are CI artifacts for review. (Opus may fix this line earlier, right after task 022 merges.)

## Suggested approach
Use PLAN.md §§6–7 and the tensquads process rules. Document the D13-approved install shape and avoid claiming unsupported props or states. `AGENTS.md` has its own preceding task.
