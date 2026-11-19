---
id: 006
title: Show the admin and store owner dashboards on the site
milestone: v0.2-dashboards
category: preview
priority: high
files: ["apps/preview/**", "e2e/**", "README.md"]
---

Starts after 005 merges. Build both pages only from library components; any missing piece is a gap to report, not page CSS to invent. All figures are demo data from fixture files in `apps/preview/src/fixtures/`, in English and Arabic, and each page shows a "Demo data" pill. Add "Dashboards" to the site nav.

## Acceptance criteria
- [ ] `/dashboards/admin` (super admin): Sidebar with brand "Platform admin", items Companies and Squad images (count 2), section "Coming next" with Usage and billing, Platform health, Admin users (disabled), user "Moe Ghashim, Super admin". Two views switched by the sidebar (`?view=companies|images`), each keeping locale, direction and theme in the URL.
- [ ] Companies view, as in the reference: PageHeader "Companies" with the subtitle and pills "Demo data" and "53 squads online now"; six StatTiles (Companies 9, Active companies 6, Squads 66, Tasks done 7d 4,765, Monthly recurring $1,294, All-time company value $14,568) with their foot lines; a 3:2 row with "Companies created, last 8 weeks" (BarChart, latest bar dark) and "Companies by plan" (Bars progress); then the "All companies" DataTable card with search and All/Active/Trial/Paused filters that work on the demo rows, columns Company and mission, Owner, Plan, Subscription, Started, All-time value, Squads, Online. Use fictional companies and `example.com` emails; do not reuse any real person or email.
- [ ] Squad images view: PageHeader with pills "Demo data" and "2 images need attention"; five StatTiles; a 3:2 row with the "All images" DataTable (filters All, Needs attention, With bugs, With requests; columns Image with mono registry path, Version, Last updated, Deployed, Bugs) and a details column: the selected image's card (key-value list, "Roll out 2.1.1" solid and "View changelog" soft), "Open bugs" with severity badges, "Features to add" with status badges. Selecting a row updates the details.
- [ ] `/dashboards/home` (store owner): Sidebar squad variant (Petra lead, Pisa, Kyoto, Rio, Zurich, Giza with status dots). PageHeader "Good morning, Moe" with subtitle, a mission pill ("Mission" solid badge plus the mission text) and pills "Demo data" and "4 of 5 squads online"; six StatTiles (Revenue, Orders, Average order, Profit margin, Tasks done by squads, Hours saved); a 3:2 row with "Revenue, last 14 days" (BarChart, previous week light, this week dark, legend) and "Needs your approval" (count 4) listing ApprovalCards; approving or declining updates the list and the count locally; ChatLauncher "Ask Petra" opens `/chat` with the same URL state.
- [ ] Both pages work at 1440, 1180, 760 and 390px with no horizontal page scroll, in English and Arabic, light and dark. Home page and README link to them.
- [ ] e2e: filters and search change the table count, row selection updates details, approve removes a card and lowers the count, launcher navigation, axe on both pages in both directions, screenshots (D20).

## Shared rules for this milestone
- Read D24 and D25 in `PLAN.md`, `design/agent-ui/data-display.md` and each named spec under `design/agent-ui/components/` in full. The spec wins on visuals unless this file says otherwise.
- Branch from `v0.2-dashboards`. Base the PR on `v0.2-dashboards`. Work in the project checkout; do not create git worktrees (D25).
- Each component: `X.tsx`, `X.openui.ts`, `X.test.tsx`, `X.md`, `X.fixture.en.txt`, `X.fixture.ar.txt`, a registry line, an export from `@tensquads/ui/react`, a CSS file imported from `styles.css`, and a `/components/X` page (§12 checklist).
- Tokens only (`check:css-tokens`), logical CSS properties, light and dark, RTL. Numbers use `font-variant-numeric: tabular-nums`. In RTL, charts keep time running in the reading direction (oldest at the inline start).
- Build on UI SDK and `@ui-sdk/core` where they provide the behavior (Tooltip for chart hover, Input, SegmentedControl, Badge, Button). No hand-rolled roles UI SDK ships.
- No module-scope randomness, dates or timers. Demo data is passed in as props.
- Arabic copy is natural MSA and gender-neutral (D18). No emoji, no exclamation marks, sentence case.
- Screenshots attach to CI only (D20). `npm run verify` passes.
