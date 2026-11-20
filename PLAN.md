# tensquads-ui — Plan

Status: **Phase 1 locked, 2026-11-17.** The Decisions log at the end of this file is the source of truth. When anything downstream disagrees with it, the Decisions log wins. To change a decision, edit its row and say so in the PR.

## 1. Brief

tensquads-ui is the shared UI layer for tensquads (English) and بنّاء (Arabic). It gives agents one set of components that they can use in two places:

- **Frontend:** coding agents import `@tensquads/ui` to build screens in the tensquads app (`moeghashim/tensquads`), the website (`moeghashim/tensquad-website`) and the agent repos.
- **Backend:** live agents (Petra and the squad) stream UI from the server as OpenUI Lang. The browser renders that stream with the same React components.

A component is defined once. It has a React implementation and an OpenUI definition (a zod props schema plus a description), so generated UI cannot drift from hand-built UI.

Behaviors (keyboard, focus, popups, selection, dismissal, ARIA) come from UI SDK (`vercel-labs/ui`). The look comes from the Agent-UI tokens in `moeghashim/tensquads-design-system`. Every component works left to right and right to left, and is tested in both directions.

## 2. References

| From | tensquads-ui treatment |
|---|---|
| `moeghashim/tensquads-design-system` @ `644fd15` | Source of truth for the look. Consumed: `agent-ui/tokens.json`, `agent-ui/README.md`, `agent-ui/data-display.md`, the component guides under `agent-ui/components/*/README.md`, `mascots/` (svg, states, `mascots.json`) and `logo/`. Synced at a pinned commit and never edited here. |
| `vercel-labs/ui` (UI SDK), `@ui-sdk/core` + `@ui-sdk/react`, tracked release (0.1.0-beta.7 on 2026-11-17) | The behavior layer under every interactive component. Its rules apply (§7). Its `ui-sdk` skill is installed for coding agents. We stay compatible with every new release (§14, D14). MIT. |
| `thesysdev/openui`, `@openuidev/react-lang` + `@openuidev/lang-core` `1.1.1` | The runtime generative-UI format. Server agents emit OpenUI Lang; the browser renders it with our library. Already proven in the website's Petra interview. MIT. |
| `moeghashim/tensquads` `packages/squadmates` @ `0a1d7f9` | Moved here: the mascot drawing (`mascots.ts`), the roster (`roster.ts`) and the Agent loop state drawing (`draw.ts`). The app switches to `@tensquads/ui/squadmates` and retires its package in a later PR in that repo. |
| `moeghashim/tensquad-website` `src/components/interview/openui-library.tsx`, `src/lib/petra.ts` | Prior art for the OpenUI bridge: lazy library creation (Workers forbid random IDs at module load), prompt building, request caps and scripted fallback. Patterns are reused, code is rewritten against our components. |
| `moeghashim/tensquads` `AGENTS.md` | Process conventions copied: Simplified Technical English, receipt-first sessions, done checklist with evidence, DCO sign-off, `git push no-mistakes`. |

The website's marketing sections (round-table hero, pricing, nav) are **not** in scope. They stay in the website repo (decision D7).

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript 7.0.2, strict | Matches the tensquads app |
| Runtime | Node 26.x (26.13.1 LTS, npm 11.20.0), pinned per repo with mise | D19; the app and website move to 26 as well |
| Package manager | npm 11 workspaces | Matches the app; the consumer installs a git dependency with npm |
| UI | React 19 | Both consumers use React 19 |
| Behaviors | `@ui-sdk/react`, `@ui-sdk/core`, exact pin on the newest release, moved forward automatically (§14) | Decisions D4, D14. Renders no styles, so no library defaults show through (app AGENTS.md rule) |
| Styling | Plain CSS on Agent-UI custom properties, `@layer ui-sdk, tensquads;` | Decision D11. Styled from `data-slot` and state attributes |
| Generative UI | `@openuidev/react-lang`, `@openuidev/lang-core` (pinned exact) | Decision D1 |
| Schemas | zod 4 | OpenUI definitions and shared frontend/backend contracts |
| Lint/format | Biome 2.6.4 | Matches the app |
| Unit/behavior tests | Vitest + Testing Library (jsdom) | UI SDK testing reference uses them |
| Visual/a11y tests | Playwright 1.64 + `@axe-core/playwright` | Matches the app |
| Preview app | TanStack Start 1.169 on Cloudflare Workers (`@cloudflare/vite-plugin`) | Same hosting as every tensquads surface; it is the screenshot target |

