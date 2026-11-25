# Chat

Show a conversation with Petra, an inline form action and squad hand-offs.

Follows [Chat](../../design/screens/Chat.dc.html) and the [chat layout](../../DESIGN.md#45-chat).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [ChatPage.tsx](./ChatPage.tsx) and [chat.css](./chat.css). Import the CSS after the library styles in your global stylesheet.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "./chat.css";
```

Place the component inside [AppShell](../app-shell/README.md) and import its `app-shell.css` for a complete workspace page.

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Set `data-theme="light"` or `data-theme="dark"` to choose a theme. Pass `copy` to override the localized defaults.

## Replace the sample content

Replace the sample conversation and hand-offs. The sample transport returns scripted text. Pass `endpoint` to connect a streaming backend, and replace the sample reply and its action with your agent's messages. Pass `onReplay` to reset the conversation in place by remounting the component with a new key.
