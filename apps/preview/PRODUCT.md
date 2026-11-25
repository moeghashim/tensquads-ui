# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Developers who build tensquads and بنّاء screens, and the coding agents they point at this library. They arrive to learn what `@tensquads/ui` is, install it from a pinned commit, and find the right component with copyable code. Server agents that stream OpenUI are a second audience, reached through the same docs. (Confirmed by Moe, 2026-11-18.)

## Product Purpose
See the [README introduction](../../README.md#tensquads-ui) for the product and the [Site guide](../../README.md#site) for the public site's foundations and component catalog. Success: a developer or agent goes from landing to a working install and the right component without asking anyone.

## Positioning
One component set that both a coding agent (React) and a live server agent (OpenUI streams) can use, bilingual English and Arabic with real right-to-left, on top of UI SDK instead of a fork.

## Operating Context
Live at https://tensquads-ui-preview.mohanadgh.workers.dev (address kept; no custom domain). Deployed by hand from `main`. Agents follow the [README reading order](../../README.md#for-coding-agents). Locale, direction and theme live in the URL.

## Capabilities and Constraints
- See [llms.txt](../../llms.txt) for the generated component documentation index.
- Styles use Agent-UI tokens only (`--ts-*`), logical CSS properties, light and dark.
- No OpenUI playground and no API key on the site (D21).
- Built with the library's own components where one fits.

## Brand Commitments
- Agent-UI visual language from tensquads-design-system (synced in `design/`): neutral first, near-black primary, soft tints only where they carry meaning, sentence case, no emoji, no exclamation marks.
- The squadmates with their state artwork, and the tensquads logo, from `design/`. See the [Squadmate contract](../../packages/ui/src/react/Squadmate/Squadmate.md) for the roster and drawing APIs.
- Fonts: Inter, IBM Plex Sans Arabic, JetBrains Mono (D17).
- Arabic copy is natural MSA, gender-neutral when addressing the reader (D18 style).

## Evidence on Hand
Real components, fixtures and docs in `packages/ui/src/react/*`; mascots and logo in `design/`. No users, testimonials, download counts or benchmarks exist; do not invent any.

## Product Principles
- Show the components working, not descriptions of them.
- Install-to-first-component in one screen.
- English and Arabic are equal citizens; RTL is never an afterthought.
- Agents are first-class readers: everything a human sees has a plain-text path.

## Accessibility & Inclusion
WCAG AA, axe clean, keyboard reachable, visible 2px focus ring, no horizontal scroll at 390 px, both directions and themes.
