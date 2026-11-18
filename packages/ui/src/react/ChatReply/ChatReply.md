# ChatReply

Import `ChatReply` and `ChatReplyProps` from `@tensquads/ui/react`. Pass a streaming reply string and its active locale. ChatReply renders Markdown text and fenced `openui` blocks in reading order. Each OpenUI block uses `TensquadsRenderer`; its renderer props, including error and action callbacks, pass through.

Text supports paragraphs, headings, ordered and unordered lists, inline code, fenced code, strong text, and safe `http`, `https`, and `mailto` links. Raw HTML is rendered as text. Code blocks always use left-to-right direction. An unfinished OpenUI fence is sent to the renderer as a live stream and its fence markers stay hidden.

ChatReply has no OpenUI definition because it renders the mixed Markdown and OpenUI reply protocol itself. It uses Agent-UI typography, spacing, color, and radius tokens and supports automatic text direction.
