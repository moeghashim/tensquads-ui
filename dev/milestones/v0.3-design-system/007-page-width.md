---
id: 007
title: One page width across the site
milestone: v0.3-design-system
category: preview
priority: high
files: ["apps/preview/**", "e2e/**"]
---

Requested by Moe on 2026-11-25. `/components/Button` must follow the width of `/components`. Today the component pages (`component-doc-page`), Get started (`content-page`) and the dashboards (`dashboard-page`) use their own wrappers instead of `design-wrap`.

## Acceptance criteria
- [ ] Every page uses `design-wrap` for its outer width and gutters: home, foundations, components and each component page, chat, get started, workflows, the dashboards, the reference pages and templates. Reading text inside a page keeps its own measure (`max-inline-size` in `ch`); only the page frame changes.
- [ ] The Nodes builder (`/nodes/*`) stays full width, because it is a canvas. Its header aligns with `design-wrap` gutters.
- [ ] The site header, the page content and the footer share the same inline start and end edges on every page at 1440, 1024 and 390 px.
- [ ] e2e: for every route in the site, the main content box has the same inline start and width as `/components` (the builder excepted), in both directions; no overflow at 390 px.
- [ ] `npm run verify` passes.
