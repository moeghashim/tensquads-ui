---
id: 007
title: Add repository agent instructions
milestone: v0.1-foundation
category: docs
priority: high
files: ["AGENTS.md"]
---

## Acceptance criteria
- [ ] Add the repository `AGENTS.md` required by PLAN.md default 9. This task runs after the breakdown is approved.
- [ ] State the source-of-truth order, module boundaries, design sync rules, and no-clobber rules from PLAN.md.
- [ ] Set receipt-first, one-task-per-branch, Conventional Commit, DCO, and review conventions for this repository.
- [ ] Require Simplified Technical English and evidence for completion.
- [ ] State the DCO rule for merges: GitHub writes squash-merge commits with the account profile name "Moes", and the DCO app requires the sign-off name and email to match the author exactly. Merge with `gh pr merge --squash --author-email mohanadgh@gmail.com` and put `Signed-off-by: Moes <mohanadgh@gmail.com>` in the squash body, or merge locally with author "Moe Ghashim". PRs must target the milestone branch from the start; a PR opened against `main` makes DCO check the whole milestone history.
- [ ] Include the UI SDK upgrade playbook from PLAN.md §14 and the "wrap, do not fork" rule from §7 (D14).
- [ ] Do not copy unrelated app-specific screen rules from the tensquads repository.

## Suggested approach
Use PLAN.md and the tensquads `AGENTS.md` as process references. Keep this file specific to tensquads-ui and consistent with the approved D13 package shape.
