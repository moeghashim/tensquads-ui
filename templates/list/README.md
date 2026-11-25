# List and table

Show a company table with search, a status filter and an empty state.

Follows [Accounts](../../design/screens/Accounts.dc.html) and the [list layout](../../DESIGN.md#42-list-and-table).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [List.tsx](./List.tsx) and [list.css](./list.css). Import the CSS after the library styles in your global stylesheet.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "./list.css";
```

Place the component inside [AppShell](../app-shell/README.md) and import its `app-shell.css` for a complete workspace page.

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Set `data-theme="light"` or `data-theme="dark"` to choose a theme. Pass `copy` to override the localized defaults.

## Replace the sample content

Pass `accounts` in newest-first order. Own `filters` in your page or URL, and update them through `onFiltersChange` to show interactive search and the status filter.
