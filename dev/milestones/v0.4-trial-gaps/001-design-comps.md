---
id: 001
title: Comps for DateRangePicker and the list-and-detail template
milestone: v0.4-trial-gaps
category: design
priority: high
owner: Opus
files: ["apps/preview/.impeccable/mocks/**"]
---

Opus designs, Moe approves (D35). Static HTML comps, built by a generator script like the earlier comps, in light and dark, English and Arabic.

## Acceptance criteria
- [ ] `apps/preview/.impeccable/mocks/date-range/`: DateRangePicker closed, open with a range selected, with presets ("Last 7 days", "Last 30 days", "This month"), invalid range, disabled, and inside a PageHeader action area. Two months side by side at 1024 px and above; one month on mobile, in a sheet.
- [ ] `apps/preview/.impeccable/mocks/list-detail/`: an Orders list with filters (search, status Menu, DateRangePicker), a DataTable with a selected row, and the detail panel beside it at 1024 px and above; a sheet on mobile. Uses only library components and tokens.
- [ ] Moe approves both. The approval date goes in tasks 003 and 004.
