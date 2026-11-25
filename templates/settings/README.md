# Settings

Show existing workspace rules, an edit form and operating limits.

Follows [Rules](../../design/screens/Rules.dc.html) and the [settings layout](../../DESIGN.md#44-settings-and-forms).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [Settings.tsx](./Settings.tsx) and [settings.css](./settings.css). Import the CSS after the library styles in your global stylesheet.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "./settings.css";
```

Place the component inside [AppShell](../app-shell/README.md) and import its `app-shell.css` for a complete workspace page.

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Set `data-theme="light"` or `data-theme="dark"` to choose a theme. Pass `copy` to override the localized defaults.

## Replace the sample content

Pass your current `rules` and update them through `onToggleRule`. Persist form submissions through `onSave` and set `saved` when the save succeeds. Replace the sample limits with your workspace policy.
