---
id: 016
title: Add the agent skill, README, and generated component index
milestone: v0.1-foundation
category: docs
priority: high
files: [".agents/skills/tensquads-ui/SKILL.md", ".claude/skills", "README.md", "llms.txt", "scripts/build-llms.mjs"]
---

## Acceptance criteria
- [ ] Add `.agents/skills/tensquads-ui/SKILL.md` over the installed UI SDK skill.
- [ ] Link `.claude/skills` to `.agents/skills` as specified by PLAN.md §4.
- [ ] Add the human README with install, styles, locale, React, Squadmate, and OpenUI usage.
- [ ] Confirm each component task's Markdown guide is present and generate `llms.txt` from the guides.
- [ ] `npm run docs` regenerates `llms.txt` deterministically.
- [ ] Use Simplified Technical English. Keep component API docs aligned with exports and tests.

## Suggested approach
Use PLAN.md §§6–7 and the tensquads process rules. Document the D13-approved install shape and avoid claiming unsupported props or states. `AGENTS.md` has its own preceding task.
