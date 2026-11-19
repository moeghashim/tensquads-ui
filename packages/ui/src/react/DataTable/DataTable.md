# DataTable

Import `DataTable`, its column and row types, and the `EntityCell`, `PersonCell`, `StackCell`, and `StatusCell` helpers from `@tensquads/ui/react`. Provide an accessible `caption`, columns, and rows with stable string IDs. Cells accept text or React nodes. Set `align: "end"` for numeric columns and optionally set `width` or `mono`. `EntityCell` derives uppercase Latin initials from the first two words, or the first two letters when the name has one word.

Rows become selectable by click and keyboard when `onRowSelect` is provided. Control selection with `selectedId` and update it from `onRowSelect(id)`. Enter and Space select the row when the row itself has focus. Keyboard events from controls inside cells keep their native behavior. The host owns filtering and search. Put the search input and filter controls in the containing `Card` actions. Render [EmptyState](../EmptyState/EmptyState.md) when no records match.

The entity helper shows initials, a name, and a truncated detail line. Its `tint` sets the initials tile's background and text colors: `primary` (default), `success`, `warning`, or `danger`. In a selected row, primary initials tiles and default-tone badges use the surface background and a hairline shadow to stay visible against the selection fill. Their text colors stay the same. Person and stack helpers show two text lines. These helpers truncate their secondary line and keep its full text in `title`. Status uses a word label and a `Badge` tone. Wide tables scroll inside their wrapper on narrow screens.

OpenUI accepts `caption`, `columns`, and `rows` with string cells. It does not expose `selectedId` or `onRowSelect`, so OpenUI tables are read-only. Use React for selection and helper compositions.
