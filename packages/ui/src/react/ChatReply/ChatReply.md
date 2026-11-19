# ChatReply

Import `ChatReply` and `ChatReplyProps` from `@tensquads/ui/react`. Pass a streaming reply string and its active locale. ChatReply renders Markdown text and fenced `openui` blocks in reading order. Each OpenUI block uses `TensquadsRenderer`; its renderer props, including error and action callbacks, pass through.

Text supports paragraphs, headings, ordered and unordered lists, inline code, fenced code, strong text, and safe `http`, `https`, and `mailto` links. Raw HTML is rendered as text. Code blocks always use left-to-right direction. An unfinished OpenUI fence is sent to the renderer as a live stream and its fence markers stay hidden.

ChatReply has no OpenUI definition because it renders the mixed Markdown and OpenUI reply protocol itself. It uses Agent-UI typography, spacing, color, and radius tokens and supports automatic text direction.

```tsx
import { ChatReply } from "@tensquads/ui/react";

<ChatReply reply={reply} locale="en" onError={(errors) => console.error(errors)} />;
```

`reply` is required. Update it with the full accumulated string as tokens arrive. `locale` defaults to `"en"`; use `"ar"` for Arabic. The locale selects the OpenUI library and does not translate reply text. For server prompt setup, see [OpenUI server](../../../../../README.md#openui-server).

`onAction` receives the upstream `ActionEvent`. Set `locked` after accepting an action to keep its form state visible while disabling the used controls. Connect it to `useChat().act`; the hook appends the readable user action pill and sends the structured turn. See [Chat](../Chat/Chat.md) for transport and retry usage.
