# Dashboard live validation

Target: 756cf7c24bf9b621d30bd1e0c8bee81d66174768

The configured full verify command was reported as exit 1 by the outer executor. Its diagnostic output was not supplied. This phase did not rerun full verification or static checks.

Executed targeted checks (all exit 0):

- `MISE_TRUSTED_CONFIG_PATHS="$PWD/mise.toml" mise exec -- npx --no-install playwright test e2e/dashboard-components.spec.ts e2e/stat-tile-layout.spec.ts --workers=2 --reporter=line`
- `MISE_TRUSTED_CONFIG_PATHS="$PWD/mise.toml" mise exec -- npx --no-install playwright test e2e/dashboard-phase-evidence.spec.ts --workers=2 --reporter=line` (disposable driver retained as driver.spec.ts here).
- `MISE_TRUSTED_CONFIG_PATHS="$PWD/mise.toml" mise exec -- npx --no-install vitest run packages/ui/src/react/Card/Card.test.tsx packages/ui/src/react/PageHeader/PageHeader.test.tsx packages/ui/src/react/StatTile/StatTile.test.tsx` (supplementary unit checks; not live evidence).

Both browser commands awaited the configured production preview build and ran Chromium against localhost. Card variants and streamed tile composition, PageHeader metadata and keyboard focus, localized StatTile deltas and absent-series states, axe accessibility and responsive grid layout passed in English/LTR and Arabic/RTL, light and dark. Browser measurements are in observations-*.json. The dark negative text contrast is 5.9859:1. The isolated six-tile pages execute real React server-rendered components with real token and component CSS. Their synthetic values are 24,860 and ٢٤٬٨٦٠, with optional SAR units and no-prior-period state.

The source worktree is unchanged. Disposable driver, test results, preview builds and Wrangler runtime data were removed. Both Playwright processes exited 0 and no listener remained on port 5173.

## Rendered evidence

- [Card-ar-rtl-dark-1440.png](Card-ar-rtl-dark-1440.png)
- [Card-ar-rtl-dark-390.png](Card-ar-rtl-dark-390.png)
- [Card-ar-rtl-light-1440.png](Card-ar-rtl-light-1440.png)
- [Card-ar-rtl-light-390.png](Card-ar-rtl-light-390.png)
- [Card-en-ltr-dark-1440.png](Card-en-ltr-dark-1440.png)
- [Card-en-ltr-dark-390.png](Card-en-ltr-dark-390.png)
- [Card-en-ltr-light-1440.png](Card-en-ltr-light-1440.png)
- [Card-en-ltr-light-390.png](Card-en-ltr-light-390.png)
- [PageHeader-ar-rtl-dark-1440.png](PageHeader-ar-rtl-dark-1440.png)
- [PageHeader-ar-rtl-dark-390.png](PageHeader-ar-rtl-dark-390.png)
- [PageHeader-ar-rtl-light-1440.png](PageHeader-ar-rtl-light-1440.png)
- [PageHeader-ar-rtl-light-390.png](PageHeader-ar-rtl-light-390.png)
- [PageHeader-en-ltr-dark-1440.png](PageHeader-en-ltr-dark-1440.png)
- [PageHeader-en-ltr-dark-390.png](PageHeader-en-ltr-dark-390.png)
- [PageHeader-en-ltr-light-1440.png](PageHeader-en-ltr-light-1440.png)
- [PageHeader-en-ltr-light-390.png](PageHeader-en-ltr-light-390.png)
- [StatTile-ar-rtl-dark-1440.png](StatTile-ar-rtl-dark-1440.png)
- [StatTile-ar-rtl-dark-390.png](StatTile-ar-rtl-dark-390.png)
- [StatTile-ar-rtl-light-1440.png](StatTile-ar-rtl-light-1440.png)
- [StatTile-ar-rtl-light-390.png](StatTile-ar-rtl-light-390.png)
- [StatTile-en-ltr-dark-1440.png](StatTile-en-ltr-dark-1440.png)
- [StatTile-en-ltr-dark-390.png](StatTile-en-ltr-dark-390.png)
- [StatTile-en-ltr-light-1440.png](StatTile-en-ltr-light-1440.png)
- [StatTile-en-ltr-light-390.png](StatTile-en-ltr-light-390.png)
- [grid-ar-dark-1180.png](grid-ar-dark-1180.png)
- [grid-ar-dark-1440.png](grid-ar-dark-1440.png)
- [grid-ar-dark-390.png](grid-ar-dark-390.png)
- [grid-ar-dark-480.png](grid-ar-dark-480.png)
- [grid-ar-dark-760.png](grid-ar-dark-760.png)
- [grid-ar-light-1180.png](grid-ar-light-1180.png)
- [grid-ar-light-1440.png](grid-ar-light-1440.png)
- [grid-ar-light-390.png](grid-ar-light-390.png)
- [grid-ar-light-480.png](grid-ar-light-480.png)
- [grid-ar-light-760.png](grid-ar-light-760.png)
- [grid-en-dark-1180.png](grid-en-dark-1180.png)
- [grid-en-dark-1440.png](grid-en-dark-1440.png)
- [grid-en-dark-390.png](grid-en-dark-390.png)
- [grid-en-dark-480.png](grid-en-dark-480.png)
- [grid-en-dark-760.png](grid-en-dark-760.png)
- [grid-en-light-1180.png](grid-en-light-1180.png)
- [grid-en-light-1440.png](grid-en-light-1440.png)
- [grid-en-light-390.png](grid-en-light-390.png)
- [grid-en-light-480.png](grid-en-light-480.png)
- [grid-en-light-760.png](grid-en-light-760.png)
