# Tooltip live validation

Command: npx playwright test e2e/tooltip.spec.ts --workers=2 --reporter=line
Exit: 0. Result: 8 passed (17.8s). The configured webServer completed npm run build:preview and served the built app with Wrangler at localhost:5173. Playwright stopped the server on completion.

Independent oracle: the accepted intent requires UI SDK RTL mirroring; logical end is right in LTR and left in RTL, and logical start is the inverse. Top and bottom stay vertical. The tests assert physical bounding-box relationships as well as data-side. A non-mirrored RTL placement or placement based on locale would fail.

Executed states: en/ltr/light, en/ltr/dark, ar/rtl/light, ar/rtl/dark, ar/ltr/light, ar/ltr/dark, en/rtl/light, en/rtl/dark. In each state, focused top/right/bottom/left triggers individually, asserted one visible tooltip, requested physical geometry, hint text, shortcut and aria-describedby. Ran axe and focus-ring assertions. Captured each side at 1440px and 390px; checked mobile document overflow.

Screenshots: 64 PNG files. Visually reviewed en/ltr/light/right desktop, ar/rtl/dark/right desktop, ar/ltr/light/left mobile and en/rtl/dark/left mobile. All show the expected placement and legible content.

Setup: npm ci --ignore-scripts and npm --prefix apps/preview ci --ignore-scripts both exited 0. No lint, static analysis, full-suite, push, PR or CI phases were run. No source changes.
