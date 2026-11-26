# DateRangePicker

Pick a start and an end date in one control. Enter dates in the two fields or use the calendar. The popup shows two months at 1024 px and above, one month at smaller widths, and opens as a sheet below 640 px.

| Prop | Type | Behaviour |
| --- | --- | --- |
| `value` | `DateRange` or `null` | Controlled range. Both ends use ISO dates such as `2026-10-23`. |
| `defaultValue` | `DateRange` or `null` | Initial range when uncontrolled. Defaults to empty. |
| `onValueChange` | `(range, details) => void` | Receives the committed range. Applying a cleared range sends `null`. The SDK change details describe the interaction and support cancellation. |
| `min`, `max` | `string` | Inclusive ISO bounds for both dates. |
| `presets` | `readonly DateRangePreset[]` | Each preset has a unique label and a range in `value`. When the range matches no preset, Custom is pressed. |
| `locale` | `string` | Controls date and calendar formatting and the first day of the week. Use `ar` for Arabic copy and Arabic-Indic digits. Set `dir="rtl"` on the page to mirror the calendar. |
| `disabled`, `invalid` | `boolean` | Disable interaction or mark the inputs invalid and show an error. The picker also reports invalid typed dates. |
| `aria-label` | `string` | Names the range trigger and popup. Defaults to the localized field names. |

Pick a start and then an end. Hover or move focus to preview the end. Apply is disabled while choosing the end date. Presets choose both dates at once. Clear stages an empty range and keeps the popup open. Apply commits popup changes and closes the popup unless the callback cancels the change. Typed ranges commit directly when the popup is closed. Escape, the close button, and an outside press discard popup changes.

Arrows move by a day or a week. Page Up and Page Down move by month. Home and End go to the week’s edges. Enter picks the focused date. Focus returns to the trigger when Escape closes the popup. The range is announced and included in the trigger description.

```tsx
import { DateRangePicker } from "@tensquads/ui/react";

<DateRangePicker
  aria-label="Order dates"
  defaultValue={{ start: "2026-10-10", end: "2026-10-23" }}
  min="2026-10-01"
  max="2026-11-30"
  presets={[
    { label: "October", value: { start: "2026-10-01", end: "2026-10-31" } },
  ]}
/>
```

## OpenUI

Use `DateRangePicker(label, defaultValue, min, max, presets, disabled, invalid)`. Dates are Gregorian ISO strings. The renderer supplies its locale. Use the React component when the host needs to handle changes.