## 4. Repo layout

```
tensquads-ui/
├── PLAN.md                     this file (contract; never overwritten by tools)
├── package.json                the installable package @tensquads/ui: exports map, deps, scripts (D13)
├── AGENTS.md                   rules for every agent; read first
├── README.md                   human overview and install
├── llms.txt                    index for agents: one line per component doc
├── design/                     synced from tensquads-design-system; never edited by hand
│   ├── MANIFEST.json           source repo, pinned commit, SHA-256 of every synced file
│   ├── tokens.json
│   ├── agent-ui/               README.md, data-display.md, components/*/README.md (reference only)
│   ├── mascots/                svg/, states/, mascots.json
│   └── logo/
├── packages/
│   └── ui/                     source of @tensquads/ui; build output in packages/ui/dist
│       ├── package.json        private workspace `@tensquads/ui-source`; the public exports (./tokens ./tokens.css ./styles.css ./react ./squadmates ./openui ./openui/server ./openui/server/anthropic ./schemas) live in the root package.json
│       └── src/
│           ├── tokens/         generated from design/tokens.json: tokens.css + tokens.ts
│           ├── styles/         base.css, one CSS file per component
│           ├── react/          one folder per component: Component.tsx, Component.openui.ts, Component.test.tsx, Component.md
│           ├── squadmates/     moved from tensquads packages/squadmates; <Squadmate> component
│           ├── openui/         createTensquadsLibrary() (lazy), <TensquadsRenderer>
│           │   └── server/     buildSystemPrompt(), stream helpers; providers/anthropic.ts is the only vendor import, served at its own subpath (D29)
│           └── schemas/        zod contracts shared by frontend and backend (AgentSlug, AgentState, Locale, …)
├── apps/
│   └── preview/                TanStack Start gallery: every component × {en/ltr, ar/rtl} × {light, dark}; its own npm project, not a root workspace (D16)
├── e2e/                        Playwright: screenshots 1440/390, axe, RTL pass, OpenUI round trip
├── scripts/
│   ├── sync-design.mjs         pull design files at the pinned commit, write MANIFEST.json
│   ├── design-check.mjs        fail on any hash drift
│   ├── build-tokens.mjs        tokens.json → tokens.css + tokens.ts
│   └── build-llms.mjs          component docs → llms.txt
├── .agents/skills/
│   ├── tensquads-ui/SKILL.md   how to use this library (frontend and backend), layered on ui-sdk
│   └── ui-sdk/                 installed from vercel-labs/ui
├── .claude/skills → .agents/skills
└── dev/milestones/             task files written by the implementer (Phase 2)
```

## 5. Commands

Headline:

| Command | Does |
|---|---|
| `npm run dev` | Preview app on localhost |
| `npm run check` | Biome, typecheck, `design:check`, unit tests |
| `npm run e2e` | Playwright screenshots, axe, RTL, OpenUI round trip |
| `npm run verify` | `check` then `e2e`. Exit 0 is the only definition of done |

Auxiliary:

| Command | Does |
|---|---|
| `npm run design:sync -- <commit>` | Re-pull design files at a new commit. Its own PR only |
| `npm run design:check` | Hash check against `design/MANIFEST.json` |
| `npm run tokens` | Rebuild `src/tokens/` from `design/tokens.json` |
| `npm run docs` | Rebuild `llms.txt` |
| `npm run deploy:preview` | Build and deploy the preview Worker |

## 6. Consumer onboarding

1. Add the dependency, pinned to one commit:
   `"@tensquads/ui": "github:moeghashim/tensquads-ui#<sha>"` (the root `package.json` is the package; `prepare` builds `packages/ui/dist` on install — D13).
