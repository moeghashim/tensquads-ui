# ApprovalCard

Import `ApprovalCard` and `ApprovalCardProps` from `@tensquads/ui/react`. Pass a platform `approval_request` as `request`. The card displays its action, content, amount, optional labeled rule and limit, and approve or decline controls. `actionLabels` localizes action ids. `ruleLabels` maps rule ids to human-readable labels; an unmapped rule id is hidden. The amount, rule label, and limit appear in that order when present. Pass `squadmates` as a map from platform bot ids to `AgentSlug` values. The card shows an agent only when the request bot is in that map. The task id comes from the request.

The `onDecision` callback receives an `ApprovalDecision` command body without `commandId` and `at`. The host adds those values and can retain the same id for a retry. `decision` restores the locked state after loading saved host state.

## Platform contract

See the [OwnerMessageView platform contract](../OwnerMessage/OwnerMessage.md#platform-contract) for the schema version, required request fields, `approval_decided` and `question_answered` messages, and command builders. The card formats `amount` with two decimal places and tabular figures.

The OpenUI definition uses the same React card. It accepts `approvalId`, `action`, `content`, and `contentHash` directly, with optional nullable `rule`, `limit`, and `amount`, optional `bot` and `taskId`, plus `actionLabels`, `locale`, `labels`, and `ruleLabels`. The OpenUI adapter has no `squadmates` map, so it shows no agent even when `bot` is supplied. A missing task id omits the task line. Its controls emit actions named `ApprovalDecision` with params `{ approvalId, contentHash, decision }`. Decline sends `"reject"`. Controls are disabled while streaming.

Use `labels` to override `approve`, `decline`, `approved`, `declined`, `amount`, `limit`, and `task` in React or OpenUI. Defaults follow `locale`. `disabled` blocks both controls. The `onDecision` callback may return a promise. Both controls are disabled while it is pending. Returning `false` or rejecting leaves the card undecided. Acceptance shows the outcome and locks both controls. The OpenUI adapter receives acceptance from `TensquadsRenderer.onAction`; return `chat.act(event, blockId)` from a `ChatReply.onAction` handler so a host veto reaches the card.
