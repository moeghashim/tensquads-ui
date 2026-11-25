---
id: 006
title: Page templates
milestone: v0.3-design-system
category: preview
priority: high
files: ["templates/**", "apps/preview/**", "e2e/**", "scripts/**", "llms.txt", "README.md", "DESIGN.md"]
---

Decided by Moe on 2026-11-25 (D34). Starts after 005 merges. Agents copy a correct layout instead of inventing one.

## Acceptance criteria
- [ ] `templates/` at the repository root, one folder per template, each a self-contained React file that imports only from `@tensquads/ui/*` and uses only `--ts-*` tokens in a sibling CSS file: `app-shell` (side navigation, header, content), `dashboard` (PageHeader, StatTile row, Cards with charts, DataTable), `list` (PageHeader, filters, DataTable, EmptyState), `settings` (sectioned Fields, Switches, SegmentedControl, save bar), `chat` (Chat parts with an agent reply and a form action). Each matches its reference screen in `design/screens/` and the layout section of `DESIGN.md`.
- [ ] Each template takes its copy from a props object with English and Arabic defaults, and renders correctly in both locales and both themes.
- [ ] Each folder has a `README.md`: what the page is for, the reference screen it follows, which parts to replace, and the install and style-import steps.
- [ ] The site renders each template at `/templates/<name>` (a "Templates" link in the site nav after Components), with "Copy source" and a link to the GitHub file. Markdown twins and `llms.txt` entries under a "Templates" section.
- [ ] `DESIGN.md` page-layout sections link to their template.
- [ ] The preview type-checks and lints the templates, so they cannot drift from the library API.
- [ ] e2e: every template page in both locales and themes, axe, no overflow at 390 px; Copy source copies the file.
- [ ] `npm run verify` passes.

## Rules
- Do not edit `PLAN.md`, `AGENTS.md`, `dev/**`, `design/**`, `.agents/skills/**` or `.claude/**`. Templates are examples, not package exports: no change to the public API.
