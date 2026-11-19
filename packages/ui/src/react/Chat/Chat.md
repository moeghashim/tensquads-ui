# Chat

Import `Chat`, `ChatHeader`, `ChatLog`, `ChatUserMessage`, `ChatStep`, `ChatEmptyState`, and `ChatComposer` from `@tensquads/ui/react`. These parts provide the chat surface. The host renders agent replies as React content inside `ChatStep`; replies are not placed in a bubble.

`Chat` fills its container. `ChatHeader` accepts heading content as `children` and includes a ghost New chat button that calls `onNewChat`. The host resets the conversation. `ChatLog` scrolls and follows new entries and nested reply growth while the reader remains at the end. Scrolling up pauses following; returning to the end resumes it. `ChatUserMessage` is the only message bubble. `ChatStep` requires `name` and accepts `glyph`, `status`, `statusVariant="default" | "danger"`, `responseId`, `running`, and an arbitrary React `reply` node. While `running`, a spinner replaces the glyph and honours reduced motion. `ChatEmptyState` accepts `glyph`, `title`, and `description`.

`ChatComposer` uses UI SDK Textarea and the library Button. Its textarea grows to 160px. Enter sends, Shift+Enter inserts a line, and IME composition does not send. `attach` accepts a React node. Send is disabled for empty or whitespace-only text. A send calls the required `onSend(message)` with trimmed text, then clears the draft. Use `defaultValue` for an initial draft, or control it with `value` and `onValueChange(value)`. In controlled mode, the host must apply value changes, including the empty string after sending. `textareaProps` accepts additional UI SDK textarea props, such as `aria-label` and focus handlers; the composer owns value, resizing, and submission.

While `busy`, sending is blocked and the button becomes Stop. Stop calls `onStop` and preserves the draft. The host cancels the work and updates `busy`.

Set `locale="ar"` on `ChatHeader`, `ChatEmptyState`, and `ChatComposer` for their Arabic defaults; each defaults to English. Override copy with `newChatLabel`, `title`, `description`, `sendLabel`, `stopLabel`, `placeholder`, and `textareaProps["aria-label"]`. English control labels are New chat, Send, Stop, and Message. The English textarea has no default placeholder. Arabic defaults use neutral wording. Set document language, direction, and theme as described in the [README](../../../../../README.md#styles-locale-and-theme). The send arrow points right in LTR and left in RTL, including when disabled. It follows the composer's effective `dir`, including local overrides, independently of `locale`.

The chat surface has no OpenUI definition because it hosts replies and inline OpenUI content rather than being streamed as a component. Use [ChatReply](../ChatReply/ChatReply.md) to render a streamed reply inside `ChatStep`.

`useChat({ endpoint, locale, transport, onAction })` owns `turns`, `busy`, `error`, and `locked`, and returns `send(text)`, `act(event)`, `stop()`, `reset()`, and `retry()`. The default transport posts `{ locale, turns }` as JSON to `endpoint` and reads a plain text response stream. A transport can instead return an `AsyncIterable<string>` for deterministic mocks. `onAction` receives the OpenUI `ActionEvent`; return `false` to veto it. Accepted actions append a `ChatActionTurn` with its name, source, form values, and readable summary, then send it as the next turn. `ChatReply` accepts `locked={chat.locked}` so the used UI stays rendered and disabled. Render `chat.error` as a blocked `ChatStep` and wire its retry button to `chat.retry()`.

```tsx
const chat = useChat({ endpoint: "/api/chat", locale: "en" });
<ChatReply reply={reply} onAction={chat.act} locked={chat.locked} />;
```
