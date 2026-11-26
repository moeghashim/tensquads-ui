---
id: 002
title: Component fixes from the agent trial
milestone: v0.4-trial-gaps
category: component
priority: high
files: ["packages/ui/src/react/Card/**", "packages/ui/src/react/DataTable/**", "packages/ui/src/react/Menu/**", "packages/ui/src/react/Badge/**", "packages/ui/src/react/Field/**", "packages/ui/src/styles/**", "packages/ui/src/openui/**", "apps/preview/**", "e2e/**", "llms.txt"]
---

Public API changes approved by Moe (D35). Independent of the comps; can start at once.

## Acceptance criteria
- [ ] **Card**: `title` and `subtitle` accept any `ReactNode`. Card's props omit the HTML `title` attribute, so `<Card title={<span>…</span>}>` typechecks. Unit test with an element title.
- [ ] **StatusCell**: add the `info` tone, the same as Badge's. Update its OpenUI definition and fixtures in both locales.
- [ ] **MenuTrigger**: add `variant` (`solid` default, `soft`, `ghost`), styled like Button's variants. Existing output is unchanged when `variant` is not set.
- [ ] **Menu items**: style `MenuRadioItem` and `MenuCheckboxItem` (indicator, checked state, focus, disabled) from tokens. Preview examples on `/components/Menu` in both locales and themes.
- [ ] **Badge on a selected row**: every tone keeps at least 4.5:1 text contrast on a selected DataTable row in light and dark (the trial measured warning at 3.65:1 on dark). e2e measures each tone.
- [ ] **Field**: `Field.md` documents the default layout (label above, description, error) and how to place a Field in a row.
- [ ] Each changed component's `.md` and `llms.txt` are updated. `npm run verify` passes.

## Rules
- Tokens only. No new dependencies. Keep UI SDK part names and forwarded props.
