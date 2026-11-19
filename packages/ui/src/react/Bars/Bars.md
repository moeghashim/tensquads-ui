# Bars

Import `Bars`, `BarsProps`, and `BarsRow` from `@tensquads/ui/react`. Each row has a label, a numeric value used for scale, and a `display` string shown to the reader. Rows are sorted by the caller and capped at eight. The default `ranked` style shows horizontal magnitude bars. Use `style="progress"` for compact plan rows and pass a `caption` for the average or other context. Growth may use `tone="info"` for the blue fill shown in the store owner reference; all other rows use one neutral ink. Wrap the chart in `Card`.
