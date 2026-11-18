---
id: 001
title: Turn the preview gallery into the site shell and home page
milestone: v0.2-home
category: preview
priority: high
files: ["apps/preview/**", "e2e/**", "README.md"]
---

Decided by Moe on 2026-11-18 (D21). The gallery is live at https://tensquads-ui-preview.mohanadgh.workers.dev. That address stays. No custom domain, no deploy workflow, no Cloudflare secret, no OpenUI playground, no Anthropic key on the Worker. Opus deploys by hand with `npm run deploy:preview` after merges to `main`.

Tasks 002 and 003 build on this shell and run in parallel after it merges. Keep the shell small and stable so they do not touch the same files.

## Acceptance criteria
- [ ] Shared site layout in `apps/preview`: header with the site name, primary nav (Home, Components, Get started), locale switch (en/ar) and theme switch (light/dark/system), built from `@tensquads/ui` components where one fits. Locale and theme stay in the URL as today (`state.ts`).
- [ ] Site copy lives in one module per locale (for example `apps/preview/src/copy/en.ts` and `ar.ts`) with the same keys. Arabic copy is natural Modern Standard Arabic, gender-neutral where it addresses the reader (follow the D18 style).
- [ ] Home page at `/`: what the library is (one short paragraph), install from a pinned commit (D13), the CSS setup from README, and a grid that links to every component page. The component list comes from the existing registry, not a hand-written list.
- [ ] The existing gallery content moves to `/components` (index) and `/components/$name` keeps working. Existing e2e coverage keeps passing at the new paths.
- [ ] Empty route stub `/get-started` with a heading only (task 003 fills it).
- [ ] No horizontal scroll at 390 px; axe clean; keyboard reachable nav with the D-standard focus ring; both directions and themes.
- [ ] e2e: smoke test for `/`, `/components`, `/get-started` in en/ar; screenshots attached as in D20 (no `toHaveScreenshot`).
- [ ] README states the site address in one line near the top.
- [ ] `npm run verify` passes.
