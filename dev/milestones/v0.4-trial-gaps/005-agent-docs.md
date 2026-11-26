---
id: 005
title: Docs gaps from the agent trial
milestone: v0.4-trial-gaps
category: docs
priority: medium
files: ["DESIGN.md", "README.md", "packages/ui/src/openui/**", "apps/preview/**", "llms.txt"]
---

## Acceptance criteria
- [ ] `DESIGN.md`: an Arabic money example (amount with `Intl.NumberFormat("ar", { style: "currency", currency: "SAR" })`, its digits and its place in a table cell and a StatTile).
- [ ] `README.md`: one line that says the npm `allowScripts` warning during install is expected and is not a failure.
- [ ] The OpenUI devtools Inspect button from `@openuidev/react-lang` no longer appears by default in an app's dev build. If the library can turn it off, it does, with a prop to turn it on. If it cannot, the README and the skill say how to hide it.
- [ ] `npm run verify` passes.
