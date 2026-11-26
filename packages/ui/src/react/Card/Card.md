# Card

Import `Card` and `CardProps` from `@tensquads/ui/react`. Card is a dashboard panel with one body. Its `title` and `subtitle` accept React nodes. It also accepts `count`, `actions`, `legend`, `footer`, and `flush`. The `inset` variant creates a nested item surface. Use `flush` when a table or other edge-to-edge content fills the body. Keep controls in the page header except for the table search and filters allowed by D24.

Card reserves the `title` prop for its visible heading. Use a string or a phrasing element such as `<span>` in the heading and subtitle. OpenUI takes strings for both.

Legend entries use `{ label, value? }` and neutral token styling. The card does not add a chart or table; compose its body through children. Its OpenUI arguments are `title`, `subtitle`, `count`, `children`, `footer`, `flush`, `variant`, and `layout`, in that order. OpenUI requires a non-empty title and a children array. Actions and legends use React composition. Set the final OpenUI `layout` argument to `"stat-grid"` to wrap the children in the [StatTile grid](../StatTile/StatTile.md). The default layout preserves an ordinary chart, table, or text body.
