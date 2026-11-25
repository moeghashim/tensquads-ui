---
id: 005
title: DESIGN.md, the visual guide for agents
milestone: v0.3-design-system
category: docs
priority: high
files: ["DESIGN.md", "apps/preview/**", "llms.txt", "scripts/**", "e2e/**", "README.md"]
---

Decided by Moe on 2026-11-25 (D34). Colleagues pointed their agents at this repository and got screens that did not look like tensquads. The repository explains each component's API but not how a tensquads screen is put together. `DESIGN.md` fills that gap.

Write it from what is built, not from intentions: the synced reference screens in `design/screens/` (Main, Agents, AgentDetail, Chat, Rules, Accounts, Traffic, Onboarding, SignIn), the tokens in `design/tokens.json`, the dashboards at `/dashboards/admin` and `/dashboards/home`, `/chat`, the Nodes builder, and the design-system site itself. Measure them; do not guess.

## Acceptance criteria
- [ ] `DESIGN.md` at the repository root, in Simplified Technical English, for a coding agent that has never seen tensquads. Sections:
  1. **Start here**: a five-step recipe (install and import styles in order; pick the closest page template and reference screen; build only from library components and `--ts-*` tokens; check both locales and themes; compare with the reference screen).
  2. **Look and feel**: the principles, each with a concrete rule (for example neutral surfaces carry the interface; colour means status or family only).
  3. **App shell**: side navigation, header, content width and gutters, with the token for each value.
  4. **Page layouts**: one subsection each for dashboard, list and table, detail, settings and forms, chat, and builder. Each gives the layout grid, the component per region, spacing between regions, and links to its reference screen file, its live page and its page template (task 006 adds the template links).
  5. **Type, spacing, colour, radius, shadow, motion**: which token to use where, as tables. No raw values that a token covers.
  6. **Squadmates**: where they appear, sizes, states, the one-performer motion rule (D33).
  7. **Copy**: voice, sentence case, no exclamation marks, gender-neutral Arabic (D18), numbers and dates in both locales.
  8. **Right to left**: logical properties, what mirrors and what does not.
  9. **Don't**: the common mistakes that make a screen look generic (raw hex, ad-hoc shadows, centred hero layouts, emoji, extra accent colours, wide paragraphs, custom buttons).
- [ ] Every value in `DESIGN.md` names a token that exists in `design/tokens.json`, or a measured value from a reference screen with the file it came from. A check fails `npm run check` when `DESIGN.md` names a `--ts-*` token that does not exist.
- [ ] The site serves it: a "Design guide" page at `/foundations/guide` (first in Foundations), with a Markdown twin. `/llms.txt` lists it first under "Start here" with the line "Read this before you build a screen".
- [ ] `README.md`: a short "For coding agents" section at the top that says to read `DESIGN.md`, `llms.txt` and the skill, in that order.
- [ ] e2e: the guide page renders in both locales; its Markdown twin is served; every reference-screen and live-page link in it resolves.
- [ ] `npm run verify` passes.
