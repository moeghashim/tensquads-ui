# List and detail

Filter an orders table and show the selected order. At 1024 px and above, the detail stays beside the list. At smaller widths, selecting an order opens a bottom sheet.

Follows the [list and detail layout](../../DESIGN.md#43-detail) and the [approved Orders comp](../../apps/preview/.impeccable/mocks/list-detail/list-detail.mjs).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [ListDetail.tsx](./ListDetail.tsx), [list-detail.css](./list-detail.css) and the [AppShell template](../app-shell/README.md). Keep the two template folders beside each other. Import both template styles after the library styles.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "../app-shell/app-shell.css";
@import "./list-detail.css";
```

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Dates, order numbers and SAR amounts use Arabic-Indic digits. Set `data-theme="light"` or `data-theme="dark"` to choose a theme.

## Use your order data

Pass `orders` newest first, with Gregorian ISO dates, prices in SAR and localized text. Pass the VAT amount from the order when available. The template otherwise calculates VAT at 15%. Set `links` to your app routes. Set `defaultRange` to the initial dates or `null` for all dates. Set `defaultSelectedId` to an order on the first filtered page to show its detail on desktop. Replace the example date presets and payment copy with values for your page.

Bind `onExport` to export the filtered orders. Bind `onContact` to start a customer conversation and `onRefundRequest` to open your refund confirmation flow. The Refund button marks the amount and order number with `data-agent-confirm` so the agent bridge requires a person. The callback should request confirmation before moving money.

Press Enter or Space on a row to select it. While the desktop detail is open, Up and Down move between rows and update it. Escape closes the detail and returns focus to the selected row.
