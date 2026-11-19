# OwnerMessageView

Import `OwnerMessageView`, `OwnerMessageViewProps`, and `pendingQuestion` from `@tensquads/ui/react`. Pass the owner messages as `messages`. The view sorts valid messages by `seq`, keeps invalid messages out of the display, and reports invalid or unknown messages through `onUnknown`. Option questions emit an `OwnerAnswer` body through `onCommand`. The host adds `commandId` and `at` before posting it.

Free text replies and result evidence are rendered as plain text. HTTP and HTTPS URLs are linked. Markdown and OpenUI blocks are not interpreted. A free text question includes a note to use the host message box. Use `pendingQuestion(messages)` to find the newest free text question and send the next composer value as an `OwnerAnswer`.

## Platform contract

This view restates the six owner messages and four owner commands from `moeghashim/tensquads-platform-amp` commit `c5eaad4d69b4529c9a57b00b1066b39e60243fa8`. Q4 records that approvals contain no amount, bot, or task id; action ids have no human title; status bot ids may not be squadmate slugs; and there is no persisted decision or answer message. The view treats reply and evidence as plain text because the contract does not specify Markdown. A host can restore an approval with `approvalDecisions={{ [approvalId]: "approve" }}`, but the contract itself cannot restore it. Since there is no answer message, `pendingQuestion` cannot determine whether a free text question was answered after the host handles it; the host should clear or replace the pending question when it sends the answer.

The OpenUI component is `ApprovalCard`, for use in streamed chat replies. It emits `ApprovalDecision` actions containing `approvalId`, `contentHash`, and `decision`.

Use `labels` to override `answerHint`, `attempt`, and `errorTitle`. Use `approvalLabels` to override the ApprovalCard copy. Defaults follow `locale`.
