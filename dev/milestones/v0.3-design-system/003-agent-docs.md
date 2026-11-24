---
id: 003
title: Serve llms.txt, llms-full.txt and Markdown for every page
milestone: v0.3-design-system
category: preview
priority: high
files: ["apps/preview/**", "scripts/**", "e2e/**", "llms.txt"]
---

Starts after 002 merges. Decided by Moe on 2026-11-24 (D32): agents read the site through llms.txt and Markdown pages. No JSON endpoints and no WebMCP here.

## Acceptance criteria
- [ ] `/llms.txt`: a title, a one-paragraph summary, then one line per page (foundations, components, get started) with its `.md` URL and a one-line description, in the llms.txt format.
- [ ] `/llms-full.txt`: every page's Markdown in one file, in nav order.
- [ ] Every page has a Markdown twin at its path plus `.md` (for example `/components/Node.md`, `/foundations/colour.md`, `/get-started.md`), served as `text/markdown; charset=utf-8`. Component pages use their `X.md`; foundation pages render tokens as Markdown tables from `design/tokens.json`.
- [ ] Every HTML page links its Markdown twin with `<link rel="alternate" type="text/markdown">` and a visible "View as Markdown" link.
- [ ] Arabic: `/llms.txt` stays English; Markdown twins accept `?locale=ar` where the page has Arabic copy, the same way as the HTML pages.
- [ ] Generated at build time from the same sources as the HTML; a check fails the build when a page has no Markdown twin.
- [ ] e2e: fetch `/llms.txt`, `/llms-full.txt` and three `.md` URLs, check status, content type and that every link in `/llms.txt` resolves.
- [ ] `npm run verify` passes.
