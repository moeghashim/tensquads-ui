---
id: 020
title: Ship the product fonts as fonts.css
milestone: v0.1-foundation
category: tokens
priority: high
files: ["packages/ui/src/fonts/**", "package.json", "scripts/build.mjs", "scripts/build-tokens.mjs", "apps/preview/src/**", "e2e/helpers/**"]
---

Runs after task 019 and before task 006. Added by Opus on 2026-11-17 for decision D17 (open question Q2).

## Acceptance criteria
- [ ] `packages/ui/src/fonts/` holds WOFF2 files for Inter, IBM Plex Sans Arabic and JetBrains Mono, from pinned official releases, with each SIL OFL 1.1 licence file. Weights: the ones the type tokens use (check `design/tokens.json`), and no others.
- [ ] `fonts.css` declares `@font-face` for each file with `font-display: swap` and, for IBM Plex Sans Arabic, a `unicode-range` covering Arabic. The package exports `./fonts.css`; the build copies the CSS and font files to `dist`, and `check-pack` proves the font URLs resolve inside the installed package.
- [ ] The `sans` font stack in the generated tokens puts IBM Plex Sans Arabic after Inter. If this needs a change to how `scripts/build-tokens.mjs` maps the source family (the source `tokens.json` is not edited), record the mapping rule in the PR.
- [ ] The preview app imports `fonts.css`. The e2e helpers stop injecting their own test fonts and rely on `fonts.css`; baselines are regenerated on Linux.
- [ ] README install steps add `@import "@tensquads/ui/fonts.css";` before `tokens.css`.
- [ ] Git-install size before and after is reported in the PR.
- [ ] `npm run verify` exits 0 in CI.
