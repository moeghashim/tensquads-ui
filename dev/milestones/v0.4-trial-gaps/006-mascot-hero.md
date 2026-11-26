---
id: 006
title: Meet the squad hero on the mascot states page
milestone: v0.4-trial-gaps
category: preview
priority: medium
files: ["apps/preview/**", "e2e/**"]
---

Approved by Moe on 2026-11-26. The comp is `apps/preview/.impeccable/mocks/mascot-hero/mascot-hero-{light,dark}.html`, built by `mascot-hero.mjs`. The comp is the spec for the layout, the two rows and their order, each squadmate's pose, state and size, the hop and the copy. Independent of the other tasks.

## Acceptance criteria
- [ ] `/reference/mascot-states` opens with the "Meet the squad" hero card above the existing state gallery: eyebrow, title, lead, the three count chips (squadmates, states, drawings, computed from the roster, not typed), the group of all 13 squadmates in two staggered rows, and the footer line with "Jump to the states", which moves focus to the gallery.
- [ ] Each squadmate renders with the library's `Squadmate animated` (inline SVG with the `sm-*` part hooks, D33). The hero turns off the state motion inside it and applies the comp's pose transforms to the part hooks from a preview CSS file. Keep the comp's rules: no pose turns Petra's or Machu's raised left arm; Zurich's and Rio's right arm stays at −12°. Do not copy SVG markup from the comp and do not add a public `pose` prop.
- [ ] Hover or keyboard focus on a squadmate shows its name and role in the site locale. Each squadmate is one tab stop with an accessible name of "<name>, <role>".
- [ ] The hop passes along the squad one squadmate every 420 ms, from a single interval started in an effect and cleared on unmount; none during server rendering, at module scope, while the tab is hidden, or under `prefers-reduced-motion: reduce`.
- [ ] Both locales and themes. In RTL the rows mirror and the text is Arabic. At 390 px the group scales down to fit with no overflow; the rows may wrap to three.
- [ ] The Markdown twin of the page gains the hero's title, lead and counts.
- [ ] e2e: the hero shows 13 squadmates and the correct counts; focus shows a tag; no running animation under reduced motion; no overflow at 390 px; axe. `npm run verify` passes.

## Rules
- Do not edit the comp, `design/**`, `packages/ui/src/squadmates/**`, `PLAN.md`, `AGENTS.md`, `dev/**`, `.agents/skills/**` or `.claude/**`.
- No new dependencies. Tokens for colour, spacing, radius, easing and duration; the comp's literal values for pose angles and offsets. Logical properties.
