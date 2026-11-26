# DESIGN.md: how a tensquads screen looks

Read this before you build a screen. It tells you how a tensquads screen is put together. The component API is in `llms.txt`, in `packages/ui/src/react/*/X.md` and in `.agents/skills/tensquads-ui/SKILL.md`.

This guide is written from what is built. The sources are:

- Tokens: `design/tokens.json`, compiled to `packages/ui/src/tokens/tokens.css`. Every token name starts with `--ts-`.
- Reference screens: `design/screens/*.dc.html`. Screens other than Main, Home, Onboarding and SignIn load [Main.dc.html](/design/screens/Main.dc.html) with a start view.
- The built site: `apps/preview/src/routes/*.tsx`, `apps/preview/src/styles.css` and `apps/preview/src/styles/*.css`. Live at https://tensquads-ui-preview.mohanadgh.workers.dev.
- Library styles: `packages/ui/src/styles/*.css`.

Every value here is a `--ts-*` token, or a measured value with the file it came from. Measured values are marked "measured". If a token covers a value, use the token. Never copy the measured pixel number into your code when a token exists.

Add `locale=ar` to a live page's query string to see Arabic.

---

## 1. Start here

Do these five steps in order.

1. **Install and import the styles in this order.** Run `npm install github:moeghashim/tensquads-ui#<commit-sha>`. Set `lang`, `dir` and, if you want, `data-theme` on `<html>`.

   ```css
   @layer ui-sdk, tensquads;
   @import "@tensquads/ui/fonts.css";
   @import "@tensquads/ui/tokens.css";
   @import "@tensquads/ui/styles.css";
   ```

   Source: `.agents/skills/tensquads-ui/SKILL.md`. Arabic pages use `lang="ar" dir="rtl"`. Without `data-theme`, the page follows the system theme.

