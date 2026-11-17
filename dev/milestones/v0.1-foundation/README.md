# v0.1-foundation — Definition of Done

The milestone is done when the v0.1 scope in PLAN.md §9 is complete:

- The npm workspace scaffold supports the pinned git dependency and the approved D13 package shape.
- Design files sync from the pinned design-system commit. `design:check` detects drift. Tokens build from the synced token file.
- The preview app runs on Cloudflare Workers and shows every v0.1 component in English/LTR and Arabic/RTL, in light and dark themes.
- Squadmate, Button, Badge, Chip, Input and Field, Switch, SegmentedControl, Menu, Dialog, and Tooltip meet PLAN.md §12.
- The OpenUI bridge has a lazy library, locale-aware system prompt, renderer, bounded server helpers, and an Anthropic provider as the only vendor SDK import.
- `AGENTS.md`, the tensquads-ui skill, component guides, and `llms.txt` explain the public APIs and agent workflows.
- CI runs `npm run verify`.
- UI SDK is on its newest release, a daily job opens a verified update PR for each new release, and `check-ui-sdk-usage` passes (D14).

For every component, the evidence includes:

- Unit and behavior tests for keyboard, focus, and documented states.
- Preview coverage in `en/ltr` and `ar/rtl`, in light and dark.
- Playwright screenshots at 1440 px and 390 px in both directions, with no horizontal scroll at 390 px.
- No axe violations, a name for every control, and a 2 px focus ring in the `ring` token colour of each theme, with 2 px offset.
- Agent-UI tokens only in component CSS, checked for raw color literals.
- OpenUI round-trip fixtures in both locales and an `llms.txt` entry.
- `npm run verify` exits 0 in CI.

## Execution order

Revised by Opus on 2026-11-17. The harness and the OpenUI foundation come before the components, so each component PR can prove its own §12 checklist.

| # | Task | Why here |
|---|---|---|
| 001 | Scaffold and package shape (D13) | Everything depends on the package layout |
| 002 | Sync design reference | Tokens and styles need the hashed source |
| 003 | Build tokens | Components style only from tokens |
| 004 | Preview app | Screenshot and axe target |
| 005 | Verify harness and CI | Each later PR runs `npm run verify` in CI |
| 019 | UI SDK upstream tracking (D14) | Pins the newest UI SDK and adds the usage check before any component imports it |
| 020 | Fonts (D17) | Screenshots and components render in the product faces from the start |
| 006 | OpenUI foundation and `llms.txt` generator | Each component PR adds its definition, fixtures and doc |
| 007 | AGENTS.md | Builders of 008 onward follow it |
| 008–016 | Squadmate, Button, Badge, Chip, Input + Field, Switch + SegmentedControl, Menu, Dialog, Tooltip | Simple to complex; popups last |
| 017 | OpenUI server helpers and Anthropic provider | Needs every component registered |
| 018 | Skill, README, UI SDK skill install | Documents the finished API |
