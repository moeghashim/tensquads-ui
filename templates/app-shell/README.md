# App shell

Lay out a signed-in workspace with side navigation, a page heading and one content panel.

Follows [Main workspace screen](../../design/screens/Main.dc.html) and the [app shell](../../DESIGN.md#3-app-shell).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [AppShell.tsx](./AppShell.tsx) and [app-shell.css](./app-shell.css). Import the CSS after the library styles in your global stylesheet.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "./app-shell.css";
```

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Set `data-theme="light"` or `data-theme="dark"` to choose a theme. Pass `copy` to override the localized defaults.

## Replace the sample content

Set `links` to your app routes and `current` to the active destination. Replace the brand, sidebar labels, account and sample content through `copy` and `children`. A chat destination adds the launcher.

## Detail pages

Use the shell around the [detail layout](../../DESIGN.md#43-detail). Place a ghost back link and a PageHeader at the top of the content panel. Follow with a summary Card, four StatTiles, a 3:2 row of Cards and a full-width history Card.
