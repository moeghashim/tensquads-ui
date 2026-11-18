---
id: 001
title: Turn the preview gallery into the tensquads-ui home site
milestone: v0.2-home
category: preview
priority: high
files: ["apps/preview/**", ".github/workflows/**", "README.md"]
---

Decided by Moe on 2026-11-18 (option 3, D21). The gallery is already live at https://tensquads-ui-preview.mohanadgh.workers.dev (deployed from main at f99ad1d).

## Acceptance criteria
- [ ] Home page: what the library is, install steps (D13), CSS setup, links to every component; English and Arabic copy.
- [ ] One page per component generated from its `X.md`, with live examples, copyable code and the OpenUI fixture rendered; all section labels localised.
- [ ] Getting-started page for coding agents: the `tensquads-ui` and `ui-sdk` skills and `llms.txt`.
- [ ] No OpenUI playground and no Anthropic key on the Worker (Moe, 2026-11-18). OpenUI is shown only through the rendered fixtures.
- [ ] Keep the address https://tensquads-ui-preview.mohanadgh.workers.dev. No custom domain (Moe, 2026-11-18).
- [ ] No deploy workflow and no Cloudflare secret in the repo. Opus deploys by hand with `npm run deploy:preview` from `main` after each merge that changes the site (Moe, 2026-11-18). README states the address.
- [ ] e2e and screenshots as in D20; `npm run verify` passes.
