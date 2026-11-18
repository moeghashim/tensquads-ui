---
id: 004
title: Build the component preview app
milestone: v0.1-foundation
category: preview
priority: high
files: ["apps/preview/**", "package.json", "vite.config.*", "wrangler.*"]
---

## Acceptance criteria
- [ ] Create the TanStack Start preview app with the Cloudflare Vite plugin.
- [ ] Add a gallery shell with locale, direction, and theme controls for component previews.
- [ ] Provide preview routes or fixtures that later component tasks can populate.
- [ ] Run locally with `npm run dev` and build for a Cloudflare Worker.
- [ ] Keep preview-only dependencies out of the published UI runtime package.
- [ ] Keep a consumer's git install fast: the git-dependency `prepare` step must not install or build the preview app. Measure `npm install github:…#<sha>` time before and after this task and report both in the PR.

## Suggested approach
Follow the pinned versions in PLAN.md §3. Set `lang`, `dir`, and `data-theme` on the document root for each preview state. Keep layout logical so the same gallery works in RTL.
