---
id: 003
title: DateRangePicker
milestone: v0.4-trial-gaps
category: component
priority: high
files: ["packages/ui/src/react/DateRangePicker/**", "packages/ui/src/react/index.ts", "packages/ui/src/styles/**", "packages/ui/src/openui/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

Moe approved the comp in task 001 on 2026-11-26 (`apps/preview/.impeccable/mocks/date-range/`). The comp is the spec for layout and copy.

## Acceptance criteria
- [ ] `DateRangePicker` wraps UI SDK's Date Picker in range mode (`@ui-sdk/react` public entry only): two inputs, one trigger, one popup. Controlled and uncontrolled (`value`, `defaultValue`, `onValueChange` with `{ start, end }`), `min`, `max`, `disabled`, `invalid`, and a `presets` prop that renders preset buttons.
- [ ] Two months at 1024 px and above, one month below. On mobile the popup opens as a sheet.
- [ ] Locale: Arabic month and weekday names, Arabic-Indic digits when the locale is `ar`, and the calendar mirrors in RTL. Week start follows the locale.
- [ ] Keyboard: arrows move by day, Page Up and Page Down by month, Home and End by week, Enter picks, Escape closes and returns focus. Screen readers hear the selected range.
- [ ] Reads well in `agent.snapshot()` (D31).
- [ ] The four component files, English and Arabic fixtures, a registry line, a preview page in both directions and themes, e2e for keyboard, RTL, overflow at 390 px and axe. `npm run verify` passes.