2. In the global stylesheet: `@layer ui-sdk, tensquads;` then `@import "@tensquads/ui/fonts.css"; @import "@tensquads/ui/tokens.css"; @import "@tensquads/ui/styles.css";`.
3. Set `lang` and `dir` on `<html>`. Set `data-theme` or leave it to follow the system.
4. Frontend: `import { Button } from "@tensquads/ui/react"`.
5. Backend (Worker route): `import { buildSystemPrompt } from "@tensquads/ui/openui/server"`; stream the model output to the client.
6. Client: `<TensquadsRenderer stream={…} />` from `@tensquads/ui/openui`.
7. Install the skills: `npx skills@latest add moeghashim/tensquads-ui --skill tensquads-ui`.

## 7. Library conventions

From the UI SDK skill, applied to every component:

- Import UI SDK from per-component entries (`@ui-sdk/react/select`). Never from `internal/*`.
- One shape: a root and its parts. Change a part's element with `render`, never `as`.
- `defaultValue` or `value` + `onValueChange(value, details)`.
- Every control has a name: a label part or `aria-label`.
- Style only from `data-slot`, state attributes and CSS variables. No inline styles for state. No generated IDs in CSS.
- Text contrast 4.5:1; control edges, focus rings and state fills 3:1. Focus ring 2px in the `ring` token (`#0169cc` light, `#0285ff` dark), offset 2px.
- Lists are keyed by value or ID, never by index.
- RTL needs no provider. Use logical CSS properties only (`inline-start`, never `left`).
- No hand-rolled `role=` for anything UI SDK ships.
- Wrap, do not fork (D14): compose UI SDK roots and parts. Keep their part names, `data-slot` values, `render` prop and `value`/`onValueChange(value, details)` shape, and forward every other UI SDK prop, so the UI SDK docs stay true for our components and new upstream props reach consumers with no change here. Never copy UI SDK source.
- A component UI SDK does not ship is built from `@ui-sdk/core` (`definePrimitive`, `createParts`), not hand-rolled.
- Comments are rare.

tensquads additions:

