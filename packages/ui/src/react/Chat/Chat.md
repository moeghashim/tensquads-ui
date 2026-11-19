# Chat

Import `Chat`, `ChatHeader`, `ChatLog`, `ChatUserMessage`, `ChatAssistantMessage`, `ChatWorking`, `ChatError`, `ChatStep`, `ChatEmptyState`, and `ChatComposer` from `@tensquads/ui/react`. These parts provide the chat surface. The host renders an agent reply as React content inside `ChatAssistantMessage`, with no avatar, name, or bubble. Use `ChatStep` for rows that report work by named agents.

`Chat` fills its container. `ChatHeader` accepts heading content as `children` and includes a ghost New chat button that calls `onNewChat`. The host resets the conversation. `ChatLog` scrolls and follows new entries and nested reply growth while the reader remains at the end. Scrolling up pauses following; returning to the end resumes it. `ChatUserMessage` is the only message bubble. `ChatStep` requires `name` and accepts `glyph`, `status`, `statusVariant="default" | "danger"`, `responseId`, `running`, and an arbitrary React `reply` node. While `running`, a spinner replaces the glyph and honours reduced motion. `ChatEmptyState` accepts `glyph`, `title`, and `description`. `ChatWorking` is a status line for the time before reply text arrives; it accepts `glyph` and `label` (default Working, Arabic جارٍ العمل). Its label shimmers, except under reduced motion. `ChatError` shows a failed turn with a 2px danger rule. It accepts `title` (default Something went wrong, Arabic حدث خطأ), the message as `children`, and `onRetry` with `retryLabel`.

The log content and the composer share a centred column of at most 48rem. The log fades out under its top and bottom edges. `ChatUserMessage` is a solid primary pill. The composer is a floating pill with a round send button.

`ChatLog` defaults to `tabIndex={0}` so readers can focus and scroll it with the keyboard. Pass `tabIndex` to override this default.

`ChatComposer` uses UI SDK Textarea and the library Button. Its textarea grows to 200px. Enter sends, Shift+Enter inserts a line, and IME composition does not send. `attach` accepts a React node beside Send at the inline end. Send is disabled for empty or whitespace-only text. A send calls the required `onSend(message)` with trimmed text, then clears the draft. Use `defaultValue` for an initial draft, or control it with `value` and `onValueChange(value)`. In controlled mode, the host must apply value changes, including the empty string after sending. `textareaProps` accepts additional UI SDK textarea props, such as `aria-label` and focus handlers; the composer owns value, resizing, and submission.

While `busy`, sending is blocked and the button becomes Stop. Stop calls `onStop` and preserves the draft. The host cancels the work and updates `busy`.

Set `locale="ar"` on `ChatHeader`, `ChatEmptyState`, `ChatWorking`, `ChatError`, and `ChatComposer` for their Arabic defaults; each defaults to English. Override copy with `newChatLabel`, `title`, `description`, `sendLabel`, `stopLabel`, `placeholder`, and `textareaProps["aria-label"]`. English control labels are New chat, Send, Stop, and Message. The English placeholder is Ask anything. Arabic defaults use neutral wording. Set document language, direction, and theme as described in the [README](../../../../../README.md#styles-locale-and-theme). The send arrow points up, so it needs no mirroring in RTL.

The chat surface has no OpenUI definition because it hosts replies and inline OpenUI content rather than being streamed as a component. Use [ChatReply](../ChatReply/ChatReply.md) to render a streamed reply inside `ChatAssistantMessage`.

Import `useChat` from `@tensquads/ui/react`. `useChat({ endpoint, locale, transport, onAction })` owns `turns`, `busy`, `error`, and `locked`, and returns `send(text)`, `act(event, elementId)`, `stop()`, `reset()`, and `retry()`. The default transport posts `{ locale, turns }` as JSON to `endpoint` and reads a plain text response stream. A transport can instead return an `AsyncIterable<string>` for deterministic mocks. Each chunk updates the accumulated assistant turn. `stop()` aborts the active operation and keeps text already received. `retry()` resends the last request history and replaces any partial reply. `reset()` cancels pending work and clears the conversation, error, locks, and retry history. See [OpenUI server](../../../../../README.md#openui-server) for endpoint request handling.

Unmounting aborts the active operation's `AbortSignal` and ignores pending action approvals that resolve later.

`onAction` receives the OpenUI `ActionEvent` and may return a promise; return `false` to veto it. Pending approval sets `busy` and blocks other sends and actions. Accepted actions append a `ChatActionTurn` with its name, source, values, and readable summary, then send it as the next turn. Action values combine action parameters and current form values. Current form values take precedence when keys overlap. Render each action turn's `action.summary` inside `ChatUserMessage` to show its user pill. The hook manages state; the host renders the conversation. Render `chat.error` with `ChatError` and wire `onRetry` to `chat.retry()`. Show `ChatWorking` while `busy` is true and the last assistant turn has no text yet.

`locked` is a set of consumed element IDs. Give each action a stable ID that includes its reply and OpenUI block. IDs stay locked across text turns and new replies until `reset()`. `ChatReply` supplies the block ID as the second callback argument and accepts a block predicate for `locked`. With this wiring, an accepted action disables its entire OpenUI block, including sibling controls, while keeping the displayed values.

```tsx
const chat = useChat({ endpoint: "/api/chat", locale: "en" });
<ChatReply
  reply={reply}
  isStreaming={chat.busy}
  onAction={(event, blockId) => void chat.act(event, `${replyId}/${blockId}`)}
  locked={(blockId) => chat.locked.has(`${replyId}/${blockId}`)}
/>;
```
