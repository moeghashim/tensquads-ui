---
id: 004
title: List-and-detail template
milestone: v0.4-trial-gaps
category: preview
priority: medium
files: ["templates/**", "apps/preview/**", "e2e/**", "DESIGN.md", "llms.txt"]
---

Starts after Moe approves the comp in task 001, and after tasks 002 and 003 merge (it uses DateRangePicker and the Menu trigger variants).

## Acceptance criteria
- [ ] `templates/list-detail/`: the approved Orders list with filters, a DataTable with a selectable row, and a detail panel beside it at 1024 px and above, a sheet below. Built only from the library.
- [ ] The detail-row styles the trial found only in the preview CSS move into the template's own CSS. The preview uses the template's styles; nothing is left duplicated.
- [ ] `/templates/list-detail` with Copy source, Copy styles, a GitHub link and a Markdown twin, like the other templates. `DESIGN.md` names it under page layouts.
- [ ] Both locales and themes, no overflow at 390 px, axe, keyboard selection opens the detail. `npm run verify` passes.
