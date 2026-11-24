---
id: 002
title: Build the design-system home, foundations and component index
milestone: v0.3-design-system
category: preview
priority: high
files: ["apps/preview/**", "e2e/**", "README.md"]
---

Moe approved the comps from task 001 on 2026-11-24. Build to `apps/preview/.impeccable/mocks/design-system/direction.md` and the comps in that folder. Match their composition with real library components and token CSS, not the comps' inline CSS.

Answers to the comps' open questions (Opus, 2026-11-24, accepted with the approval):
- `/foundations` is an overview page that lists every foundation. It does not redirect to Colour.
- Product screens, page designs and mascot states stay as a "Design reference" row on the home page for now. They link to https://10squads.com/design/ until they move here.
- Markdown twins carry the locale the same way as the HTML pages (`?locale=ar`); see task 003.

## Acceptance criteria
- [ ] Header: the Signal logo from `design/logo/` and the name "Design system". Primary nav: Foundations, Components, Get started (and the existing demos where the contract places them). Locale and theme switches stay in the URL (`state.ts`).
- [ ] Home page at `/` introduces the design system and the UI system and links into both.
- [ ] Foundations overview at `/foundations`, with pages for colour, typography, spacing, radius, shadow, motion, logo and mascots. Every value renders from `design/tokens.json`, `design/logo/` or `design/mascots/` at build time. No hand-copied values.
- [ ] Component index at `/components` rebuilt to the comps: fixed preview height, centred, no clipping, names on one baseline. `/components/$name` URLs do not change.
- [ ] Copy in the en and ar copy modules with the same keys (D18 style for Arabic).
- [ ] No horizontal scroll at 390 px; axe clean; keyboard nav with the focus ring; both directions and themes; screenshots attached as in D20.
- [ ] `npm run verify` passes.
