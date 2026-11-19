# ApprovalCard

Import `ApprovalCard` and `ApprovalCardProps` from `@tensquads/ui/react`. Pass a platform `approval_request` as `request`. The card displays its action, content, optional rule and limit, and approve or decline controls. `actionLabels` localizes action ids. Optional `bot` values display a Squadmate only when they match a known slug. Optional `taskId` and `decision` values come from the host because they are not fields on the approval request.

The `onDecision` callback receives an `ApprovalDecision` command body without `commandId` and `at`. The host adds those values and can retain the same id for a retry. `decision` restores the locked state after loading saved host state.

## Platform contract

This component restates `approval_request` and `ApprovalDecision` from `moeghashim/tensquads-platform-amp` commit `c5eaad4d69b4529c9a57b00b1066b39e60243fa8`. It does not add fields to either contract. Q4 notes that the request has no amount, bot, or task id; the card shows no amount. The host may pass bot, task id, and a prior decision as props. The contract also has no localized action label, so the host supplies `actionLabels`.

Use `labels` to override `approve`, `decline`, `approved`, `declined`, `limit`, and `task` in React or OpenUI. Defaults follow `locale`. `disabled` blocks both controls. The `onDecision` callback may return a promise. Both controls are disabled while it is pending. Returning `false` or rejecting leaves the card undecided. Acceptance shows the outcome and locks both controls. The OpenUI adapter receives acceptance from `TensquadsRenderer.onAction`; return `chat.act(event, blockId)` from a `ChatReply.onAction` handler so a host veto reaches the card.
