---
id: 001
title: Move the platform contract to b09e197
milestone: v0.2-platform
category: component
priority: high
files: ["packages/ui/src/schemas/**", "packages/ui/src/react/ApprovalCard/**", "packages/ui/src/react/OwnerMessage/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Decision D27. The platform answered Q4. Read `moeghashim/tensquads-platform-amp` at commit `b09e197ae4578995d3c3d1a5be9330e1a7da600e`: `packages/contracts/src/messages.ts` and `packages/contracts/src/commands.ts` (`gh api "repos/moeghashim/tensquads-platform-amp/contents/<path>?ref=<sha>" --jq .content | base64 -d`). Do not change that repository. Do not add it as a dependency.

This changes public API before 1.0. The changes are listed here and approved; do not add others.

## Acceptance criteria

### Schemas (`packages/ui/src/schemas/platform.ts`)
- [ ] The comment names `b09e197ae4578995d3c3d1a5be9330e1a7da600e` instead of `c5eaad4`.
- [ ] `PlatformApprovalRequestSchema` adds `amount: z.int().nonnegative().nullable()`, `bot: id` and `taskId: id`, in the platform's order. All three are required keys, as on the platform.
- [ ] New `PlatformApprovalDecidedSchema` (`type: "approval_decided"`, `approvalId`, `decision: "approve" | "reject"`) and `PlatformQuestionAnsweredSchema` (`type: "question_answered"`, `questionId`). Both strict, with `seq` and `at`. Add both to `PlatformOwnerMessageSchema` in the platform's order. Export the types `PlatformApprovalDecided` and `PlatformQuestionAnswered`.
- [ ] Export `PLATFORM_OWNER_MESSAGE_TYPES`, the eight literals in the platform's order (the platform's `OWNER_MESSAGE_TYPES`).
- [ ] Commands and builders do not change. `approvalDecisionCommand` still reads only `approvalId` and `contentHash`.

### ApprovalCard
- [ ] `request` is `Pick<PlatformApprovalRequest, "approvalId" | "action" | "content" | "contentHash" | "rule" | "limit" | "amount" | "bot" | "taskId">`.
- [ ] Remove the `bot` and `taskId` props. The card reads both from `request`.
- [ ] New prop `squadmates?: Readonly<Record<string, AgentSlug>>`, a map from bot id to squadmate. When `squadmates[request.bot]` exists, the head shows the 20px Squadmate and its character name, as today. Otherwise it shows no agent. Never match `bot` against squadmate slugs, and never print the raw bot id.
- [ ] The task line always shows (`Task: <bdi>{taskId}</bdi>`), because `taskId` is always present.
- [ ] Money line, in this order and only for the parts that are present: the amount, the rule label, the limit. The amount reads "Amount $42.00" (Arabic "المبلغ"), with the value in `--color-text` and `font-weight: 600`. Rule and limit keep their current secondary style. New label key `amount`, overridable like the others. Numbers use tabular figures.
- [ ] The OpenUI definition adds `amount` (nullable, optional), `bot` (optional) and `taskId` (optional) params and passes them through; streamed content is not a platform message, so they stay optional there. When `bot` or `taskId` is absent, the card omits that part. Add `amount` to the `labels` object.

### OwnerMessageView
- [ ] New prop `squadmates?: Readonly<Record<string, AgentSlug>>`. Pass it to every ApprovalCard. `status` shows the Squadmate glyph only through this map (remove the slug match).
- [ ] `approval_decided` renders nothing. The view builds a map of approval decisions from these messages (the highest `seq` wins for an `approvalId`) and passes it as `decision` to the matching ApprovalCard. A decision from a message wins over the `approvalDecisions` prop. The prop stays for hosts that hold their own state.
- [ ] `question_answered` renders nothing. A question with options and a matching `question_answered` shows its options disabled. No option is marked as chosen unless this screen chose it, because the message has no answer text.
- [ ] `pendingQuestion(messages)` skips a free-text question when a `question_answered` message has its `questionId`.
- [ ] Export a helper `approvalDecisions(messages)` that returns `Record<approvalId, "approve" | "reject">` from the `approval_decided` messages, so hosts can use the same rule.
- [ ] Render order, plain-text rendering with linked URLs and `onUnknown` stay as they are.

### Preview and fixtures
- [ ] Every approval fixture (component pages, `OwnerMessage.fixture.*.txt`, `apps/preview/src/fixtures/dashboard-approvals.fixture.*.json`) has `amount`, `bot` and `taskId`. Use bot ids that look like platform ids (`support-bot`, `pricing-bot`, `inventory-bot`), not squadmate slugs. At least one fixture has `amount: null`.
- [ ] The preview passes a demo `squadmates` map (for example `support-bot` to `petra`, `pricing-bot` to `rio`, `inventory-bot` to `kyoto`). Leave one bot id unmapped in the OwnerMessageView fixture to show the no-agent state.
- [ ] The OwnerMessageView fixture conversation in each locale contains all eight types: one `approval_decided` that locks an earlier approval and one `question_answered` that closes an earlier question.
- [ ] Remove the `bot` and `taskId` props from every preview call site.

### Tests and docs
- [ ] Schema tests: valid examples for the two new messages and the new `approval_request` fields; rejection of a missing `bot`, `taskId` or `amount` key, a negative or fractional `amount`, a wrong `decision` literal and extra fields.
- [ ] ApprovalCard tests: amount shown and hidden; squadmate shown only through the map; an unmapped bot shows no agent and no raw id; the task line.
- [ ] OwnerMessageView tests: `approval_decided` locks the card with the right outcome and overrides the prop; `question_answered` disables options and clears `pendingQuestion`; `approvalDecisions` helper; both new types render nothing; axe.
- [ ] `ApprovalCard.md` and `OwnerMessage.md`: the "Platform contract" section names `b09e197`, documents `amount`, `squadmates`, `approval_decided` and `question_answered`, and removes the Q4 gap list. State that `reply.text`, `result.summary` and `evidence` are plain text.
- [ ] `npm run docs` regenerates `llms.txt` and the README table. `npm run verify` passes.

## Shared rules
- Read D26 and D27 in `PLAN.md`.
- Branch `feat/v0.2-platform-001-contract-b09e197` from `v0.2-platform`. Base the PR on `v0.2-platform`. Work in the project checkout; do not create git worktrees (D25).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- No module-scope randomness, dates or timers.
- Screenshots attach to CI only (D20).
