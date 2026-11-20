# Live CommandPalette validation

Target 6a41ffd41c1fc7d3228ab907013ea5c53f59ef89. Real production-built local preview via Wrangler at localhost:5173, driven by Chromium with disposable browser contexts.

Supplied baseline: npm ci followed by npm run verify exited 1; underlying diagnostic was not supplied. Full verify and static checks were not repeated per phase constraints.

Commands (MISE_TRUSTED_CONFIG_PATHS="$PWD/mise.toml" mise exec --):
- node --version: exit 0, v26.13.1.
- npm run e2e -- e2e/command-palette.spec.ts --workers=1 --output=<evidence>/playwright-results: exit 0. Production build and four targeted browser tests completed. HTML evidence: playwright-report/index.html.
- npm run e2e -- e2e/phase-command-palette.spec.ts --workers=1 --output=<evidence>/supplemental-results: initial exit 1 from disposable-driver selector errors (Chat instead of displayed Chat demo; Search also matched Open search). Corrected selectors to displayed labels and header scope. Rerun exit 0; three supplemental browser tests completed. HTML evidence: supplemental-report/index.html. Both commands set PLAYWRIGHT_HTML_OPEN=never and PLAYWRIGHT_HTML_OUTPUT_DIR to their evidence report directories.

Observed results:
1. Demo opened in en/LTR and ar/RTL, light/dark. Open-dialog axe checks passed. Open-palette 390px overflow check passed. Eight screenshots captured at 1440/390px.
2. Label search matched Components; Arabic unmarked المكونات matched المكوّنات. Keyword dark left only Change theme and one group. Unknown query showed localized No matches and no groups/options; Enter left it open. Reopening reset the query and restored four items. ArrowDown/Enter selected and closed.
3. Backdrop closed and returned focus to Open search; Escape closed the search and restored focus in both locales.
4. Site shortcut selected Toolbar and navigated to its page. Synthetic MacIntel/Linux browser platform contexts ignored composing modifier-K; real Meta+K/Control+K opened and focused search. Tab/Shift+Tab remained inside. Escape restored header Search focus.
5. All six page commands navigated in both locales while preserving locale/dir/theme. Description keyword non-interactive found Badge; selection rendered the Badge page.
6. At 390px, named header Search opened a contained, scrolling list. Arabic/English commands changed document language/direction; dark/system/light commands changed URL and document attributes, preserved route/locale, and reset the query on reopen. System left explicit theme unset under emulated dark OS preference.

CommandPalette-*.png and site-settings-*.png were produced in this run. Inspected English desktop/light, Arabic mobile/dark demo, and Arabic mobile settings screenshots. Retained successful reports contain execution results. Driver retained as phase-command-palette.spec.ts; working-tree copy removed. No product edits. Test runners completed and stopped their managed browser/server children.
