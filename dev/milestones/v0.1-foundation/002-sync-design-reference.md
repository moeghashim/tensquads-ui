---
id: 002
title: Sync and check the pinned Agent-UI design reference
milestone: v0.1-foundation
category: design-sync
priority: high
files: ["scripts/sync-design.mjs", "scripts/design-check.mjs", "design/**"]
---

## Acceptance criteria
- [ ] Sync the required Agent-UI files, mascots, and logo from design-system commit `644fd15aa8c18dbb0ec5c83181426a7719a5dc4f`.
- [ ] Write `design/MANIFEST.json` with the source repository, pinned commit, and SHA-256 for every synced file.
- [ ] `npm run design:check` exits 0 on a clean sync and exits non-zero after a synced file changes.
- [ ] `npm run design:sync -- <commit>` supports a deliberate future update without editing synced files by hand.
- [ ] Keep all generated `design/**` output limited to `scripts/sync-design.mjs`.

## Suggested approach
Use the design-system README and manifest at the pinned commit. Sync `agent-ui/tokens.json`, Agent-UI reference docs and component guides, `mascots/`, and `logo/` as required by PLAN.md §§2 and 4. The pinned source has no Dialog or Tooltip guide; do not invent visual values. Record this source limitation in those component tasks and use only documented Agent-UI tokens.
