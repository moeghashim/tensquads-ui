# tensquads-ui

tensquads-ui is the shared UI layer for tensquads (English) and بنّاء (Arabic), bringing React components and OpenUI definitions together in `@tensquads/ui`. See [PLAN.md](PLAN.md) for the project plan and decisions.

## Commands

- `npm run check` — Run Biome, type checking, design integrity checks, tests, and the package check.
- `npm run build` — Build the package into `packages/ui/dist`.
- `npm run check:pack` — Pack and install the package in a temporary fixture, reject test files, and verify exported entry points.
- `npm run design:sync -- <commit>` — Sync design references and regenerate the SHA-256 manifest; pass a full 40-character commit SHA after the npm run separator (`--`), or omit it to use the script's default commit. Design files are never edited by hand.
- `npm run design:check` — Check design files against the manifest, failing for changed, extra, or missing files and unsupported filesystem entries, including symlinks.
