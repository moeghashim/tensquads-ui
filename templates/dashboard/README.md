# Dashboard

Show store metrics, a revenue trend, work by squad and recent activity.

Follows [Overview](../../design/screens/Main.dc.html) and the [dashboard layout](../../DESIGN.md#41-dashboard).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [Dashboard.tsx](./Dashboard.tsx) and [dashboard.css](./dashboard.css). Import the CSS after the library styles in your global stylesheet.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "./dashboard.css";
```

Place the component inside [AppShell](../app-shell/README.md) and import its `app-shell.css` for a complete workspace page.

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Set `data-theme="light"` or `data-theme="dark"` to choose a theme. Pass `copy` to override the localized defaults.

## Replace the sample content

Replace the sample metrics, chart points and breakdown values with your data. Pass recent records as `tasks` in newest-first order. Pass an empty array to show the empty state.
