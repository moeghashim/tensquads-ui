---
id: 002
title: Generate one documentation page per component from X.md
milestone: v0.2-home
category: preview
priority: high
files: ["apps/preview/src/routes/components.$name.tsx", "apps/preview/src/components/docs/**", "apps/preview/vite.config.*", "e2e/**"]
---

Starts after 001 merges. Runs in parallel with 003. Scope rules from D21 apply (no playground, no new secrets).

## Acceptance criteria
- [ ] `/components/$name` renders the component's `X.md` (packages/ui/src/react/X.md) as the page body: title, description, props and usage sections. Markdown is read at build time; no runtime fetch.
- [ ] Each page keeps the live examples that exist today, and adds a copyable code block for each example (copy button with an accessible label and a visible confirmation).
- [ ] Each page renders the OpenUI fixture for the active locale (`X.fixture.en.txt` / `X.fixture.ar.txt`) through `TensquadsRenderer`, and shows the fixture source in a collapsible block.
- [ ] All section labels are localised through the 001 copy modules.
- [ ] A component without an OpenUI definition says so, using the reason in its `X.md`.
- [ ] Previous / next links between component pages in registry order; logical direction in RTL.
- [ ] No new runtime dependency without an open question in `dev/open-questions.md` (a markdown renderer counts). Prefer a build-time transform.
- [ ] e2e: every component page loads in en/ar, the copy button works, the fixture renders; overflow and axe checks; screenshots as in D20.
- [ ] `npm run verify` passes.
