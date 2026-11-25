---
id: 001
title: Design the design-system home, the component index and a foundation page
milestone: v0.3-design-system
category: design
priority: high
status: done
files: ["apps/preview/.impeccable/mocks/design-system/**"]
---

Decided by Moe on 2026-11-24 (D32). Moe said the current home and component index have bad alignment and a poor design: the hero's install card and buttons float in a separate right column, component cards have uneven preview heights, previews are not centred, and the BarChart preview is clipped.

GPT-6.2 Sol made the comps. Moe approved them on 2026-11-24. They are in `apps/preview/.impeccable/mocks/design-system/`:

- `direction.md`: the direction contract (grid, spacing, type, cards, header, Markdown affordance). Task 002 builds to it.
- `home.html`, `home-ar.html`, `components.html`, `foundation-colour.html`: static comps. They load the synced `design/` assets by relative path.
- `llms.txt` and `markdown/`: sample agent outputs for task 003.
- `NOTES.md`: Sol's notes. Its open questions are answered in tasks 002 and 003.

Links in the comps to foundations that have no comp yet point at https://10squads.com/design/. The built site replaces them with its own pages.
