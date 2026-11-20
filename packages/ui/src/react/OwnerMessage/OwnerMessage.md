# OwnerMessageView

Import `OwnerMessageView`, `OwnerMessageViewProps`, and `pendingQuestion` from `@tensquads/ui/react`. Pass the owner messages as `messages`. The view sorts valid messages by `seq`, keeps invalid messages out of the display, and reports invalid or unknown messages through `onUnknown`. Option questions emit an `OwnerAnswer` body through `onCommand`. The host adds `commandId` and `at` before posting it.

Replies, result summaries, and result evidence use [ChatReply's plain text mode](../ChatReply/ChatReply.md). Evidence follows the summary as a list. A free text question includes a note to use the host message box. Use `pendingQuestion(messages)` to find the newest valid free text question by `seq` and send the next composer value as an `OwnerAnswer`. Option questions lock after a selection and mark the chosen option.

Approval requests use [ApprovalCard](../ApprovalCard/ApprovalCard.md), with `actionLabels` passed through. Status messages show the step and a running Squadmate when `bot` matches a known slug. They show an attempt label only above attempt 1. An `action_not_confirmed` message uses ChatError with `what` as its body. The view sets language and direction from `locale`, which defaults to English.

## Platform contract

The [platform schemas](../../schemas/platform.ts), exported from `@tensquads/ui/schemas`, currently restate the six owner messages and four owner commands from `moeghashim/tensquads-platform-amp` commit `c5eaad4d69b4529c9a57b00b1066b39e60243fa8`. They export `PlatformOwnerMessage`, `PlatformOwnerCommand`, and member schemas and types. The platform has answered [Q4](../../../../../dev/open-questions.md#q4--fields-the-ui-needs-that-the-platform-message-contract-lacks). The approved update to `b09e197` is planned in [task v0.2-platform/001](../../../../../dev/milestones/v0.2-platform/001-contract-b09e197.md) and is not implemented yet.

With the current library, a host can restore an approval with `approvalDecisions={{ [approvalId]: "approve" }}` or a `"reject"` value. The current schemas do not accept decision or answer messages. `pendingQuestion` cannot determine whether a free text question was answered after the host handles it; the host should clear or replace the pending question when it sends the answer.

The same schemas entry exports `ownerMessageCommand({ messageId, channel, text })`, `ownerAnswerCommand({ questionId, text })`, `approvalDecisionCommand(request, "approve" | "reject")`, and `cancelTaskCommand({ taskId })`. These validate command bodies without generating ids or timestamps. `approvalDecisionCommand` retains the request's approval id and content hash. Use `withCommandMeta(body, { commandId, at })` to validate a full command before posting it to `POST /v1/commands`. Reuse the same command id for a retry. `formatMillionths(value, locale)` formats safe integer millionths as US dollars with two decimal places; for example, 20000000 formats as $20.00 in English.

OwnerMessageView has no OpenUI definition because it consumes platform messages. For inline streamed content, use the [ApprovalCard OpenUI adapter](../ApprovalCard/ApprovalCard.md). Platform controls return command bodies through `onCommand`; inline OpenUI controls emit chat actions.

Use `labels` to override `answerHint`, `attempt`, and `errorTitle`. Use `approvalLabels` to override the ApprovalCard copy. Defaults follow `locale`.
