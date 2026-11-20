# CommandPalette live validation

Surface: production-built preview on localhost:5173, served by Wrangler and driven with Playwright Chromium. All inputs are disposable local demo data. MacIntel and Linux navigator platforms were selected in isolated browser contexts; IME composition was dispatched to the real page listener. This does not validate native operating-system IME integration.

## Observed failures and repairs

Before repair, typing `المكونات` hid `المكوّنات`; the targeted existing browser and unit tests failed. SDK default fuzzy filtering fixed this match but made the existing Toolbar selection navigate to Menu. The final repair supplies one normalized substring filter to Command, which retains responsibility for group visibility and selection. No rendered-list prefilter was restored.

Before repair, one Escape with a nonempty query cleared the search and left the modal open in both locales. The final handler closes it on the first Escape. Added permanent browser regression coverage for keyword/group filtering, empty results, Enter with no results, Escape, focus return, and query reset. The focused unit focus-return test now also enters a query before Escape.

## Commands and outcomes

- Supplied baseline (outer executor): `MISE_TRUSTED_CONFIG_PATHS="$PWD/mise.toml" mise exec -- sh -c "npm ci --no-audit --no-fund && npm run verify"` — exit 1. Not rerun: this phase prohibits static analysis and full-suite execution.
- `npm --prefix apps/preview ci --no-audit --no-fund` — exit 0.
- `npm run build:preview` — exit 0; final production build awaited before browser tests.
- `npx vitest run packages/ui/src/react/CommandPalette/CommandPalette.test.tsx --reporter=dot` — exit 0 after repair.
- `npx playwright test --config .local-palette.config.ts` — exit 0 on final run. Configuration and supplemental scenarios retained here; disposable working-tree copies removed.

## Live results

- filter keywords, hide empty groups, reject absent actions, Escape and reset (en): passed
- filter keywords, hide empty groups, reject absent actions, Escape and reset (ar): passed
- platform shortcut prevents default and ignores composing events (MacIntel): passed
- platform shortcut prevents default and ignores composing events (Linux x86_64): passed
- site page navigation, registry keyword search, language and theme settings retain URL state: passed
- site palette remains usable with its long list at desktop and mobile widths in both directions and themes: passed
- CommandPalette opens, filters, selects and passes axe in both locales and themes: passed
- site shortcut finds a component and navigates to its page: passed
- CommandPalette closes on a backdrop press and returns focus: passed
- CommandPalette filters keywords, handles no matches and closes a search on the first Escape: passed

Screenshots include the open demo and site palettes in English/LTR and Arabic/RTL, light and dark, at 1440 and 390 pixels. Additional screenshots show localized empty results and Arabic normalized search. Open-dialog axe checks, list scrolling, footer visibility, accessible mobile search naming, and document overflow assertions passed. Representative desktop and Arabic mobile screenshots were visually inspected.

All Playwright browser and Wrangler server children finished before cleanup. Preview build outputs, local Wrangler state, temporary test configuration and supplemental test files were removed. Root prepared dependencies and package distribution were preserved. Three intentional source/test changes remain for the outer executor. CI and pipeline delivery remain owned by that executor.