- Only Agent-UI tokens. No other colour, font, radius or shadow. A missing token is a question, not a guess.
- Every component folder holds four files: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`. A component without an OpenUI definition says why in `X.md`.
- No module-scope randomness or timers (Workers forbid them at startup). The OpenUI library is created lazily.
- No emoji, no exclamation marks; sentence case (Agent-UI content rules).
- Docs, comments, commits and PRs use Simplified Technical English.

## 8. OpenUI bridge (backend)

- `X.openui.ts` exports `defineComponent({ name, description, props: zodSchema, component: X })`.
- `createTensquadsLibrary(locale)` assembles every definition. It is lazy and memoized.
- `buildSystemPrompt({ library, locale, persona?, extra? })` returns the prompt text: the component catalogue, the rules, and examples in the requested locale. Arabic prompts have Arabic examples (fixes the website's English-only gap).
- `providers/anthropic.ts` is the only file that imports `@anthropic-ai/sdk`. Default model `claude-haiku-5-5`. It is exported from `@tensquads/ui/openui/server/anthropic`, not from `./openui/server`, and the SDK is an optional peer dependency (D29). Other providers get their own file and subpath.
- Server helpers enforce caps (body size, turns) and return a typed error that the client turns into its scripted fallback.
- Round-trip test: a fixture stream per component renders without error in both locales.

## 9. Roadmap

| Version | Scope |
|---|---|
| v0.1 | Repo scaffold, design sync + check, tokens build, preview app, AGENTS.md + skill + llms.txt, Squadmate (moved), Button, Badge, Chip, Input + Field, Switch, SegmentedControl, Menu, Dialog, Tooltip, OpenUI bridge (library, prompt builder, renderer, Anthropic provider), CI with `verify` |
| v0.2 | Home site first (D21, `dev/milestones/v0.2-home/`, done), then Chat with inline UI (D22, D23, `dev/milestones/v0.2-chat/`: composer, step rows, OpenUI blocks in replies, actions as turns), then Dashboards (D24, `dev/milestones/v0.2-dashboards/`: Card, PageHeader, StatTile with sparkline, BarChart, Bars, Distribution, DataTable, EmptyState, Sidebar, the platform message contract with ApprovalCard (D26), ChatLauncher, and the admin and store owner demo dashboards), then the platform contract at `b09e197` (D27, `dev/milestones/v0.2-platform/`, done), then ThemeToggle, Toolbar and CommandPalette (D28, `dev/milestones/v0.2-tools/`, done), then the Anthropic provider subpath with the SDK as an optional peer (D29, `dev/milestones/v0.2-server/`, done). First adoption PR in the tensquads app (squadmates switch) |
| v0.3 | Workflow-builder set (Canvas, Node, BranchNode, MiniMap, Palette, Inspector, WorkflowCard), UI SDK `createAgent` + WebMCP so Petra can operate screens |

## 10. Confirmed defaults

1. **Stack**: React 19, `@ui-sdk/react` + `@ui-sdk/core`, TS 7, Node 24, npm workspaces, Biome. Matches the app.
2. **Layout**: one package `@tensquads/ui` with subpath entries `/tokens`, `/react`, `/squadmates`, `/openui`, `/schemas`. One install, clear seams.
3. **Token sync**: `scripts/sync-design.mjs` pulls from tensquads-design-system at a pinned commit; hashes in `design/MANIFEST.json`; `design:check` fails on drift. Keeps the design repo authoritative.
4. **Styling**: plain CSS on tokens, from `data-slot` and state attributes; no Tailwind. No foreign defaults.
5. **One component, two uses**: React + OpenUI definition in the same folder. No drift.
6. **Backend helper**: `buildSystemPrompt` + stream helpers; vendor SDK in one provider file; default `claude-haiku-5-5`. Same as the website.
7. **Preview app**: TanStack Start gallery on Workers, EN/AR × light/dark. The screenshot target.
8. **Tests**: Vitest + Testing Library; Playwright 1440/390 px screenshots, axe, RTL; OpenUI round trip. Evidence, not opinion.
9. **Agent docs**: `AGENTS.md`, `.agents/skills/tensquads-ui/SKILL.md` over the ui-sdk skill, `llms.txt` + one Markdown page per component. Agents find the API without reading source.
10. **Process**: one task, one branch, one PR; Conventional Commits; DCO sign-off; push via `no-mistakes`; Opus reviews and merges (D15).
11. **Roadmap**: as §9.

All eleven locked by Moe on 2026-11-17.

## 11. Agents and roles

| Role | Who | Does | Does not |
|---|---|---|---|
| Orchestrator / reviewer | Claude Opus 5.5 (`claude-opus-5-5`) | Owns PLAN.md, writes handoffs, reviews every PR against this plan and the done checklist, signs off | Write implementation code |
| Implementer | GPT-6 Luna (`gpt-6-luna`, Codex, reasoning effort medium) | Writes task files under `dev/milestones/`, builds one task per branch, opens PRs | Change PLAN.md, invent decisions, design states the design does not show |
| Merger | Claude Opus 5.5 (D15) | Squash-merges a PR after its own sign-off and green checks, without asking Moe | Merge a PR with failing checks or open requested changes |

## 12. Done checklist (per component)

- [ ] `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md` exist.
- [ ] Behavior tests cover keyboard, focus and every documented state. All pass.
- [ ] Preview page shows it in en/ltr and ar/rtl, light and dark.
- [ ] Playwright screenshots at 1440 and 390 px in both directions, attached to CI for review (D20); no horizontal scroll at 390 px.
- [ ] axe reports no violations. Every control has a name. Focus ring is 2px in the `ring` token colour of each theme, offset 2px.
- [ ] Only Agent-UI tokens in its CSS (a lint script checks for raw colour literals).
- [ ] OpenUI round-trip fixture renders in both locales.
- [ ] `llms.txt` lists it.
- [ ] `npm run verify` exits 0 in CI.

## 13. Decisions log

| # | Decision | Value | Source |
|---|---|---|---|
| D1 | Audience | Both: coding agents (frontend and backend code) and live server agents streaming OpenUI | Locked by user |
| D2 | Design source | tensquads-design-system stays the source of truth; this repo consumes it at a pinned commit with hash checks | Locked by user |
| D3 | Delivery | Pinned npm git dependency, like tensquads-agent-kit (tensquads decision 35) | Locked by user |
| D4 | UI SDK use in v0.1 | Behaviors under every interactive component. createAgent/WebMCP deferred to v0.3. Coding-agent skill comes via default 9 | Locked by user |
| D5 | v0.1 scope | App chrome + squad; workflow-builder components wait for v0.3 | Locked by user |
| D6 | Squadmates | Move from tensquads `packages/squadmates` into `@tensquads/ui/squadmates` | Locked by user |
| D7 | Website marketing pieces | Out of scope; shared base only (tokens, mascots, logos, controls) | Locked by user |
| D8 | RTL | Required and tested for every component; OpenUI prompts in both languages | Locked by user |
| D9 | Orchestrator | Claude Opus 5.5 | Locked by user |
| D10 | Implementer | GPT-6 Luna via Codex, reasoning effort medium ("GPT 6.1 Luna" is not in the catalog; user chose GPT-6 Luna) | Locked by user |
| D11 | Defaults 1–11 | As §10 | Locked by user |
| D12 | Brand names | English `tensquads` (always lowercase); Arabic `بنّاء`. No free-trial wording anywhere | Carried from website thread |
| D13 | Distribution shape of the git dependency | Root `package.json` is the package `@tensquads/ui`; `exports` point at `packages/ui/dist`; `prepare` builds it on git install; `dist/` git-ignored; a pack-and-install check proves every subpath. No `dist` branch | Proposed by implementer (Q1), signed off by Opus 2026-11-17 |
| D15 | Merge authority | Opus merges (squash) after its sign-off and green checks, without asking Moe. This includes the daily UI SDK update PRs that pass verify. A red update PR is fixed first, never merged red | Locked by user 2026-11-17 |
| D16 | Preview app install | `apps/preview` is not in the root `workspaces`. It has its own lockfile and reads `packages/ui/src` through a Vite alias. A consumer's git install (prepare) never installs the preview app's dependencies. Root scripts call it with `npm --prefix apps/preview` | Opus, task 004 escalation, 2026-11-17 |
| D17 | Fonts | `@tensquads/ui/fonts.css` self-hosts Inter (Latin UI), IBM Plex Sans Arabic (Arabic UI) and JetBrains Mono (code), all SIL OFL 1.1, the same faces the website loads. The `sans` stack is Inter, then IBM Plex Sans Arabic, then system fallbacks. Consumers import `fonts.css` before `tokens.css`. Task 020 | Opus, Q2, 2026-11-17 (matches the website) |
| D18 | Arabic agent-state labels | Gender-neutral nouns for all 13 agents: waiting بانتظارك، planning تخطيط، running قيد العمل، checking قيد التحقق، done تم، sentback إعادة للتعديل، blocked معلّق، escalated بانتظار قرارك، dropped أُلغي، idle في استراحة | Locked by user 2026-11-18 |
| D19 | Node version | Node 26 LTS (26.13.1, npm 11.20.0) for tensquads-ui, pinned with `mise.toml`; engines `26.x`. The website switched in its own repo (tensquad-website PR #1, merged 2026-11-18). The tensquads app is not built yet (Moe, 2026-11-18), so it has nothing to switch. Task 021 | Locked by user 2026-11-18 |
| D20 | Screenshots | No pixel comparisons. e2e takes full-page screenshots (1440 and 390 px, en/ar, light/dark) as CI artifacts for review only; no baselines are committed. Behaviour, accessibility, focus ring, overflow, keyboard, ARIA and OpenUI round-trip assertions stay. CI runs once per PR update with cancel-in-progress; no-mistakes runs the full verify before pushing. Task 022 | Locked by user 2026-11-18 (option B) |
| D21 | Project home | The preview gallery is deployed as the project's public home on Cloudflare Workers (now https://tensquads-ui-preview.mohanadgh.workers.dev) and grows into the home site in v0.2: component pages from X.md, getting started. No OpenUI playground. The workers.dev address stays (no custom domain). Opus deploys by hand with `npm run deploy:preview` after merges to main; no deploy workflow or Cloudflare secret in the repo | Locked by user 2026-11-18 (option 3; address and manual deploy confirmed the same day) |
| D22 | Chat reply format | An agent reply in the chat is markdown text with OpenUI blocks where the agent wants UI (fenced ```openui blocks). The client renders text and UI in reading order in one stream. `buildSystemPrompt` gains a chat mode that teaches this format; the existing UI-only mode stays | Locked by user 2026-11-18 |
| D23 | Chat actions | An action inside a chat element (button press, form submit) becomes the next user turn: a structured action message with the action name and form values, shown in the log as a user pill, then sent to the agent. The element that sent it locks after use. Host apps can observe or veto through `onAction` | Locked by user 2026-11-18 |
| D24 | Dashboards | Build the Agent-UI data-display set as library components (React plus OpenUI definition each): Card, PageHeader, StatTile (with its sparkline), BarChart, Bars, Distribution, DataTable, EmptyState. Add three components the specs do not have: Sidebar (app navigation, with a squad list variant), ApprovalCard (an agent's request with approve and decline actions that become chat action turns under D23) and ChatLauncher (the floating "Ask Petra" pill). The site shows two demo dashboards built only from library components: a super admin view (`/dashboards/admin`: Companies and Squad images) and a store owner view (`/dashboards/home`). All figures are demo data and say so on the page. The owner's references override one Agent-UI rule: a DataTable card may hold its own search box and filter chips in its head. `dev/milestones/v0.2-dashboards/` | Locked by user 2026-11-19 |
| D25 | Delegation without worktrees | No git worktrees outside the project folder. T3 places delegate worktrees outside it, so GPT-6 Luna works one task at a time in the project checkout (`isolation: "shared"`); Opus does not edit the checkout while Luna runs. Opus designs each task (exact specs in the task file) and reviews the rendered result before merge | Locked by user 2026-11-19 |
| D26 | Platform message contract | The chat speaks the tensquads platform contract (`moeghashim/tensquads-platform-amp`, `packages/contracts/src/messages.ts` and `commands.ts`, commit `c5eaad4`). `@tensquads/ui/schemas` restates, not copies, the six owner messages (`reply`, `question`, `approval_request`, `result`, `status`, `action_not_confirmed`) and the four owner chat commands (`OwnerMessage`, `OwnerAnswer`, `ApprovalDecision`, `CancelTask`) with the platform's exact names and values. `OwnerMessageView` renders each message with library components and returns command bodies through `onCommand`; the host adds `commandId` and `at` and posts them to `POST /v1/commands`. Platform messages carry no layout (platform O2), so every display choice lives in this library. ApprovalCard is built from `approval_request`. D23 action turns stay for inline OpenUI content; platform messages use commands. A field the UI needs and the contract lacks is listed in `dev/open-questions.md` (Q4), never invented. Task 005 | Locked by user 2026-11-19 |
| D27 | Platform contract b09e197 | The platform answered Q4 in `moeghashim/tensquads-platform-amp` commit `b09e197` (PR #19). `@tensquads/ui/schemas` restates that commit, not `c5eaad4`: eight owner messages (D26's six plus `approval_decided { approvalId, decision }` and `question_answered { questionId }`), and `approval_request` gains `amount` (millionths of a US dollar, nullable), `bot` and `taskId` (both required). Command bodies do not change. Bot ids are bot definition ids, not squadmate names: the host passes a `squadmates` map from bot id to squadmate, and a component shows a squadmate only through that map, never by matching the id. `approval_decided` locks its ApprovalCard after a reload and `question_answered` closes its question; both render nothing. `reply.text`, `result.summary` and `evidence` are plain text with linked URLs. `action` stays a tool id labelled by `actionLabels`. `dev/milestones/v0.2-platform/` | Locked by user 2026-11-20 (platform owner request) |
| D28 | App tools: ThemeToggle, Toolbar, CommandPalette | Build the last v0.2 Agent-UI components from their specs on UI SDK parts: ThemeToggle on `@ui-sdk/core` `createPreference` and `@ui-sdk/react/preferences` (light and dark only; first load follows the OS; the choice is stored as `tensquads.theme`, not the spec's `agent-ui.theme`, and sets `data-theme` on `<html>`), Toolbar on `@ui-sdk/react/toolbar` and `toggle`, CommandPalette on `@ui-sdk/react/dialog` and `command`. The specs' builder content (node tiles, Add node, Jump to) waits for the v0.3 workflow set; v0.2 ships the generic parts, which the consumer fills. None of the three has an OpenUI definition: they are application chrome with callbacks, not streamed content. The site gets a `⌘K` palette for its pages and settings. One task at a time (D25). `dev/milestones/v0.2-tools/` | Locked by user 2026-11-20 ("start the remaining v0.2") |
| D29 | Anthropic SDK optional | Answers Q3. `@anthropic-ai/sdk` moves from `dependencies` to an optional peer dependency (`peerDependencies` plus `peerDependenciesMeta.optional`) with the same exact version range the provider is tested against. `createAnthropicProvider` and `DEFAULT_ANTHROPIC_MODEL` move from `@tensquads/ui/openui/server` to the new subpath `@tensquads/ui/openui/server/anthropic`; `./openui/server` keeps every provider-neutral helper and no longer loads the SDK. Apps that only render UI, or use another provider, do not install it. Breaking change before 1.0; docs show the new import. A live smoke test against the API waits for the tensquads app adoption. `dev/milestones/v0.2-server/` | Locked by user 2026-11-20 ("go ahead with the suggested sequence") |
| D14 | UI SDK compatibility | Track every UI SDK release: exact same-version pins of `@ui-sdk/core` + `@ui-sdk/react` on the newest release (`beta` tag until 1.0, then `latest`); daily update job pushes a verified update branch (Opus opens the PR) with release notes and a refreshed ui-sdk skill; wrap, do not fork; public-entry usage check; upgrade playbook in AGENTS.md (§14). Task 019, run right after task 005 | Locked by user 2026-11-17 ("always up to date") |

## 14. Staying current with UI SDK

UI SDK is in beta and releases often (seven betas from 12 to 17 November 2026). All `@ui-sdk/*` packages share one version (changesets `fixed`). tensquads-ui follows every release.

- **Version policy.** `@ui-sdk/core` and `@ui-sdk/react` are pinned exactly, always to the same version, as regular dependencies of `@tensquads/ui`. While UI SDK is in pre-release we track the `beta` dist-tag (its newest release). When 1.0 ships we track `latest`. Consumers get UI SDK through `@tensquads/ui`; a consumer that imports `@ui-sdk/*` directly uses the same version. `check` fails if the two packages differ or if the pack fixture installs two copies.
- **Daily update job.** A scheduled GitHub Action (`.github/workflows/ui-sdk-update.yml`) checks npm once a day. On a new release it: bumps both packages; refreshes `.agents/skills/ui-sdk/` from the matching `vercel-labs/ui` tag; runs `npm run verify`; pushes the signed commit `chore(deps): ui-sdk <version>` to the branch `bot/ui-sdk-update` and writes the PR body (upstream release notes for `@ui-sdk/core` and `@ui-sdk/react`, public entries added or removed, verify result) to the run summary. A red verify fails the run. GitHub Actions may not open PRs in this repo (Moe, 2026-11-18), so Opus opens the PR from that branch and CI gates it. Opus reviews and merges a green PR (D15); a red PR is fixed first. Nothing merges without a review. This bot PR is the one exception to "push through no-mistakes": CI is its gate.
- **Compatibility contract.** `scripts/check-ui-sdk-usage.mjs` lists every `@ui-sdk/*` import in `packages/ui/src` and fails if one is an `internal` path or is not a public entry in the installed `node_modules/@ui-sdk/react/docs/llms.txt` (or `@ui-sdk/core` docs). Each wrapped component has a test that the UI SDK props it forwards still type-check and still render the upstream `data-slot` parts.
- **Upgrade playbook** (in `AGENTS.md`): read the release notes; fix breaks in the smallest change; never pin back without an open question; regenerate screenshots only when the diff is explained in the PR; when UI SDK starts shipping a component we built from `@ui-sdk/core`, open a task to move to theirs.
- **Early warning.** Because we track the newest beta, there is no separate canary job. If upstream breaks us, the daily PR shows it within a day.
