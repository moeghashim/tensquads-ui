# Chat

Import `Chat`, `ChatHeader`, `ChatLog`, `ChatUserMessage`, `ChatStep`, `ChatEmptyState`, and `ChatComposer` from `@tensquads/ui/react`. These parts provide the chat surface. The host renders agent replies as React content inside `ChatStep`; replies are not placed in a bubble.

`Chat` fills its container. `ChatHeader` includes a ghost New chat button. `ChatLog` scrolls and follows new entries while the reader remains at the end. `ChatUserMessage` is the only message bubble. `ChatStep` accepts a glyph, name, optional status, response ID, running state, and arbitrary React reply node. `ChatEmptyState` shows the empty title and description.

`ChatComposer` grows its textarea to 160px. Enter sends, Shift+Enter inserts a line, and IME composition does not send. `attach` accepts a React node. Send is disabled for empty text. While `busy`, the button becomes Stop and calls `onStop`. Set `locale` to `ar` for the Arabic defaults, or pass labels and a placeholder directly. English defaults are New chat, Send, Stop, and Message. Arabic defaults use neutral wording.

The chat surface has no OpenUI definition because it hosts replies and inline OpenUI content rather than being streamed as a component. The reply format follows D22, and actions follow D23.
