# ApprovalCard

Import `ApprovalCard` and `ApprovalCardProps` from `@tensquads/ui/react`. Pass a platform `approval_request` as `request`. The card displays its action, content, optional labeled rule and limit, and approve or decline controls. `actionLabels` localizes action ids. `ruleLabels` maps rule ids to human-readable labels; an unmapped rule id is hidden. A limit is always shown when present. Optional `bot` values display a Squadmate only when they match a known slug. Optional `taskId` and `decision` values come from the host because they are not fields on the approval request.

The `onDecision` callback receives an `ApprovalDecision` command body without `commandId` and `at`. The host adds those values and can retain the same id for a retry. `decision` restores the locked state after loading saved host state.

## Platform contract

See [OwnerMessageView's platform contract](../OwnerMessage/OwnerMessage.md#platform-contract) for the supported contract revision, schemas, command builders, money formatting, and the planned update. The card currently shows no amount.

The OpenUI definition uses the same React card. It accepts `approvalId`, `action`, `content`, and `contentHash` directly, with optional nullable `rule` and `limit`, plus `actionLabels`, `locale`, `labels`, and `ruleLabels` in that positional order. `ruleLabels` is the final prop, so existing positional calls keep their meaning. Its controls emit actions named `ApprovalDecision` with params `{ approvalId, contentHash, decision }`. Decline sends `"reject"`. Controls are disabled while streaming.

Use `labels` to override `approve`, `decline`, `approved`, `declined`, `limit`, and `task` in React or OpenUI. Defaults follow `locale`. `disabled` blocks both controls. The `onDecision` callback may return a promise. Both controls are disabled while it is pending. Returning `false` or rejecting leaves the card undecided. Acceptance shows the outcome and locks both controls. The OpenUI adapter receives acceptance from `TensquadsRenderer.onAction`; return `chat.act(event, blockId)` from a `ChatReply.onAction` handler so a host veto reaches the card.
