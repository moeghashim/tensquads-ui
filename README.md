# tensquads-ui

Use Node 26.13.1 and npm 11.20.0. Install [mise](https://mise.jdx.dev/), then run `mise trust` and `mise install` from the repository root. Run npm commands with `mise exec -- npm …` to use the pinned versions without changing the machine-wide Node or npm.

tensquads-ui is the shared UI layer for tensquads (English) and بنّاء (Arabic), bringing React components and OpenUI definitions together in `@tensquads/ui`. See [PLAN.md](PLAN.md) for the project plan and decisions.

## Commands

- `npm run check` — Run Biome, type checking, design integrity, generated-token and component-index staleness, CSS color-token and UI SDK import checks, unit tests, and the package check.
- `npm run verify` — Run `check`, `preview:install`, `check:preview`, and `e2e`, in that order.
- `npm run build` — Build the package into `packages/ui/dist`.
- `npm run preview:install` — Install the preview app's dependencies from its own lockfile.
- `npm run dev` — Start the preview development server.
- `npm run check:preview` — Run preview type checking and unit tests.
- `npm run build:preview` — Build the preview app for Cloudflare Workers.
- `npm run deploy:preview` — Build and deploy the preview Worker using Wrangler.
- `npm run tokens` — Regenerate CSS custom properties and typed TypeScript tokens from the synced `design/tokens.json`.
- `npm run tokens:check` — Fail for missing or stale generated token files without writing them.
- `npm run docs` — Regenerate [llms.txt](llms.txt) from component Markdown under `packages/ui/src/react`. Do not edit the generated index by hand.
- `npm run docs:check` — Fail for a missing or stale component index or an OpenUI definition without its component Markdown file, without writing files.
- `npm run check:pack` — Pack and install the package in a temporary fixture, reject test files and duplicate UI SDK installations, verify exported entry points, and check that URLs in exported CSS resolve to files inside the installed package.
- `npm run check:ui-sdk-usage` — Check UI SDK imports in `packages/ui/src` against the installed SDK documentation and require matching core and React version pins. If a package's documentation cannot be read, use its package exports. Reject internal and unknown entries.
- `npm run ui-sdk:update` — Check upstream releases and update both UI SDK pins, the root lockfile, and the upstream skill. See [UI SDK updates](#ui-sdk-updates) for options and the PR workflow.
- `npm run check:git-install` — Install a git commit in a temporary consumer fixture, import each JavaScript export, and check CSS entry files exist. Requires `GITHUB_WORKSPACE` (repository path) and `GITHUB_SHA` (commit to install); CI supplies these for the PR head or pushed commit.
- `npm run check:css-tokens` — Reject raw color literals in CSS under `packages/ui/src/styles`, including variable fallbacks. Color token variables, `transparent`, `currentColor`, and CSS-wide keywords are allowed.
- `npm run design:sync -- <commit>` — Sync design references and regenerate the SHA-256 manifest; pass a full 40-character commit SHA after the npm run separator (`--`), or omit it to use the script's default commit. Design files are never edited by hand.
- `npm run design:check` — Check design files against the manifest, failing for changed, extra, or missing files and unsupported filesystem entries, including symlinks.

## UI SDK updates

Run `npm run ui-sdk:update -- --dry-run` to read the current npm tags and GitHub release notes without changing files. The updater uses the `beta` tag until `latest` is a stable release of at least `1.0.0`. Both packages must select the same version. If the selected version is not newer than the current React pin, the updater makes no changes.

Run the command without `--dry-run` to apply the update. It also replaces `.agents/skills/ui-sdk` with the skill from the matching upstream React release tag and writes release notes and public export changes to `ui-sdk-update-body.md`. Run `npm ci` to install the updated dependencies before checking them. For an offline preview with recorded data, run `npm run ui-sdk:update -- --fixtures scripts/fixtures/ui-sdk-update-beta8.json --dry-run`.

The [UI SDK update workflow](.github/workflows/ui-sdk-update.yml) runs daily and supports manual dispatch. For this foundation branch, set the manual `base` input to `feat/v0.1-foundation`; the default is `main`. The workflow checks out the selected PR base branch before updating dependencies. When an update changes files, the workflow installs the updated dependencies and Chromium, runs `npm run verify`, and opens or updates one PR on `bot/ui-sdk-update`. It publishes `ui-sdk-verify` on the PR head. Failed verification adds `ui-sdk-break` and includes the log tail in the PR body; successful verification removes that label. Update commits include a DCO sign-off. The workflow never merges the PR.

## Preview app

Run `npm run preview:install`, then `npm run dev` from the repository root. The TanStack Start app in `apps/preview` is a separate npm project, outside the root `packages/*` workspaces. Root installation and `prepare` build only the UI package; `npm run check` covers the package independently of preview dependencies. Use `npm run check:preview` to check the app separately.

The gallery at `/` provides English/Arabic locale, LTR/RTL direction, and system/light/dark theme controls. Settings are stored in the URL as `locale`, `dir`, and `theme`, for example `/?locale=ar&dir=rtl&theme=dark`. English, LTR, and system theme are the defaults; Arabic defaults to RTL unless `dir` overrides it. Selecting a locale resets the direction to that locale's default. The gallery discovers components from their fixture files and links to case-sensitive `/components/<Name>` routes. Each component route renders the selected locale's OpenUI fixture. The Button route also shows all variants and sizes; see the [Button contract](packages/ui/src/react/Button/Button.md) for its API.

`/components/Squadmate` shows every character and state in the selected locale and theme. See the [Squadmate contract](packages/ui/src/react/Squadmate/Squadmate.md) for its component and drawing APIs.

Vite aliases and TypeScript paths resolve `@tensquads/ui/*` directly to `packages/ui/src`; the app has no npm dependency on the UI package and needs no package build before previewing source changes.

## Consumer setup

Install `@tensquads/ui` from a pinned Git commit, then add these imports to the consumer's global stylesheet in this order:

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
```

See the [font inventory](packages/ui/src/fonts/README.md) for bundled families, pinned releases, weights, and licenses.

## OpenUI

Import `TensquadsRenderer` from `@tensquads/ui/openui` to render an OpenUI text stream:

```tsx
import { TensquadsRenderer } from "@tensquads/ui/openui";

<TensquadsRenderer
  stream={'root = Button("Continue")'}
  locale="en"
  onError={(errors) => console.log(errors)}
/>;
```

`stream` accepts a string or `null`; `locale` defaults to `en`. The locale selects a lazily created, cached library, not a translation of the stream. Supply localized text in the stream itself. `onError` receives the upstream renderer's errors, including errors in streams that still render content.

The same entry exports `defineComponent` for typed OpenUI definitions, `getRegisteredComponents` for the built-in definitions, and `createTensquadsLibrary(locale)` for direct library access. See the [component index](llms.txt) for component contracts. Shared Zod schemas and their inferred types are exported from `@tensquads/ui/schemas`; [the schema source](packages/ui/src/schemas/index.ts) defines their accepted values.

## Browser verification

After installing root and preview dependencies, run `npx playwright install chromium`, then `npm run e2e`. Stop any server using port 5173 first, including `npm run dev`. Playwright requires the port to be free and starts its own server. It builds the preview with Vite and serves the generated Cloudflare Worker locally through Wrangler at `http://localhost:5173`; see [playwright.config.ts](playwright.config.ts) for server and browser settings. The smoke test covers English/LTR and Arabic/RTL in light and dark themes, screenshots at 1440 and 390 px widths, mobile overflow, axe accessibility, and the focus ring.

Run `npm run e2e:update` on Linux to regenerate the committed baselines in `e2e/__screenshots__`, then review the image changes. Routine CI compares the committed baselines without regenerating them. The preview app and consumers load the bundled product fonts. Chromium disables LCD text and font hinting, and the helper removes native select arrows in tests to normalize control widths across macOS and Linux. Screenshots allow at most 0.1% differing pixels for residual platform glyph rasterization, with Playwright's default per-pixel sensitivity. Use Linux for final baseline verification. Reusable route, screenshot, overflow, accessibility, and focus helpers live in [e2e/helpers/preview.ts](e2e/helpers/preview.ts). Failed CI runs upload the Playwright HTML report.

## Design tokens

After syncing design references, run `npm run tokens` and commit the generated `packages/ui/src/tokens/tokens.css` and `packages/ui/src/tokens/tokens.ts`. Do not edit these outputs by hand. Run `npm run build` to include them in the package; the package build copies and compiles the committed outputs rather than regenerating them.

Follow [Consumer setup](#consumer-setup) for stylesheet imports and font licensing references.

Import `@tensquads/ui/tokens.css` to use the `--ts-` custom properties in the `tensquads` cascade layer. Token names retain their spelling with dots replaced by hyphens, so `text-md.font-size` becomes `--ts-text-md-font-size`. Set `data-theme="light"` or `data-theme="dark"` on `<html>` to select a theme. Without an explicit theme, the root uses light values and follows `prefers-color-scheme: dark` when requested by the OS.

The `tokens` object is the only runtime export from `@tensquads/ui/tokens`. It maps token names to resolved `light` and `dark` values, including inherited typography families. `TokenName`, `TokenTheme`, and `TokenValue<Name>` are type-only exports:

```ts
import { tokens, type TokenName, type TokenTheme } from "@tensquads/ui/tokens";

const name: TokenName = "canvas";
const theme: TokenTheme = "dark";
const background = tokens[name][theme];
```
