# DataTable

Import `DataTable`, its column and row types, and the `EntityCell`, `PersonCell`, `StackCell`, and `StatusCell` helpers from `@tensquads/ui/react`. Provide an accessible `caption`, columns, and rows with stable string IDs. Cells accept text or React nodes. Set `align: "end"` for numeric columns and optionally set `width` or `mono`.

Rows become keyboard-selectable when `onRowSelect` is provided. Use `selectedId` to show the selected record. Enter and Space select the focused row. The host owns filtering and search. Put the search input and filter controls in the containing `Card` actions.

The entity helper shows initials, a name, and a truncated detail line. Person and stack helpers show two text lines. Status uses a word label and a `Badge` tone. OpenUI rows accept string cells; use React for helper compositions.
