---
id: 022
title: Drop pixel comparisons; keep screenshots as CI artifacts (D20)
milestone: v0.1-foundation
category: ci
priority: high
files: [".github/workflows/**", "e2e/**", "playwright.config.ts", "package.json", "README.md", "scripts/**"]
---

Added by Opus on 2026-11-18. Most failed CI runs so far came from screenshot baselines made on macOS (glyph rendering differs from Linux CI), from the shared preview-home baselines that every component PR changes, and from one flaky capture.

## Acceptance criteria
- [ ] A workflow `e2e-baselines.yml` (manual dispatch with a `branch` input, and on a PR label `update-baselines`) runs `npm run e2e:update` on the same Linux image and Node version as `ci.yml`, then commits only changed PNGs under `e2e/__screenshots__/` to that branch as one commit signed off by `github-actions[bot]` (DCO-matching identity), and removes the label. It never touches other files.
- [ ] Local `npm run e2e:update` refuses to write baselines on non-Linux unless `ALLOW_LOCAL_BASELINES=1` is set, with a message that points to the workflow. Local `npm run e2e` on macOS skips the pixel comparison (all other assertions still run) and says so; CI on Linux always compares.
- [ ] The preview-home screenshot no longer depends on the component list: capture the header and controls only (or mask the list with a fixed-size box), so adding a component does not change home baselines. The list itself gets a text assertion instead.
- [ ] `capturePreviewScreenshots` waits for `document.fonts.ready` and for no element with `data-starting-style` / `data-ending-style`, so open-state popups are captured after their transition.
- [ ] AGENTS.md follow-up for task 018: baselines come only from the workflow.
- [ ] `npm run verify` exits 0 in CI.

## Changed on 2026-11-18 (D20)
Moe chose option B: no pixel comparisons and no committed baselines. The baseline workflow, macOS skip and `ALLOW_LOCAL_BASELINES` items above are dropped. See the brief in the task 022 thread and PLAN.md D20.
