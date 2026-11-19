# Card

Import `Card` and `CardProps` from `@tensquads/ui/react`. Card is a dashboard panel with one body. It accepts `title`, optional `subtitle`, `count`, `actions`, `legend`, `footer`, and `flush`. The `inset` variant creates a nested item surface. Use `flush` when a table or other edge-to-edge content fills the body. Keep controls in the page header except for the table search and filters allowed by D24.

Legend entries use `{ label, value? }` and neutral token styling. The card does not add a chart or table; pass exactly one body as children. Its OpenUI definition accepts `title`, `subtitle`, `count`, `footer`, `flush`, and `variant`, plus one `children` body. The body can contain streamed components such as a row of StatTiles.
