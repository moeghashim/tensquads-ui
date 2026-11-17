# tensquads-ui

tensquads-ui is the shared UI layer for tensquads (English) and بنّاء (Arabic), bringing React components and OpenUI definitions together in `@tensquads/ui`. See [PLAN.md](PLAN.md) for the project plan and decisions.

## Commands

- `npm run check` — Run Biome, type checking, design integrity and generated-token staleness checks, tests, and the package check.
- `npm run build` — Build the package into `packages/ui/dist`.
- `npm run tokens` — Regenerate CSS custom properties and typed TypeScript tokens from the synced `design/tokens.json`.
- `npm run tokens:check` — Fail for missing or stale generated token files without writing them.
- `npm run check:pack` — Pack and install the package in a temporary fixture, reject test files, and verify exported entry points.
- `npm run design:sync -- <commit>` — Sync design references and regenerate the SHA-256 manifest; pass a full 40-character commit SHA after the npm run separator (`--`), or omit it to use the script's default commit. Design files are never edited by hand.
- `npm run design:check` — Check design files against the manifest, failing for changed, extra, or missing files and unsupported filesystem entries, including symlinks.

## Design tokens

After syncing design references, run `npm run tokens` and commit the generated `packages/ui/src/tokens/tokens.css` and `packages/ui/src/tokens/tokens.ts`. Do not edit these outputs by hand. Run `npm run build` to include them in the package; the package build copies and compiles the committed outputs rather than regenerating them.

Import `@tensquads/ui/tokens.css` to use the `--ts-` custom properties in the `tensquads` cascade layer. Token names retain their spelling with dots replaced by hyphens, so `text-md.font-size` becomes `--ts-text-md-font-size`. Set `data-theme="light"` or `data-theme="dark"` on `<html>` to select a theme. Without an explicit theme, the root uses light values and follows `prefers-color-scheme: dark` when requested by the OS. Font tokens reference family names; font files and font loading are not supplied.

The `tokens` object is the only runtime export from `@tensquads/ui/tokens`. It maps token names to resolved `light` and `dark` values, including inherited typography families. `TokenName`, `TokenTheme`, and `TokenValue<Name>` are type-only exports:

```ts
import { tokens, type TokenName, type TokenTheme } from "@tensquads/ui/tokens";

const name: TokenName = "canvas";
const theme: TokenTheme = "dark";
const background = tokens[name][theme];
```
