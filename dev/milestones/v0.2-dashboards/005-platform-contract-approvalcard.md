---
id: 005
title: Speak the platform message contract and build ApprovalCard
milestone: v0.2-dashboards
category: component
priority: high
files: ["packages/ui/src/schemas/**", "packages/ui/src/react/ApprovalCard/**", "packages/ui/src/react/OwnerMessage/**", "packages/ui/src/react/Chat/**", "packages/ui/src/react/index.ts", "packages/ui/src/openui/**", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Decision D26. Runs after 002 and before 003: the platform's owner app is waiting for it. The platform repository is public: `moeghashim/tensquads-platform-amp`. Read on commit `c5eaad4d69b4529c9a57b00b1066b39e60243fa8`: `packages/contracts/src/messages.ts`, `packages/contracts/src/commands.ts`, `docs/ARCHITECTURE.md` sections 6.1, 6.3 and 6.5, and `docs/PRD.md` requirements O1 to O3 (`gh api repos/moeghashim/tensquads-platform-amp/contents/<path>?ref=<sha>`). Do not change that repository. Do not add it as a dependency.

## Acceptance criteria
- [ ] `packages/ui/src/schemas/platform.ts`, exported from `@tensquads/ui/schemas`: zod 4 schemas and types that restate the six owner messages (`reply`, `question`, `approval_request`, `result`, `status`, `action_not_confirmed`, each with `seq` and `at`) and the four owner chat commands (`OwnerMessage`, `OwnerAnswer`, `ApprovalDecision`, `CancelTask`, each with `commandId` and `at`). Field names, literals and nullability match the platform exactly (`approvalId`, `contentHash`, `questionId`, `decision: "approve" | "reject"`, `rule` and `limit` nullable, `limit` an integer in millionths of a US dollar). A comment names the platform commit. Name the exported types `PlatformOwnerMessage` and `PlatformOwnerCommand` (and one type per member) so they never collide with the library's chat types.
- [ ] Command builders that return command bodies without `commandId` and `at` (the host adds both, because a retry must reuse the same id; no randomness or clock in the library): `ownerMessageCommand({ messageId, channel, text })`, `ownerAnswerCommand({ questionId, text })`, `approvalDecisionCommand(request, "approve" | "reject")` (copies `approvalId` and `contentHash` from the request), `cancelTaskCommand({ taskId })`. A helper `withCommandMeta(body, { commandId, at })` returns the full command and validates it.
- [ ] Money helper: `formatMillionths(value, locale)` shows US dollars from millionths (20000000 is $20.00 in English; Arabic uses the Arabic locale formatter). Tests cover 0, whole, fractional and large values.
- [ ] `ApprovalCard` (inset card from 001) built from an `approval_request`: head with the action label (from an `actionLabels` prop map, falling back to the raw `action` id), the optional agent (`bot` prop: 20px Squadmate plus name when it maps to a squadmate) and the optional `taskId`; body with `content`; a line for the rule and the limit when present ("Limit $20.00"); footer with a solid "Approve" and a soft "Decline" pill. Approve calls `onDecision(approvalDecisionCommand(request, "approve"))`, Decline the same with `"reject"`. After a decision the card shows the chosen outcome ("Approved" or "Declined", with a check or cross line icon) and both buttons are disabled; a `decision` prop lets the host restore that state. No amount field exists in the contract, so the card shows no amount (Q4).
- [ ] ApprovalCard OpenUI definition: the same card for streamed chat content, whose buttons emit OpenUI actions named `ApprovalDecision` with params `{ approvalId, contentHash, decision }`, so D23 locking also applies.
- [ ] `OwnerMessageView` renders one platform message and calls `onCommand(body)`:
  - `reply`: `ChatAssistantMessage` with `ChatReply` treating the text as plain text (escape Markdown; no OpenUI blocks), with URLs linked.
  - `question` with options: the text, then one soft pill per option; a press sends `ownerAnswerCommand({ questionId, text: option })` and locks the options showing the chosen one. Without options: the text plus a note that the answer goes in the message box; export `pendingQuestion(messages)` that returns the newest unanswered free-text question, so the host turns the next composer send into `OwnerAnswer` instead of `OwnerMessage`.
  - `approval_request`: `ApprovalCard`.
  - `result`: the summary, then the evidence as a list (plain text, URLs linked).
  - `status`: `ChatWorking` with the step as the label and the bot as the Squadmate glyph when `bot` names a squadmate; otherwise no glyph. Show "attempt N" only when the attempt is above 1.
  - `action_not_confirmed`: `ChatError` with `what` as the message; the title in English and Arabic says the action could not be confirmed.
  - Messages render in `seq` order; the view never reorders or drops them. An unknown `type` renders nothing and calls an optional `onUnknown(message)`.
- [ ] Copy defaults in English and Arabic (D18-neutral), overridable by props. Light and dark, RTL.
- [ ] Preview: `/components/ApprovalCard` and `/components/OwnerMessageView` with a fixture conversation of all six types in each locale, where every command sent shows in a "Sent commands" panel as JSON.
- [ ] Tests: each schema accepts the platform's valid examples and rejects wrong literals and extra fields; builders produce exact bodies; ApprovalCard approve and reject values carry `approvalId` and `contentHash`; the lock after a decision and the restored `decision`; `formatMillionths`; `pendingQuestion`; the mapping of all six types; axe.
- [ ] `X.md` docs for ApprovalCard and OwnerMessageView, including a "Platform contract" section that names the commit and the gaps in Q4.

Moved out of this task: ChatLauncher now belongs to task 006.

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
