# Sidebar targeted live validation

Oracle: dev/milestones/v0.2-dashboards/004-sidebar.md, PLAN.md section 12, and accepted R1/R2/R3 review decisions.

- Supplied baseline: `MISE_TRUSTED_CONFIG_PATHS="$PWD/mise.toml" mise exec -- npm run verify` failed with exit 127 before this test phase. Full verify was not repeated; broad checks belong to the outer executor.
- Node 26.13.1 and npm 11.20.0 used directly. Root and preview `npm ci --ignore-scripts`: exit 0.
- `node node_modules/@playwright/test/cli.js test --config .review/sidebar.playwright.config.ts` (run from evidence directory): exit 0. Config restricted execution to e2e/sidebar.spec.ts, built the production preview, and ran it with Wrangler locally. Four locale/theme combinations passed. Production build and browser runner both completed.
- `node .review/consumer-check.mjs`: exit 0. Real React Sidebar in disposable Vite localhost consumer with synthetic account, controlled active flag, deferred async button/link handlers, disabled link, and action counter. Verified pending callback classes, busy state, repeated Enter suppression, completion, active announcements and sheet item closing/focus return.
- `node .review/preview-check.mjs`: exit 0. Production localhost preview: measured desktop geometry, pinned user, localized squad roles/status, loaded images, RTL ordering, theme focus rings, 960/959 breakpoint and link navigation/closing.
- Visually inspected cropped Sidebar screenshots for all four locale/theme combinations, open mobile sheets for all four combinations, and async pending button/link screenshots.
- Browser instances closed in finally blocks. Both manually launched servers stopped deliberately (exit 130 after SIGINT); runner-managed production server stopped when Playwright completed. Temporary consumer, driver files, preview dist and Wrangler state removed. Dependencies retained. No product source changes.

Driver copies are retained under drivers for audit; original execution paths were temporary within .review.
