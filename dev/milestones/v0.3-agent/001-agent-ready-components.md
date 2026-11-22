---
id: 001
title: Agent-ready components
milestone: v0.3-agent
category: component
priority: high
files: ["packages/ui/src/react/**", "packages/ui/src/openui/**", "e2e/**", "llms.txt", "README.md", ".agents/skills/tensquads-ui/SKILL.md"]
---

## Acceptance criteria

### Money and deletes need a person
- [ ] ApprovalCard's approve and reject buttons carry `data-agent-confirm` with a sentence built from the request: action label, amount when present, and the task id ("Approve Issue refund of $42.00 for task T-1042"). Same for reject. Localized.
- [ ] Every delete, unpublish or other destructive action in the library carries `data-agent-confirm` naming the target: Inspector delete, WorkflowCard Delete and Unpublish, Canvas `onDelete` (the Canvas agent action `remove` is declared with a confirm sentence), and any destructive Menu item a component renders.
- [ ] A test per control shows that `agent.act` without `allow` fails with "Needs a person", and that with `allow` the step carries the sentence.

### Readable snapshots
- [ ] A test renders each component page fixture with `createAgent()` and asserts that every snapshot entry has a non-empty `label` and no entry is a bare id. Fix every component that fails.
- [ ] Canvas's `agent` key exposes `select`, `move`, `connect` and `remove`, with node arguments that accept a node title or id (titles match like UI SDK labels; ambiguous titles are refused). Palette exposes `insert(kind)`. Their snapshot state lists node titles and connections, not coordinates only.
- [ ] Chat composer and OwnerMessage answers stay ordinary actions (no confirm): a reply is not money.

### Docs
- [ ] A new section "Agent-ready screens" in README and the tensquads-ui skill: create the bridge, register WebMCP tools with `allow: (step) => !step.confirm`, which actions need a person and why, and the snapshot rule for host components.
- [ ] Each affected `X.md` lists its agent actions and confirmations.

## Shared rules for this milestone
- Read D21, D25 and D31 in `PLAN.md`, and `node_modules/@ui-sdk/react/docs/agents.md` in full (Get Started, Your Own Components, Permissions, WebMCP, Reference).
- Branch `feat/v0.3-agent-NNN-slug` from `v0.3-agent`. Base the PR on `v0.3-agent`. Work in the project checkout; do not create git worktrees (D25).
- Import the bridge only from `@ui-sdk/react/agent`. Add no dependency and no `@tensquads/ui` subpath.
- No module-scope randomness, dates, timers or `window` access. The bridge is created in the browser, inside an effect or a client-only module.
- Arabic copy is natural MSA and gender-neutral (D18). Confirmation sentences exist in both locales.
- Screenshots attach to CI only (D20). `npm run verify` passes.
