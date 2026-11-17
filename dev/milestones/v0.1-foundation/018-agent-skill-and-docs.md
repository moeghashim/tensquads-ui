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

## Suggested approach
Use PLAN.md §§6–7 and the tensquads process rules. Document the D13-approved install shape and avoid claiming unsupported props or states. `AGENTS.md` has its own preceding task.
