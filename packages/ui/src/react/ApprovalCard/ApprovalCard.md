# ApprovalCard

Import `ApprovalCard` and `ApprovalCardProps` from `@tensquads/ui/react`. Pass a platform `approval_request` as `request`. The card displays its action, content, optional rule and limit, and approve or decline controls. `actionLabels` localizes action ids. Optional `bot` values display a Squadmate only when they match a known slug. Optional `taskId` and `decision` values come from the host because they are not fields on the approval request.

The `onDecision` callback receives an `ApprovalDecision` command body without `commandId` and `at`. The host adds those values and can retain the same id for a retry. `decision` restores the locked state after loading saved host state.

## Platform contract

The card uses `approval_request` and `ApprovalDecision` from `moeghashim/tensquads-platform-amp` commit `c5eaad4d69b4529c9a57b00b1066b39e60243fa8`. See [OwnerMessageView's platform contract](../OwnerMessage/OwnerMessage.md#platform-contract) for schemas, command builders, money formatting, and the Q4 gaps. The card shows no amount.

The OpenUI definition uses the same React card. It accepts `approvalId`, `action`, `content`, and `contentHash` directly, with optional nullable `rule` and `limit`, plus `locale`, `actionLabels`, and `labels`. Its controls emit actions named `ApprovalDecision` with params `{ approvalId, contentHash, decision }`. Decline sends `"reject"`. Controls are disabled while streaming.

Use `labels` to override `approve`, `decline`, `approved`, `declined`, `limit`, and `task` in React or OpenUI. Defaults follow `locale`. `disabled` blocks both controls. The `onDecision` callback may return a promise. Both controls are disabled while it is pending. Returning `false` or rejecting leaves the card undecided. Acceptance shows the outcome and locks both controls. The OpenUI adapter receives acceptance from `TensquadsRenderer.onAction`; return `chat.act(event, blockId)` from a `ChatReply.onAction` handler so a host veto reaches the card.
