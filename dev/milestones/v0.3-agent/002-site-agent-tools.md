---
id: 002
title: Site agent tools and the scripted Petra run
milestone: v0.3-agent
category: site
priority: high
files: ["apps/preview/**", "e2e/**", "README.md", "llms.txt"]
---

## Acceptance criteria
- [ ] The site creates one bridge in the browser and registers WebMCP tools with `registerTools(agent, { allow: (step) => !step.confirm })` on `/workflows/support` and `/dashboards/home`, and removes them on leaving the page. Browsers without `document.modelContext` see no change.
- [ ] The builder page has a "Watch Petra build" button. It runs a scripted list of `agent.act` steps (insert an agent node, rename it, connect it, move it) at a readable pace, with Petra's Squadmate in the planning and running states and a step row per action in a small side log. No model, no network, no API key (D21). The person can stop it; every step goes through undo history.
- [ ] The script includes one delete. The bridge asks the page's confirmation dialog (the library Dialog) with the confirm sentence; the run waits for the person's answer and logs it.
- [ ] On `/dashboards/home`, a short note explains that an assistant in a WebMCP browser can read the dashboard and answer questions, and cannot approve money without the owner.
- [ ] Both locales and themes; reduced motion shows the steps without animation.
- [ ] E2E: the scripted run completes and the final graph matches; the delete waits for confirmation and Cancel keeps the node; `registerTools` is called when `modelContext` is stubbed and its cleanup runs on navigation; axe; no overflow.

## Shared rules for this milestone
- Read D21, D25 and D31 in `PLAN.md`, and `node_modules/@ui-sdk/react/docs/agents.md` in full (Get Started, Your Own Components, Permissions, WebMCP, Reference).
- Branch `feat/v0.3-agent-NNN-slug` from `v0.3-agent`. Base the PR on `v0.3-agent`. Work in the project checkout; do not create git worktrees (D25).
- Import the bridge only from `@ui-sdk/react/agent`. Add no dependency and no `@tensquads/ui` subpath.
- No module-scope randomness, dates, timers or `window` access. The bridge is created in the browser, inside an effect or a client-only module.
- Arabic copy is natural MSA and gender-neutral (D18). Confirmation sentences exist in both locales.
- Screenshots attach to CI only (D20). `npm run verify` passes.
