# StatTile

Import `StatTile`, `StatTileProps`, and `StatTileDelta` from `@tensquads/ui/react`. A tile shows one headline metric. `label` and `value` are required. Add an optional `glyph`, `unit`, `delta`, `foot`, and `series`. Delta tone is `positive`, `negative`, or `neutral`; the consumer decides whether an increase is good. Delta text includes its comparison period. Use `delta: null` and a `foot` when there is no previous period. Pass `series: null` or omit it for a metric without a trend. A sparkline needs at least two points and reverses in RTL so time follows the reading direction.

Use `StatGrid` as a CSS wrapper around tiles: `className="ts-stat-grid"`. It lays out six, three, two, then one column as the viewport narrows. Values use tabular numerals. The OpenUI definition accepts serializable numeric series and metric text.
