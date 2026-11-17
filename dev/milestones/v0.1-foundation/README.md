# v0.1-foundation — Definition of Done

The milestone is done when the v0.1 scope in PLAN.md §9 is complete:

- The npm workspace scaffold supports the pinned git dependency and the approved D13 package shape.
- Design files sync from the pinned design-system commit. `design:check` detects drift. Tokens build from the synced token file.
- The preview app runs on Cloudflare Workers and shows every v0.1 component in English/LTR and Arabic/RTL, in light and dark themes.
- Squadmate, Button, Badge, Chip, Input and Field, Switch, SegmentedControl, Menu, Dialog, and Tooltip meet PLAN.md §12.
- The OpenUI bridge has a lazy library, locale-aware system prompt, renderer, bounded server helpers, and an Anthropic provider as the only vendor SDK import.
- `AGENTS.md`, the tensquads-ui skill, component guides, and `llms.txt` explain the public APIs and agent workflows.
- CI runs `npm run verify`.

For every component, the evidence includes:

- Unit and behavior tests for keyboard, focus, and documented states.
- Preview coverage in `en/ltr` and `ar/rtl`, in light and dark.
- Playwright screenshots at 1440 px and 390 px in both directions, with no horizontal scroll at 390 px.
- No axe violations, a name for every control, and a 2 px `#0169cc` focus ring with 2 px offset.
- Agent-UI tokens only in component CSS, checked for raw color literals.
- OpenUI round-trip fixtures in both locales and an `llms.txt` entry.
- `npm run verify` exits 0 in CI.