2. **Pick the closest page layout and its reference screen.** Use the table in section 4. Open the reference screen file and the live page side by side. Copy the page layout and its styles from `templates/` or the [Templates preview](https://tensquads-ui-preview.mohanadgh.workers.dev/templates).

3. **Build only from library components and `--ts-*` tokens.** Import components from `@tensquads/ui/react`. Write your own CSS only for page layout (grid, gaps, padding). Use tokens for every value in that CSS. Use logical properties (`margin-inline-start`, `padding-block`, `inset-inline-end`).

4. **Check both locales and both themes.** Look at the screen in English (LTR) and Arabic (RTL), light and dark, at 1440 px and 390 px wide. There must be no horizontal scroll at 390 px (PLAN.md D20).

5. **Compare with the reference screen.** Put your screen next to the reference screen and the live page. Check the shell, the page title, the card grid, the gaps and the colour. If your screen has more colour, more shadow or more borders than the reference, remove them.

---

## 2. Look and feel

tensquads is a quiet, neutral workspace. Grey surfaces carry the interface. Colour has a job or it is not there. Source: `design/agent-ui/README.md`, confirmed by the reference screens and the built site.

| Principle | Rule |
|---|---|
| Neutral surfaces carry the interface | Every surface is a grey: `--ts-canvas`, `--ts-panel`, `--ts-surface`, `--ts-surface-secondary`. Do not tint a surface with a hue. |
| Colour means status or family only | Use the status pairs (`--ts-success-*`, `--ts-danger-*`, `--ts-warning-*`, `--ts-caution-*`, `--ts-info-*`, `--ts-discovery-*`) for state. Use `--ts-tint-*` only for workflow node families. Nothing else gets a hue. |
| The primary is near-black, never blue | The one primary action uses `--ts-primary-solid` with `--ts-text-inverse`. Blue is only for links (`--ts-link`) and the focus ring (`--ts-ring`). |
| One primary action per surface | One solid button per card, dialog or page header. Other actions are `soft`, `outline` or `ghost`. |
| Layers by lightness, not by lines | The ground is `--ts-canvas`. The work area is a lighter `--ts-panel` with a hairline. Borders are thin ink alphas (`--ts-border-subtle`, `--ts-border`), never solid grey lines. |
| Shadows are rings and small lifts | Use `--ts-shadow-hairline` or a 0.5–1 px border for cards. Lift only things that float: menus, dialogs, the toolbar, the chat launcher. Nothing glows. |
| Round where you hold it | Cards and panels `--ts-radius-2xl`. Inputs, rows and tiles `--ts-radius-md` to `--ts-radius-lg`. Pills, badges and header buttons `--ts-radius-full`. |
| Numbers are the headline | Dashboards open with big tabular numbers in StatTiles. Colour the delta, never the value. |
| Squadmates are the only illustration | The agents are drawn as squadmates. Do not add other illustrations, stock art or emoji. |
| Never colour alone | Every status colour also has a word (a Badge label, a delta text). |

---

## 3. App shell

A signed-in tensquads screen has two columns on the `--ts-canvas` ground: the side navigation (Sidebar) and one content panel. There is no top bar inside the app. The page title lives in the content panel.

Reference: [Main.dc.html](/design/screens/Main.dc.html) (every workspace view). Live: [/dashboards/home](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/home), [/dashboards/admin](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/admin). Built CSS: `packages/ui/src/styles/sidebar.css`, `apps/preview/src/styles.css` (`.dashboard-*`).

Template: [App shell](https://tensquads-ui-preview.mohanadgh.workers.dev/templates/app-shell)

### Layout

| Part | Value | Source |
|---|---|---|
| Ground | `--ts-canvas` | `sidebar.css`, `styles.css` `.dashboard-window` |
| Side navigation width | 248 px (measured; the Sidebar component sets it) | `sidebar.css` `.ts-sidebar` |
| Side navigation padding | `--ts-space-3` | `sidebar.css` |
| Gap between navigation groups | `--ts-space-4` | `sidebar.css` |
| Content panel fill | `--ts-panel` | `styles.css` `.dashboard-panel` |
| Content panel corners | `--ts-radius-2xl` on the inline-start corners | `styles.css` `.dashboard-panel` |
| Content panel padding | `--ts-space-8` above 60rem, `--ts-space-4` at 60rem and below | `styles.css` |
| Content max width | None. The panel fills the space beside the navigation. The dashboard demo and template frames fill the shared site wrapper. | `styles.css` |
| Mobile | Below 960 px the Sidebar becomes a 56 px bar (measured) with a menu button that opens a sheet. Below 47.5rem the content panel loses its corners. | `sidebar.css`, `styles.css` |

The Sidebar component does not use `--ts-side-nav-width` (210 px) or `--ts-side-nav-collapsed`. Use the Sidebar component; do not set its width.

### Side navigation (Sidebar)

From top to bottom:

1. **SidebarBrand**: a 36 px (measured) `--ts-primary-solid` square with `--ts-radius-lg`, the workspace name in `--ts-text-sm-font-size` weight 600, and a subtitle in `--ts-text-secondary`.
2. **SidebarSection** groups. Section label: `--ts-text-xs-font-size`, weight 500, `--ts-text-secondary`, `--ts-space-6` above.
3. **SidebarItem** rows: 40 px tall (measured, `sidebar.css`), `--ts-space-3` gap, padding `--ts-space-2` / `--ts-space-3`, `--ts-radius-lg`, 16 px icon, label `--ts-text-sm-font-size` in `--ts-text-secondary`. Hover: `--ts-ghost-hover` and `--ts-text-emphasis`. Current page (`aria-current="page"`): `--ts-alpha-08` fill and `--ts-text-emphasis`. Items that are not ready yet are `disabled` (`--ts-text-tertiary`).
4. **SidebarAgent** rows for the squad: a squadmate (40 px featured, 28 px others), name in `--ts-text-emphasis`, role beside it in `--ts-text-secondary`, and an 8 px status dot (`--ts-success-solid` online, `--ts-gray-300` offline).
5. **SidebarUser** at the bottom: 32 px initials avatar (`--ts-surface-secondary`, `--ts-radius-full`) after a `--ts-border-subtle` rule.

### Header

- **Inside the app** there is no header bar. The PageHeader is the first thing in the content panel.
- **Workflow builder**: a header row of `--ts-header-height` with the workflow name, its status badge and the actions. See section 4.6.
- **Public pages** (sign in, onboarding): a top row with the logo, 68 px tall (measured, [SignIn.dc.html](/design/screens/SignIn.dc.html), [Onboarding.dc.html](/design/screens/Onboarding.dc.html)), padding 20 px / 32 px (measured; `--ts-space-5` / `--ts-space-8`).

### Gutters

| Gutter | Token |
|---|---|
| Site page frame | `design-wrap` caps the width at 76rem with `--ts-space-6` inline gutters, reduced to `--ts-space-4` on narrow screens (`apps/preview/src/styles/design-system.css`). |
| Space around the shell in the reference screens | `--ts-page-gutter` (8 px, measured in [Main.dc.html](/design/screens/Main.dc.html)) |
| Content panel padding | `--ts-space-8` |
| Between page header and first row | `--ts-space-6` |
| Between rows and between cards | `--ts-space-4` |
| Inside a card | `--ts-space-5` |

The site header and footer share the page frame. The Nodes canvas fills the viewport width. Its header uses the shared gutters.

### Chat launcher

Every workspace page has a ChatLauncher at the bottom inline-end corner: a `--ts-primary-solid` pill with a squadmate and a count badge. It opens the chat with the lead agent. Reference: [Main.dc.html](/design/screens/Main.dc.html) ("CHAT DOCK"). Live: [/dashboards/home](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/home). Leave room for it: the home panel adds `--ts-control-md` + `--ts-space-6` of padding at the bottom (`styles.css` `.dashboard-panel--home`).

---

## 4. Page layouts

Each layout gives the grid, the component per region, the spacing and its links. Dashboard card grids collapse to one column at 60rem and below (`styles.css`).

### 4.1 Dashboard

Reference: [Main.dc.html](/design/screens/Main.dc.html) (Overview), [Accounts.dc.html](/design/screens/Accounts.dc.html). Live: [/dashboards/home](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/home), [/dashboards/admin](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/admin).
Template: [Dashboard](https://tensquads-ui-preview.mohanadgh.workers.dev/templates/dashboard)

```
| Sidebar | PageHeader (title, subtitle, meta badges)        |
|         | StatTile × up to 6  (ts-stat-grid)               |
|         | Card 3fr (BarChart)      | Card 2fr (list)       |
|         | Card full width (DataTable)                      |
```

| Region | Component | Spacing after it |
|---|---|---|
| Title row | `PageHeader` with `title`, `subtitle`, and badges in `meta` (for example `Demo data`, `4 of 5 squads online`) | `--ts-space-6` |
| Headline numbers | `StatTile` in a `div.ts-stat-grid`. The grid fits up to six columns and uses fewer when the viewport or container is narrow, or there are fewer tiles. See `packages/ui/src/react/StatTile/StatTile.md` for the responsive contract. | `--ts-space-4` |
| Trend and work queue | Two `Card`s in a 3:2 grid (`minmax(0, 3fr) minmax(0, 2fr)`, gap `--ts-space-4`). Left: `BarChart`. Right: `ApprovalCard` list or `Bars`. | `--ts-space-4` |
| Records | One full-width `Card` holding a `DataTable`, or an `EmptyState` when there are no rows | none |

Rules:

- Reading order is the hierarchy: headline numbers, then the trend, then the breakdowns, then the records (`design/agent-ui/components/Dashboard/README.md`).
- One question per Card. The subtitle names the metric and its window ("Daily revenue", "Last 14 days").
- Filters and the time range go in the PageHeader or the Card head, never in the card body.
- A 2:3 row (`minmax(0, 2fr) minmax(0, 3fr)`) is the other allowed split.

### 4.2 List and table

Reference: [Accounts.dc.html](/design/screens/Accounts.dc.html) (table), [Agents.dc.html](/design/screens/Agents.dc.html) (card grid). Live: [/dashboards/admin](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/admin) (table), [/workflows](https://tensquads-ui-preview.mohanadgh.workers.dev/workflows) (card grid).
Template: [List and table](https://tensquads-ui-preview.mohanadgh.workers.dev/templates/list)

```
| Sidebar | PageHeader                                         |
|         | (optional) StatTile row                            |
|         | Card: title + count | search Input + Button (head) |
|         |       DataTable (flush)                            |
```

| Region | Component | Spacing |
|---|---|---|
| Title row | `PageHeader` | `--ts-space-6` after |
| Table | One `Card` with a `title` and `count`. Its head holds the tools: a search `Input` (12rem, measured, `styles.css` `.dashboard-table-tools`) and at most one `Button`. Body: `DataTable`. | tools gap `--ts-space-1` |
| Empty | `EmptyState` inside the same Card | — |
| Card grid | `WorkflowCard` or squad cards in an auto-fit grid, gap `--ts-space-4` (built) | — |

DataTable rules (`design/agent-ui/components/DataTable/README.md`): newest first; at most six columns; numbers right-aligned in tabular numerals; status as a `Badge` with a word; no zebra stripes; no vertical rules.

### 4.3 Detail

Reference: [AgentDetail.dc.html](/design/screens/AgentDetail.dc.html), [AgentImages.dc.html](/design/screens/AgentImages.dc.html). Live: [/dashboards/admin?view=images](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/admin?view=images) (list with a selected item).
Template: [App shell for detail pages](https://tensquads-ui-preview.mohanadgh.workers.dev/templates/app-shell#detail-pages)

```
| Sidebar | back link                                         |
|         | PageHeader with Squadmate                         |
|         | Card full width: summary + progress               |
|         | 4 small stats                                     |
|         | Card (main)              | Card (side)            |
|         | Card full width (history)                         |
```

| Region | Component | Spacing |
|---|---|---|
| Back link and title | A ghost `Button` back link, then `PageHeader`. On an agent detail, a `Squadmate` sits before the title. | `--ts-space-6` after |
| Summary | One full-width `Card` | `--ts-space-4` (built) |
| Key numbers | `StatTile` row in `ts-stat-grid` | `--ts-space-4` |
| Main and side | Two Cards, 3:2 (`dashboard-grid--3-2`). The side column is a stack of Cards with gap `--ts-space-4` (`styles.css` `.dashboard-stack`). | `--ts-space-4` |
| Facts | A `dl` grid: labels `--ts-text-secondary`, values `--ts-text-emphasis`, identifiers in `--ts-font-mono` (`styles.css` `.dashboard-details`) | — |
| Actions | One solid `Button` and one `soft` Button, gap `--ts-space-2`, `--ts-space-4` above (`styles.css` `.dashboard-actions`) | — |

### 4.4 Settings and forms

Reference: [Rules.dc.html](/design/screens/Rules.dc.html) (in-app settings), [SignIn.dc.html](/design/screens/SignIn.dc.html) and [Onboarding.dc.html](/design/screens/Onboarding.dc.html) (public forms). See the live settings template below and the components at [/components/Form](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Form), [/components/Field](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Field), [/components/Switch](https://tensquads-ui-preview.mohanadgh.workers.dev/components/Switch).
Template: [Settings](https://tensquads-ui-preview.mohanadgh.workers.dev/templates/settings)

```
| Sidebar | PageHeader                                 |
|         | Card full width: list of rules             |
|         | Card (new rule form)  | Card (limits)      |
```

| Region | Component | Spacing |
|---|---|---|
| Title row | `PageHeader` | `--ts-space-6` after |
| Existing items | One Card with one row per item and a `Switch` or `Menu` per row | `--ts-space-4` |
| Edit form | A Card holding `Form` with `Field` rows: `Input`, `Switch`, `SegmentedControl` | `--ts-space-4` between cards |
| Save | One solid `Button` at the end of the form. Destructive actions use the `danger` variant and sit last. | — |

Public forms (sign in, sign up) are not in the app shell. They use a single Card, 420 px wide (measured, [SignIn.dc.html](/design/screens/SignIn.dc.html)), centred under the logo row, padding 28 px / 32 px (measured). The Onboarding screen puts copy on the inline-start side and the form Card on the inline-end side ([Onboarding.dc.html](/design/screens/Onboarding.dc.html)).

Form rules (`design/agent-ui/components/Input/README.md`, `Inspector/README.md`): inputs are soft (`--ts-input-bg` fill, no border at rest); focus adds `--ts-input-border-focus`; invalid adds `--ts-input-border-invalid`. Do not put a visible border and a fill together.

### 4.5 Chat

Reference: [Chat.dc.html](/design/screens/Chat.dc.html). Live: [/chat](https://tensquads-ui-preview.mohanadgh.workers.dev/chat).
Template: [Chat](https://tensquads-ui-preview.mohanadgh.workers.dev/templates/chat)

```
| Sidebar | Chat surface (8fr)                   | Side panel (4fr)  |
|         |  header: Squadmate + name + action   |  hand-offs/guide  |
|         |  ChatLog                             |                   |
|         |  suggestions + ChatComposer          |                   |
```

| Region | Component | Spacing |
|---|---|---|
| Surface | `Chat`, `--ts-surface` fill, `--ts-radius-3xl`, `--ts-border-subtle` border, `--ts-shadow-100` (`chat-demo.css`) | grid gap `--ts-space-8` to the side panel |
| Header | `Squadmate` (36 px) with the agent name and role; one `soft` pill `Button` (`sm`) | padding-inline `--ts-space-5` |
| Log | `ChatLog`, padding `--ts-space-6`, gap `--ts-space-4` between turns | — |
| User turn | `ChatUserMessage`: `--ts-primary-solid` fill, `--ts-text-inverse`, max `min(85%, 36rem)` (measured, `chat.css`) | — |
| Agent turn | A 32 px `Squadmate`, then `ChatStep` rows and `ChatReply`. No bubble for the agent. | gap `--ts-space-3` |
| Working | `ChatWorking` with a 24 px squadmate in `planning` | — |
| Composer | Suggestion `Button`s (soft, pill, gap `--ts-space-2`), then `ChatComposer` | padding `--ts-space-3` / `--ts-space-6` / `--ts-space-5` |
| Side panel | Hand-offs or a guide list (4fr) | — |

The library log and composer cap at 48rem (measured, `chat.css`). At 56.25rem and below the side panel moves under the chat (measured, `chat-demo.css`).

### 4.6 Builder

Reference: the builder spec in `design/agent-ui/README.md` ("Layout of the builder") and `design/agent-ui/components/{Canvas,Palette,Inspector,Toolbar,MiniMap}/README.md`. There is no `.dc.html` builder screen. Live: [/nodes](https://tensquads-ui-preview.mohanadgh.workers.dev/nodes).
Template: [Workflow builder demo](https://tensquads-ui-preview.mohanadgh.workers.dev/nodes)

```
| header: back · workflow name · status badge ·          actions |
| Palette |              Canvas (dot grid)            | Inspector |
|         |                                           |           |
|         |              Toolbar (bottom centre)      |           |
```

| Region | Component | Value |
|---|---|---|
| Header | Workflow name (`--ts-panel-title-font-weight`), status `Badge`, actions | minimum height `--ts-header-height`, shared site page frame (see Gutters above), `--ts-border-subtle` rule under it (`nodes-builder.css`) |
| Canvas | `Canvas` with `Node` and `BranchNode` | fills the rest; ground `--ts-canvas`, grid `--ts-dot-grid` |
| Palette | `Palette` in a floating panel | width `--ts-palette-width` + `--ts-space-4`; inline-start offset `--ts-page-gutter`; top offset `--ts-space-5`; `--ts-panel`, `--ts-radius-2xl`, `--ts-shadow-overlay` |
| Inspector | `Inspector` | width `--ts-inspector-width`; offset `--ts-space-5` from the inline-end and top |
| Toolbar | `Toolbar` | bottom centre, 56 px minimum height (measured, `toolbar.css`), `--ts-toolbar-bg`, `--ts-shadow-toolbar` |
| MiniMap | `MiniMap` | bottom inline-end by default; the demo uses inline-start (`nodes/builder.tsx`). The map appears only when the graph is larger than the view. |
| Commands | `CommandPalette` on `⌘K` | — |

Panels float over the canvas. They never push it. At 71rem and below the inspector becomes a sheet (measured, `nodes-builder.css`).

---

## 5. Type, spacing, colour, radius, shadow, motion

### Type

One family: `--ts-font-sans` (Inter, then IBM Plex Sans Arabic for Arabic). Code and identifiers: `--ts-font-mono`. Each type style has five tokens: `-font-family`, `-font-size`, `-line-height`, `-font-weight`, `-letter-spacing`. Use all five together. In this guide, a name that ends in `-*` (for example `--ts-text-sm-*`) means that set of five, or that colour family.

| Use | Token style | Size / weight |
|---|---|---|
| Page title (PageHeader) | `--ts-page-title-*` | 36/40, 590 |
| Marketing or site hero only | `--ts-heading-2xl-*` to `--ts-heading-5xl-*` | 36–72, 600 |
| Section heading in a page | `--ts-heading-xs-*` or `--ts-panel-title-*` | 16/24, 600 |
| Card title | `--ts-text-sm-font-size`, weight 600 (`card.css`) | 14/20 |
| Card subtitle, legends, footers | `--ts-text-xs-*` in `--ts-text-secondary` | 12/18 |
| Body and page subtitle | `--ts-text-md-*` | 16/24 |
| Dense UI (nav items, table cells, facts) | `--ts-text-sm-*` | 14/20 |
| Stat value | `--ts-heading-xl-font-size`, weight 600, tabular numerals (`stat-tile.css`) | 32 |
| Buttons | `--ts-button-sm-*`, `--ts-button-md-*`, `--ts-button-lg-*` | 500 |
| Badges | `--ts-badge-*` | 12, 600 |
| Form labels and values | `--ts-field-label-*`, `--ts-field-value-*`, `--ts-input-text-*` | — |
| Builder chrome | `--ts-node-title-*`, `--ts-node-meta-*`, `--ts-palette-item-*`, `--ts-palette-section-*`, `--ts-branch-label-*`, `--ts-panel-description-*` | — |
| Code | `--ts-code-*` | — |

Rules: nothing in the app is smaller than `--ts-text-2xs-font-size` (10 px). Numbers that line up (stats, tables, counts) use `font-variant-numeric: tabular-nums`. Keep prose under 75ch (built: `design-system.css` `.reference-prose`); page leads under 58ch (`chat-demo.css`).

### Spacing

The grid is 4 px (`--ts-space-1`).

| Where | Token |
|---|---|
| Icon to label, tight inline groups | `--ts-space-1` |
| Buttons in a row, badges in a meta row | `--ts-space-2` |
| Items in a list, nav item gap, card head to body (inset) | `--ts-space-3` |
| Between cards and rows on a page | `--ts-space-4` |
| Card padding | `--ts-space-5` |
| Page header to first row; chat log padding | `--ts-space-6` |
| Content panel padding; chat-to-side-panel gap | `--ts-space-8` |
| Top of a site page | `--ts-space-12` |
| Builder panel inset | `--ts-page-gutter` and `--ts-space-5` |
| Fixed control heights | `--ts-control-3xs` (22) to `--ts-control-3xl` (48). Buttons: `--ts-control-sm`, `--ts-control-md`, `--ts-control-lg`. |
| Icons | `--ts-icon-xs` (14) to `--ts-icon-2xl` (24). 16 px in buttons and nav. |
| Fixed panel widths | `--ts-palette-width`, `--ts-inspector-width`, `--ts-content-width` (MiniMap specimen maximum), `--ts-header-height` |

### Colour

| Use | Token |
|---|---|
| Page ground, side navigation | `--ts-canvas` |
| Content panel, Card, StatTile | `--ts-panel` with `--ts-panel-border` |
| Chat surface, composer, raised controls | `--ts-surface` |
| Inset areas (ApprovalCard, avatars, code) | `--ts-surface-secondary` |
| Menus, command palette, dialogs | `--ts-surface-elevated` |
| Body text | `--ts-text` |
| Titles, names, values | `--ts-text-emphasis` |
| Subtitles, meta, secondary labels | `--ts-text-secondary` |
| Placeholders, section labels, ticks | `--ts-text-tertiary` |
| Text on a solid fill | `--ts-text-inverse` |
| Disabled | `--ts-text-disabled` |
| Hairlines: subtle, default, strong | `--ts-border-subtle`, `--ts-border`, `--ts-border-strong` |
| Primary action | `--ts-primary-solid` (hover `--ts-primary-solid-hover`) |
| Secondary action | `--ts-primary-soft` (hover `--ts-primary-soft-hover`) |
| Ghost hover and press | `--ts-ghost-hover`, `--ts-ghost-active` |
| Links | `--ts-link`, `--ts-link-hover` |
| Focus ring | `--ts-ring`, 2 px outline, 2 px offset |
| Status badge or note | `--ts-success-surface` with `--ts-success-surface-text`; the same pair for `danger`, `warning`, `caution`, `info` and `discovery` |
| Status text on a page (deltas) | `--ts-success-text`, `--ts-danger-text` |
| Status dot or icon | `--ts-success-solid`, `--ts-danger-solid`, `--ts-warning-solid`, `--ts-info-solid` |
| Destructive button | `--ts-danger-solid` |
| Workflow node families only | `--ts-tint-agent`, `--ts-tint-logic`, `--ts-tint-end`, `--ts-tint-note`, `--ts-tint-tool`, `--ts-tint-data` |
| Chart series | greys (`--ts-gray-*`); pass and fail only in `--ts-green-500` and `--ts-red-500` (`BarChart/README.md`) |
| Modal backdrop | `--ts-backdrop` |

Do not use the raw scales (`--ts-blue-*`, `--ts-gray-*`, `--ts-pink-*` and so on) for UI. The library uses them inside components. `--ts-pink-*` is unused; keep it unused.

### Radius

| Use | Token |
|---|---|
| Cards, panels, StatTiles, nodes, content panel | `--ts-radius-2xl` |
| Chat surface | `--ts-radius-3xl` |
| Inset cards | `--ts-radius-xl` |
| Buttons (not in a header), nav items, brand tile | `--ts-radius-lg` |
| Inputs, table rows, menus, tooltips | `--ts-radius-md` |
| Textareas | `--ts-radius-sm` |
| Keyboard hints | `--ts-radius-xs` |
| Badges, pills, chips, switches, avatars, header buttons, toolbar | `--ts-radius-full` |

### Shadow

| Use | Token |
|---|---|
| Cards, panels, tiles | none. Use `--ts-panel-border` or `--ts-shadow-hairline`. |
| Segmented thumb, chat surface | `--ts-shadow-100` |
| Hover lift on a clickable card (WorkflowCard), chat launcher | `--ts-shadow-300` |
| Command palette | `--ts-shadow-400` |
| Menus, tooltips, floating builder panels | `--ts-shadow-overlay` with `--ts-shadow-hairline` |
| Floating toolbar | `--ts-shadow-toolbar` |
| Nodes | `--ts-shadow-node`, selected `--ts-shadow-node-selected` |
| Switch thumb, ports | `--ts-shadow-switch-thumb`, `--ts-shadow-handle` |

### Motion

| Use | Duration | Easing |
|---|---|---|
| Colour and fill changes (hover, press) | `--ts-duration-basic` | `--ts-ease-basic` |
| Panels, menus, dialogs coming in | `--ts-duration-enter` | `--ts-ease-enter` |
| Panels, menus, dialogs going out | `--ts-duration-exit` | `--ts-ease-exit` or `--ts-ease-exit-snappy` |
| Thumbs, switches, moving nodes | `--ts-duration-basic` | `--ts-ease-move` |
| Squadmates | See section 6 | — |

Stop all motion under `prefers-reduced-motion: reduce`.

---

## 6. Squadmates

Squadmates are the drawn agents. Petra (`petra`) is the lead. Each squad role has one character, for example Pisa (orders), Kyoto (support), Rio (marketing), Zurich (finance) and Giza (inventory). The full map is `AGENT_ROLE_TO_SLUG` in `@tensquads/ui/schemas`. Use the `Squadmate` component (`@tensquads/ui/squadmates` or `@tensquads/ui/react`). Do not draw agents yourself and do not use avatars or emoji for them.

### Where they appear

| Place | Size (built) | Source |
|---|---|---|
| Side navigation, featured agent | 40 px | `Sidebar.tsx` |
| Side navigation, squad rows | 28 px | `Sidebar.tsx` |
| Chat header | 36 px | `routes/chat.tsx` |
| Chat agent turn | 32 px | `routes/chat.tsx` |
| Chat step rows | 28 px | `routes/chat.tsx` |
| Chat "working" row | 24 px | `routes/chat.tsx` |
| Chat launcher, ApprovalCard meta | small, inside the component | `ChatLauncher`, `ApprovalCard` |
| Agent detail header, before the title | 48 px (measured) | [AgentDetail.dc.html](/design/screens/AgentDetail.dc.html) |
| Large showcase (foundations pages) | 64 px (default) and larger | `Squadmate.md` |

Below 64 px the drawing crops to the head. At 64 px and above it shows the whole squadmate (`Squadmate.md`).

### States

A squadmate shows its agent loop state. Use the state that matches the agent. Labels (PLAN.md D18):

| State | English | Arabic |
|---|---|---|
| `waiting` | Waiting | بانتظارك |
| `planning` | Planning | تخطيط |
| `running` | Running | قيد العمل |
| `checking` | Checking | قيد التحقق |
| `done` | Done | تم |
| `sentback` | Sent back | إعادة للتعديل |
| `blocked` | Blocked | معلّق |
| `escalated` | Escalated | بانتظار قرارك |
| `dropped` | Dropped | أُلغي |
| `idle` | Idle | في استراحة |

The accessible name is the character name and the state, for example `Petra, Planning` and `بترا، تخطيط`. Pass `locale` so the name is right.

### Motion (D33)

- Motion is off by default. Set `animated` to turn it on.
- **One performer at a time.** In a list, animate only the active or focused squadmate. All others stay still.
- Energy follows the state. Calm states loop over 3–7 s. Busy states loop every 0.5–1.6 s. Only Escalated is loud. Done plays once on entry.
- At 24 px and below, only the face and the badge move.
- Under `prefers-reduced-motion`, nothing moves; the drawing and badge still show the state.
- The approved comp `apps/preview/.impeccable/mocks/mascot-motion/` is the spec. Live: [/foundations/mascots/motion](https://tensquads-ui-preview.mohanadgh.workers.dev/foundations/mascots/motion).

---

## 7. Copy

### Voice

- Plain, short and direct. Talk to the owner as "you". Name the agent who did the work ("Petra", "Kyoto").
- Sentence case for every title, label, button and badge: `Needs your approval`, `Squads and their missions`.
- No exclamation marks. No emoji. No trailing period on labels and buttons.
- Buttons are verbs or the object they open: `Approve`, `Decline`, `Roll out`, `View changelog`. Never "Click here".
- A Card subtitle says what the number means and its window: `Daily revenue`, `Last 14 days`.
- An empty state names what will fill it and the action that fills it, in one sentence.
- Identifiers keep their code form: `task-1042`, `response_schema`.

### Arabic

- Every string has an Arabic version. Write it as Arabic, not as a word-for-word translation.
- Use gender-neutral nouns for agent states (D18). Use the table in section 6. Do not use verbs that mark gender.
- Agent names have fixed Arabic spellings (for example بترا). Do not transliterate them yourself; take them from the roster (`Squadmate.md`).
- Keep identifiers, codes and keyboard hints in Latin script and isolate them (`unicode-bidi: isolate`).

### Numbers and dates

- Format numbers, money, percentages and dates with `Intl` for the locale. Do not build number strings by hand.
- Use `ar-EG-u-nu-arab` for Arabic-Indic digits and `en-US` for English. The dashboard demos and template use these locales for metrics and counts. BarChart formats Arabic chart values by default. StatTile and Card display the text supplied by the caller.
- Put units in the display string: `1.08 s`, `42.5 h`, `$19.22`.
- Show the comparison with a delta: `+12% vs last week`. Colour the delta (`--ts-success-text` or `--ts-danger-text`), not the value.

#### Arabic currency

Format SAR with `Intl.NumberFormat`. On the repository's Node version, `Intl.NumberFormat("ar", { style: "currency", currency: "SAR" })` uses Latin digits. Use the site's `ar-EG-u-nu-arab` locale to display 1250.5 as `١٬٢٥٠٫٥٠ ر.س.`. Pass the entire formatted string to the table cell and the StatTile value to preserve the currency spacing and direction marks.

```tsx
import { DataTable, StatTile } from "@tensquads/ui/react";

const sar = new Intl.NumberFormat("ar-EG-u-nu-arab", {
  style: "currency",
  currency: "SAR",
});

export function OrderAmounts({ amount, total }: { amount: number; total: number }) {
  return (
    <>
      <StatTile label="إجمالي الطلبات" value={sar.format(total)} />
      <DataTable
        caption="الطلبات"
        columns={[{ key: "amount", label: "المبلغ", align: "end" }]}
        rows={[{ id: "order-1", cells: { amount: sar.format(amount) } }]}
      />
    </>
  );
}
```

---

## 8. Right to left

- Use logical properties only: `margin-inline-start`, `padding-inline`, `inset-inline-end`, `border-start-start-radius`, `text-align: start`. Never `left` or `right`.
- Set `dir="rtl"` and `lang="ar"` on `<html>`. Components need no direction provider.

What mirrors:

| Mirrors | Example |
|---|---|
| The whole shell | Sidebar on the right, content on the left ([/dashboards/home?locale=ar](https://tensquads-ui-preview.mohanadgh.workers.dev/dashboards/home?locale=ar)) |
| Content panel corners | Rounded on the inline-start side |
| Grids and reading order | The 3:2 row puts the 3fr card on the right |
| Time axes and sparklines | Time runs right to left (`stat-tile.css` flips the sparkline) |
| Direction icons | Back arrows, chevrons, toolbar icons marked `data-mirror` |
| Workflow graphs | Flow runs right to left; inputs on the inline start (D30) |
| Chat | The user's message sits on the inline end |
| Floating corners | The chat launcher moves to the bottom left |

What does not mirror:

| Does not mirror | Why |
|---|---|
| Squadmate drawings | They are characters, not arrows |
| Node text, numbers, code | Text stays upright and reads in its own direction |
| Keyboard hints (`⌘K`) | Kept LTR and isolated (`nodes-builder.css` `kbd`) |
| Logos | Brand artwork |
| Play, check and other non-directional icons | No direction |

Arabic `kbd` hints use `--ts-font-sans`, because monospace fallbacks break Arabic letter joining (`nodes-builder.css`).

---

## 9. Don't

These mistakes make a screen look generic, not like tensquads.

| Don't | Do |
|---|---|
| Raw hex, rgb or pixel values that a token covers | Use the `--ts-*` token. The check fails on unknown `--ts-*` names. |
| Ad-hoc shadows on cards (`0 4px 12px ...`) | Cards have no shadow. Use the tokens in section 5. |
| A blue primary button | `--ts-primary-solid` (near-black) |
| Extra accent colours, gradients, coloured card headers | Grey surfaces. Hue only for status and node families. |
| A centred hero layout on an app screen | Start-aligned PageHeader, then the stat row and card grid |
| A top bar with a logo inside the app | Sidebar plus content panel |
| Emoji or decorative illustrations | Library icons and squadmates |
| Small uppercase labels above titles | The title and one subtitle line |
| Wide paragraphs across the full panel | Keep prose under 75ch |
| Custom buttons, inputs, cards or tables | `Button`, `Input`, `Card`, `DataTable` from the library |
| Two solid buttons in one card or header | One solid; the rest soft, outline or ghost |
| Charts coloured per category | Greys; status colours for pass and fail only |
| Colour as the only signal | A word next to every colour |
| Nested cards or two charts in one card | One question per card |
| `left`, `right`, `margin-left` | Logical properties |
| Squadmates all moving at once | One performer at a time |
| Exclamation marks, Title Case | Sentence case, calm voice |
