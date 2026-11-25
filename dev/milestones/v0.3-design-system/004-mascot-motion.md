---
id: 004
title: Mascot motion
milestone: v0.3-design-system
category: component
priority: high
files: ["packages/ui/src/react/Squadmate/**", "packages/ui/src/styles/**", "packages/ui/src/openui/**", "apps/preview/**", "e2e/**", "llms.txt", "README.md"]
---

Approved by Moe on 2026-11-25 (D33). The comp is `apps/preview/.impeccable/mocks/mascot-motion/mascot-motion.html`, built by `mascot-motion.mjs`. Its CSS is the spec for every keyframe, duration, distance and easing. The comp wins on motion and copy; tokens win on easing and duration names.

Starts after the design sync of the squadmate part hooks (design-system `b972fb4`) merges. That sync also copies the hooked squadmate code into `packages/ui/src/squadmates/`.

## Acceptance criteria

### Library
- [ ] `packages/ui/src/styles/squadmate-motion.css`, imported from `styles.css`: the comp's keyframes and per-state rules on the `sm-*` part hooks (`SQUADMATE_PARTS`). Easing and duration use `--ts-*` tokens where a token exists (`ease-move`, `ease-enter`, `ease-exit`, `duration-enter`); the rest are the comp's literal values. Rules are scoped under `.ts-squadmate[data-animated]` so they never touch other SVG.
- [ ] `Squadmate` gets `animated?: boolean` (default `false`). When false the output is unchanged (the `<img>`). When true it renders the same markup as inline SVG in a wrapper with `role="img"`, the same accessible name, `data-state` and `data-size`. Gradient ids are prefixed per instance with `useId`, so two animated squadmates on a page never share ids. The markup is server-safe: no `window` access during render.
- [ ] Changing `state` on an animated squadmate restarts the new state's motion (key the SVG by state). One-shots (Done, the Sent back droop) play once on entry.
- [ ] Raised left arms (`sm-raised`, Petra and Machu) only use the comp's small shoulder wave.
- [ ] At 24 px and below only `sm-face` and `sm-badge` move. Under `prefers-reduced-motion: reduce` nothing moves.
- [ ] OpenUI: add `animated` to the Squadmate definition, and a round-trip fixture line in both locales.
- [ ] Unit tests: `animated` off renders the `<img>` unchanged; on renders inline SVG with the accessible name, unique ids across two instances, and the state in `data-state`; the CSS file contains a reduced-motion block (check:css-tokens passes).
- [ ] `Squadmate.md` documents `animated`, the one-performer rule and reduced motion.

### Site
- [ ] `/foundations/mascots/motion`, linked from the Mascots foundation page: the comp's content on the site (principles, the ten states with Petra animated, changing state with Pisa, sizes, spec table, do and don't) built with the library's `Squadmate animated`, not a copy of the comp's CSS. "Replay" restarts one-shots. Both locales, both themes.
- [ ] Use `animated` where one squadmate performs: the home page hero squadmate and the `/chat` working squadmate. Lists (catalog, mascot-states reference) stay still.
- [ ] Markdown twin and `llms.txt` entry for the new page.
- [ ] e2e: the motion page renders all ten states; animated squadmates have running CSS animations, and none under reduced motion (`page.emulateMedia({ reducedMotion: "reduce" })`); no overflow at 390 px; axe.

## Rules
- Do not edit the comp, `design/**`, `packages/ui/src/squadmates/**` (synced code), `PLAN.md`, `AGENTS.md`, `dev/**`, `.agents/skills/**` or `.claude/**`.
- No new dependencies. No module-scope timers or randomness. Tokens only in CSS files; logical properties. Mirror sideways motion in RTL where the comp's motion has a direction (face glances, sway).
- `npm run verify` passes.
