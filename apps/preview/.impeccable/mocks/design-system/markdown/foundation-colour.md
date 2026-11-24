# Colour

Use semantic Agent-UI tokens for surfaces, text and state. Each role resolves to a value in light and dark.

## Light and dark

Neutral surfaces carry the interface. Colour identifies status and workflow categories.

## Core roles

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-canvas` | `#f3f3f3` | `#161616` | Page and canvas ground behind everything. Body copy `text` reads 12.6:1 on it. |
| `--ts-surface` | `#fff` | `#212121` | Node cards, dialogs, tooltips. `text` and `text-emphasis` read on it. |
| `--ts-surface-secondary` | `#f9f9f9` | `#181818` | Branch rows inside a node, quiet wells. |
| `--ts-surface-tertiary` | `#f3f3f3` | `#131313` | Deepest quiet ground. |
| `--ts-surface-elevated` | `#fff` | `#303030` | Menus, popovers, tooltips that float over a panel. |
| `--ts-panel` | `#fcfcfc` | `#1c1c1c` | Node palette and inspector panels. Light value is the source's; dark is derived (gray-150). |
| `--ts-panel-border` | `#ededed` | `#ffffff1f` | 0.5px hairline around `panel`. Dark is derived. |
| `--ts-text` | `#282828` | `#dcdcdc` | Body copy, input values, panel titles. On `canvas`, `surface`, `panel`. |
| `--ts-text-secondary` | `#5d5d5d` | `#afafaf` | Draft badge, muted labels. 6.3:1 on `canvas`. |
| `--ts-text-tertiary` | `#8f8f8f` | `#8f8f8f` | Section labels (Core, Tools), node type line ('Agent'), placeholders, branch labels. 3.3:1 on `surface` — decorative or ≥14px 500 only; never body copy. |
| `--ts-text-emphasis` | `#0d0d0d` | `#fff` | Node titles, palette items, field labels, icon glyphs on tints. |
| `--ts-text-inverse` | `#fff` | `#0d0d0d` | Text on `primary-solid`. |
| `--ts-text-disabled` | `#8f8f8f` | `#5d5d5d` | Disabled control labels. |
| `--ts-border-subtle` | `#0d0d0d0d` | `#ffffff0f` | Surface-on-surface separation. |
| `--ts-border` | `#0d0d0d1a` | `#ffffff1f` | Default hairline: menu separators, select border. |
| `--ts-border-strong` | `#0d0d0d26` | `#ffffff33` | Outline buttons, radio rings. |
| `--ts-ring` | `#0169cc` | `#0285ff` | Focus ring, 2px outside the control. 4.9:1 on `canvas` in light, 5.0:1 in dark. |
| `--ts-primary-solid` | `#181818` | `#f3f3f3` | Solid primary button (`Code`), checked switch track (light). |
| `--ts-primary-solid-hover` | `#303030` | `#ededed` | Hover of `primary-solid`. |
| `--ts-primary-solid-active` | `#414141` | `#dcdcdc` | Pressed `primary-solid`. |
| `--ts-primary-soft` | `#ededed` | `#303030` | Soft button and segmented-control track. |
| `--ts-primary-soft-hover` | `#dfdfdf` | `#393939` | Hover of `primary-soft`. |
| `--ts-primary-soft-active` | `#cdcdcd` | `#414141` | Pressed `primary-soft`. |
| `--ts-primary-outline-border` | `#0d0d0d29` | `#ffffff40` | Outline button and input border. |
| `--ts-primary-outline-hover` | `#0d0d0d05` | `#ffffff0a` | Hover fill of outline buttons. |
| `--ts-ghost-hover` | `#0d0d0d14` | `#ffffff1f` | Hover fill of ghost/icon buttons and palette rows. |
| `--ts-ghost-active` | `#0d0d0d1f` | `#ffffff29` | Pressed ghost/icon buttons. |
| `--ts-secondary-solid` | `#5d5d5d` | `#414141` | Secondary solid fill; white text. |
| `--ts-input-bg` | `#0d0d0d14` | `#ffffff1f` | Soft input and textarea fill (no border). |
| `--ts-input-border-focus` | `#0d0d0d33` | `#ffffff33` | 1px ring on a focused soft input. |
| `--ts-input-border-invalid` | `#e02e2a` | `#ba2623` | Invalid input ring. |
| `--ts-link` | `#0169cc` | `#339cff` | Inline links. |
| `--ts-link-hover` | `#013566` | `#0285ff` | Hovered links. |
| `--ts-switch-track` | `#dfdfdf` | `#414141` | Unchecked switch track. |
| `--ts-switch-track-checked` | `#181818` | `#0285ff` | Checked switch track. |
| `--ts-switch-thumb` | `#fff` | `#fff` | Switch thumb. |
| `--ts-segmented-track` | `#ededed` | `#0d0d0d` | Segmented control track (edit / preview). |
| `--ts-segmented-thumb` | `#fff` | `#303030` | Selected segment. |
| `--ts-tooltip-compact-bg` | `#303030` | `#afafaf` | Compact tooltip fill; `gray-0` text. |
| `--ts-backdrop` | `#0000004d` | `#00000080` | Modal backdrop. |

## Status colours

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-info-text` | `#0169cc` | `#66b5ff` | Info text on `canvas`/`surface`. |
| `--ts-info-surface` | `#0285ff0a` | `#0285ff21` | Info surface fill and border; `info-surface-text` on it. |
| `--ts-info-surface-text` | `#004f99` | `#339cff` | Text on `info-surface`. |
| `--ts-info-solid` | `#0285ff` | `#0285ff` | Info solid button; white text (3.9:1 — icon/large text only). |
| `--ts-warning-text` | `#923b0f` | `#e25507` | Warning text on `canvas`/`surface`. |
| `--ts-warning-surface` | `#fb6a2212` | `#fb6a2229` | Warning surface fill and border. |
| `--ts-warning-surface-text` | `#923b0f` | `#fb6a22` | Text on `warning-surface`. |
| `--ts-warning-solid` | `#e25507` | `#e25507` | Warning solid button; white text. |
| `--ts-caution-text` | `#916f00` | `#e0ac00` | Caution text on `canvas`/`surface`. |
| `--ts-caution-surface` | `#ffc30014` | `#ffc30026` | Caution surface fill and border. |
| `--ts-caution-surface-text` | `#6e5400` | `#ffc300` | Text on `caution-surface`. |
| `--ts-danger-text` | `#911e1b` | `#e02e2a` | Danger text on `canvas`/`surface`. |
| `--ts-danger-surface` | `#fa423e14` | `#fa423e29` | Danger surface fill and border. |
| `--ts-danger-surface-text` | `#ba2623` | `#fa423e` | Text on `danger-surface`. Source pair: 4.3:1 in dark — pair with an icon. |
| `--ts-danger-solid` | `#e02e2a` | `#e02e2a` | Danger solid button (delete); white text. |
| `--ts-danger-ring` | `#ff8583` | `#ff8583` | Focus ring on danger controls. |
| `--ts-success-text` | `#00692a` | `#04b84c` | Success text on `canvas`/`surface`. |
| `--ts-success-surface` | `#04b84c14` | `#04b84c26` | Success surface fill and border. |
| `--ts-success-surface-text` | `#008635` | `#04b84c` | Text on `success-surface`. Source pair: 3.9:1 in light — use at 14px/600 or larger, or with an icon. |
| `--ts-success-solid` | `#00a240` | `#008635` | Success solid; white text (3.5:1 — large text/icons only). |
| `--ts-discovery-text` | `#532d8d` | `#8046d9` | Discovery text on `canvas`/`surface`. |
| `--ts-discovery-surface` | `#924ff70f` | `#924ff726` | Discovery surface fill and border. |
| `--ts-discovery-surface-text` | `#6b3ab4` | `#be95fa` | Text on `discovery-surface`. |
| `--ts-discovery-solid` | `#924ff7` | `#924ff7` | Discovery solid; white text. |

## Workflow colours

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-node-surface` | `#fff` | `#303030` | Node card fill. `text-emphasis` title on it. |
| `--ts-node-ring` | `#cdcdcd` | `#ffffff29` | 1px outer ring of a node card (box-shadow, not border). |
| `--ts-node-ring-selected` | `#afafaf` | `#ffffff4c` | Ring of the selected node. |
| `--ts-node-ink` | `#0d0d0d` | `#fff` | Glyph colour inside every icon tile; ≥7:1 on all light tints. |
| `--ts-tint-agent` | `#e7efff` | `#00284d` | Icon tile behind Agent nodes (Core). Dark is derived from blue-900. |
| `--ts-tint-logic` | `#fee7c2` | `#4a2206` | Icon tile behind Classify, If/else, While, User approval. Dark derived from orange-900. |
| `--ts-tint-end` | `#def5ee` | `#003716` | Icon tile behind Start and End. Dark derived from green-900. |
| `--ts-tint-note` | `#dfdfdf` | `#414141` | Icon tile behind Note. Dark derived. |
| `--ts-tint-tool` | `#ffefa4` | `#4d3b00` | Icon tile behind File search, Guardrails, MCP. Dark derived from yellow-900. |
| `--ts-tint-data` | `#ece3ff` | `#2c184a` | Icon tile behind Transform, Set state. Dark derived from purple-900. |
| `--ts-tint-ink-dark` | `#0d0d0d` | `#fff` | Glyph on a tint in dark: gray-1000 is white there. Same token as `node-ink`; kept for clarity in previews. |
| `--ts-branch-bg` | `#f9f9f9` | `#181818` | Branch row (Store, Recipes, Else / Pass, Fail) inside a node. |
| `--ts-edge` | `#cdcdcd` | `#414141` | Connector stroke, 1.5px. Decorative contrast (1.4:1) as in the source; selection state is what carries meaning. |
| `--ts-edge-selected` | `#555555` | `#8f8f8f` | Selected connector. |
| `--ts-connection-line` | `#b1b1b7` | `#b1b1b7` | Line while dragging a new connection. |
| `--ts-handle` | `#fff` | `#303030` | 8px port dot fill; `edge` ring around it. |
| `--ts-toolbar-bg` | `#fffffff5` | `#303030f5` | Floating canvas toolbar fill (96% white). Dark derived. |
| `--ts-dot-grid` | `#91919a` | `#414141` | Canvas dot pattern (React Flow default in the source). |

## Gray

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-gray-0` | `#fff` | `#0d0d0d` | Absolute surface: node cards, switch thumb, toolbar. Flips to near-black in dark. |
| `--ts-gray-25` | `#fcfcfc` | `#101010` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-50` | `#f9f9f9` | `#131313` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-75` | `#f3f3f3` | `#161616` | Canvas ground (`canvas` aliases it). |
| `--ts-gray-100` | `#ededed` | `#181818` | Soft fills: header ground, segmented control track, soft buttons. |
| `--ts-gray-150` | `#dfdfdf` | `#1c1c1c` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-200` | `#cdcdcd` | `#212121` | Node ring, edge stroke, active soft fill. |
| `--ts-gray-250` | `#b9b9b9` | `#282828` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-300` | `#afafaf` | `#303030` | Selected node ring. |
| `--ts-gray-350` | `#9f9f9f` | `#393939` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-400` | `#8f8f8f` | `#414141` | Tertiary text and disabled text. |
| `--ts-gray-450` | `#767676` | `#4f4f4f` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-500` | `#5d5d5d` | `#5d5d5d` | Secondary text. |
| `--ts-gray-550` | `#4f4f4f` | `#767676` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-600` | `#414141` | `#8f8f8f` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-650` | `#393939` | `#9f9f9f` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-700` | `#303030` | `#afafaf` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-750` | `#282828` | `#b9b9b9` | Primary body text. |
| `--ts-gray-800` | `#212121` | `#cdcdcd` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-850` | `#1c1c1c` | `#dcdcdc` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-900` | `#181818` | `#ededed` | Solid primary fill: `Code` button, checked switch. |
| `--ts-gray-925` | `#161616` | `#f3f3f3` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-950` | `#131313` | `#f3f3f3` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-975` | `#101010` | `#f9f9f9` | Neutral scale step; inverts in dark. Prefer the semantic tokens below. |
| `--ts-gray-1000` | `#0d0d0d` | `#fff` | Emphasis text: node titles, palette labels, field labels. |

## Blue

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-blue-25` | `#f5faff` | `#f5faff` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-50` | `#e5f3ff` | `#e5f3ff` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-75` | `#cce6ff` | `#cce6ff` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-100` | `#99ceff` | `#99ceff` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-200` | `#66b5ff` | `#66b5ff` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-300` | `#339cff` | `#339cff` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-400` | `#0285ff` | `#0285ff` | Info / ring hue. Agent nodes tint from it. 400 is the base step. |
| `--ts-blue-500` | `#0169cc` | `#0169cc` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-600` | `#004f99` | `#004f99` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-700` | `#003f7a` | `#003f7a` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-800` | `#013566` | `#013566` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-900` | `#00284d` | `#00284d` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-950` | `#000e1a` | `#000e1a` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-1000` | `#000d19` | `#000d19` | Info / ring hue. Agent nodes tint from it. |
| `--ts-blue-a25` | `#0285ff0a` | `#0285ff0a` | blue-400 at 4% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-blue-a50` | `#0285ff21` | `#0285ff21` | blue-400 at 13% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-blue-a75` | `#0285ff40` | `#0285ff40` | blue-400 at 25% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-blue-a100` | `#0285ff66` | `#0285ff66` | blue-400 at 40% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-blue-a200` | `#0285ff99` | `#0285ff99` | blue-400 at 60% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-blue-a300` | `#0285ffcc` | `#0285ffcc` | blue-400 at 80% over any ground; surfaces and ghost hovers for this hue. |

## Green

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-green-25` | `#edfaf2` | `#edfaf2` | Success hue. Start and End nodes tint from it. |
| `--ts-green-50` | `#d9f4e4` | `#d9f4e4` | Success hue. Start and End nodes tint from it. |
| `--ts-green-75` | `#b8ebcc` | `#b8ebcc` | Success hue. Start and End nodes tint from it. |
| `--ts-green-100` | `#8cdfad` | `#8cdfad` | Success hue. Start and End nodes tint from it. |
| `--ts-green-200` | `#66d492` | `#66d492` | Success hue. Start and End nodes tint from it. |
| `--ts-green-300` | `#40c977` | `#40c977` | Success hue. Start and End nodes tint from it. |
| `--ts-green-400` | `#04b84c` | `#04b84c` | Success hue. Start and End nodes tint from it. 400 is the base step. |
| `--ts-green-500` | `#00a240` | `#00a240` | Success hue. Start and End nodes tint from it. |
| `--ts-green-600` | `#008635` | `#008635` | Success hue. Start and End nodes tint from it. |
| `--ts-green-700` | `#00692a` | `#00692a` | Success hue. Start and End nodes tint from it. |
| `--ts-green-800` | `#004f1f` | `#004f1f` | Success hue. Start and End nodes tint from it. |
| `--ts-green-900` | `#003716` | `#003716` | Success hue. Start and End nodes tint from it. |
| `--ts-green-950` | `#011c0b` | `#011c0b` | Success hue. Start and End nodes tint from it. |
| `--ts-green-1000` | `#001207` | `#001207` | Success hue. Start and End nodes tint from it. |
| `--ts-green-a25` | `#04b84c14` | `#04b84c14` | green-400 at 8% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-green-a50` | `#04b84c26` | `#04b84c26` | green-400 at 15% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-green-a75` | `#04b84c4a` | `#04b84c4a` | green-400 at 29% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-green-a100` | `#04b84c73` | `#04b84c73` | green-400 at 45% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-green-a200` | `#04b84c99` | `#04b84c99` | green-400 at 60% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-green-a300` | `#04b84cbf` | `#04b84cbf` | green-400 at 75% over any ground; surfaces and ghost hovers for this hue. |

## Red

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-red-25` | `#fff0f0` | `#fff0f0` | Danger hue; also the invalid input border. |
| `--ts-red-50` | `#ffd9d9` | `#ffd9d9` | Danger hue; also the invalid input border. |
| `--ts-red-75` | `#ffc6c5` | `#ffc6c5` | Danger hue; also the invalid input border. |
| `--ts-red-100` | `#ffa4a2` | `#ffa4a2` | Danger hue; also the invalid input border. |
| `--ts-red-200` | `#ff8583` | `#ff8583` | Danger hue; also the invalid input border. |
| `--ts-red-300` | `#ff6764` | `#ff6764` | Danger hue; also the invalid input border. |
| `--ts-red-400` | `#fa423e` | `#fa423e` | Danger hue; also the invalid input border. 400 is the base step. |
| `--ts-red-500` | `#e02e2a` | `#e02e2a` | Danger hue; also the invalid input border. |
| `--ts-red-600` | `#ba2623` | `#ba2623` | Danger hue; also the invalid input border. |
| `--ts-red-700` | `#911e1b` | `#911e1b` | Danger hue; also the invalid input border. |
| `--ts-red-800` | `#6e1615` | `#6e1615` | Danger hue; also the invalid input border. |
| `--ts-red-900` | `#4d100e` | `#4d100e` | Danger hue; also the invalid input border. |
| `--ts-red-950` | `#280b0a` | `#280b0a` | Danger hue; also the invalid input border. |
| `--ts-red-1000` | `#1f0909` | `#1f0909` | Danger hue; also the invalid input border. |
| `--ts-red-a25` | `#fa423e14` | `#fa423e14` | red-400 at 8% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-red-a50` | `#fa423e29` | `#fa423e29` | red-400 at 16% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-red-a75` | `#fa423e4c` | `#fa423e4c` | red-400 at 30% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-red-a100` | `#fa423e7a` | `#fa423e7a` | red-400 at 48% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-red-a200` | `#fa423ea3` | `#fa423ea3` | red-400 at 64% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-red-a300` | `#fa423ec9` | `#fa423ec9` | red-400 at 79% over any ground; surfaces and ghost hovers for this hue. |

## Orange

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-orange-25` | `#fff5f0` | `#fff5f0` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-50` | `#ffe7d9` | `#ffe7d9` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-75` | `#ffcfb4` | `#ffcfb4` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-100` | `#ffb790` | `#ffb790` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-200` | `#ff9e6c` | `#ff9e6c` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-300` | `#ff8549` | `#ff8549` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-400` | `#fb6a22` | `#fb6a22` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. 400 is the base step. |
| `--ts-orange-500` | `#e25507` | `#e25507` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-600` | `#b9480d` | `#b9480d` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-700` | `#923b0f` | `#923b0f` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-800` | `#6d2e0f` | `#6d2e0f` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-900` | `#4a2206` | `#4a2206` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-950` | `#281105` | `#281105` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-1000` | `#211107` | `#211107` | Warning hue. Logic nodes (Classify, If/else, While, User approval) tint from it. |
| `--ts-orange-a25` | `#fb6a2212` | `#fb6a2212` | orange-400 at 7% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-orange-a50` | `#fb6a2229` | `#fb6a2229` | orange-400 at 16% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-orange-a75` | `#fb6a2254` | `#fb6a2254` | orange-400 at 33% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-orange-a100` | `#fb6a227a` | `#fb6a227a` | orange-400 at 48% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-orange-a200` | `#fb6a22a6` | `#fb6a22a6` | orange-400 at 65% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-orange-a300` | `#fb6a22cf` | `#fb6a22cf` | orange-400 at 81% over any ground; surfaces and ghost hovers for this hue. |

## Yellow

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-yellow-25` | `#fffbed` | `#fffbed` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-50` | `#fff6d9` | `#fff6d9` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-75` | `#ffeeb8` | `#ffeeb8` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-100` | `#ffe48c` | `#ffe48c` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-200` | `#ffdb66` | `#ffdb66` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-300` | `#ffd240` | `#ffd240` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-400` | `#ffc300` | `#ffc300` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. 400 is the base step. |
| `--ts-yellow-500` | `#e0ac00` | `#e0ac00` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-600` | `#ba8e00` | `#ba8e00` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-700` | `#916f00` | `#916f00` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-800` | `#6e5400` | `#6e5400` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-900` | `#4d3b00` | `#4d3b00` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-950` | `#261d00` | `#261d00` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-1000` | `#1a1400` | `#1a1400` | Caution hue. Tool nodes (File search, Guardrails, MCP) tint from it. |
| `--ts-yellow-a25` | `#ffc30014` | `#ffc30014` | yellow-400 at 8% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-yellow-a50` | `#ffc30026` | `#ffc30026` | yellow-400 at 15% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-yellow-a75` | `#ffc30045` | `#ffc30045` | yellow-400 at 27% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-yellow-a100` | `#ffc30073` | `#ffc30073` | yellow-400 at 45% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-yellow-a200` | `#ffc30096` | `#ffc30096` | yellow-400 at 59% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-yellow-a300` | `#ffc300bd` | `#ffc300bd` | yellow-400 at 74% over any ground; surfaces and ghost hovers for this hue. |

## Purple

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-purple-25` | `#f9f5fe` | `#f9f5fe` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-50` | `#efe5fe` | `#efe5fe` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-75` | `#e0cefd` | `#e0cefd` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-100` | `#ceb0fb` | `#ceb0fb` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-200` | `#be95fa` | `#be95fa` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-300` | `#ad7bf9` | `#ad7bf9` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-400` | `#924ff7` | `#924ff7` | Discovery hue. Data nodes (Transform, Set state) tint from it. 400 is the base step. |
| `--ts-purple-500` | `#8046d9` | `#8046d9` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-600` | `#6b3ab4` | `#6b3ab4` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-700` | `#532d8d` | `#532d8d` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-800` | `#3f226a` | `#3f226a` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-900` | `#2c184a` | `#2c184a` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-950` | `#160c25` | `#160c25` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-1000` | `#100a19` | `#100a19` | Discovery hue. Data nodes (Transform, Set state) tint from it. |
| `--ts-purple-a25` | `#924ff70f` | `#924ff70f` | purple-400 at 6% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-purple-a50` | `#924ff726` | `#924ff726` | purple-400 at 15% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-purple-a75` | `#924ff747` | `#924ff747` | purple-400 at 28% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-purple-a100` | `#924ff773` | `#924ff773` | purple-400 at 45% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-purple-a200` | `#924ff799` | `#924ff799` | purple-400 at 60% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-purple-a300` | `#924ff7bf` | `#924ff7bf` | purple-400 at 75% over any ground; surfaces and ghost hovers for this hue. |

## Pink

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-pink-25` | `#fff4f9` | `#fff4f9` | Reserved accent; unused in the reference UI. |
| `--ts-pink-50` | `#ffe8f3` | `#ffe8f3` | Reserved accent; unused in the reference UI. |
| `--ts-pink-75` | `#ffd4e8` | `#ffd4e8` | Reserved accent; unused in the reference UI. |
| `--ts-pink-100` | `#ffbada` | `#ffbada` | Reserved accent; unused in the reference UI. |
| `--ts-pink-200` | `#ffa3ce` | `#ffa3ce` | Reserved accent; unused in the reference UI. |
| `--ts-pink-300` | `#ff8cc1` | `#ff8cc1` | Reserved accent; unused in the reference UI. |
| `--ts-pink-400` | `#ff66ad` | `#ff66ad` | Reserved accent; unused in the reference UI. 400 is the base step. |
| `--ts-pink-500` | `#e04c91` | `#e04c91` | Reserved accent; unused in the reference UI. |
| `--ts-pink-600` | `#ba437a` | `#ba437a` | Reserved accent; unused in the reference UI. |
| `--ts-pink-700` | `#963c67` | `#963c67` | Reserved accent; unused in the reference UI. |
| `--ts-pink-800` | `#6e2c4a` | `#6e2c4a` | Reserved accent; unused in the reference UI. |
| `--ts-pink-900` | `#4d1f34` | `#4d1f34` | Reserved accent; unused in the reference UI. |
| `--ts-pink-950` | `#29101c` | `#29101c` | Reserved accent; unused in the reference UI. |
| `--ts-pink-1000` | `#1a0a11` | `#1a0a11` | Reserved accent; unused in the reference UI. |
| `--ts-pink-a25` | `#ff66ad14` | `#ff66ad14` | pink-400 at 8% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-pink-a50` | `#ff66ad29` | `#ff66ad29` | pink-400 at 16% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-pink-a75` | `#ff66ad47` | `#ff66ad47` | pink-400 at 28% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-pink-a100` | `#ff66ad73` | `#ff66ad73` | pink-400 at 45% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-pink-a200` | `#ff66ad99` | `#ff66ad99` | pink-400 at 60% over any ground; surfaces and ghost hovers for this hue. |
| `--ts-pink-a300` | `#ff66adc2` | `#ff66adc2` | pink-400 at 76% over any ground; surfaces and ghost hovers for this hue. |

## Alpha

| CSS variable | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ts-alpha-01` | `#0d0d0d03` | `#ffffff03` | Ink at 1% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-02` | `#0d0d0d05` | `#ffffff05` | Ink at 2% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-04` | `#0d0d0d0a` | `#ffffff0a` | Ink at 4% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-05` | `#0d0d0d0d` | `#ffffff0d` | Ink at 5% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-06` | `#0d0d0d0f` | `#ffffff0f` | Ink at 6% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-08` | `#0d0d0d14` | `#ffffff14` | Ink at 8% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-10` | `#0d0d0d1a` | `#ffffff1a` | Ink at 10% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-12` | `#0d0d0d1f` | `#ffffff1f` | Ink at 12% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-15` | `#0d0d0d26` | `#ffffff26` | Ink at 15% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-16` | `#0d0d0d29` | `#ffffff29` | Ink at 16% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-20` | `#0d0d0d33` | `#ffffff33` | Ink at 20% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-25` | `#0d0d0d40` | `#ffffff40` | Ink at 25% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-30` | `#0d0d0d4c` | `#ffffff4c` | Ink at 30% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-35` | `#0d0d0d59` | `#ffffff59` | Ink at 35% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-40` | `#0d0d0d66` | `#ffffff66` | Ink at 40% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-50` | `#0d0d0d80` | `#ffffff80` | Ink at 50% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-60` | `#0d0d0d99` | `#ffffff99` | Ink at 60% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
| `--ts-alpha-70` | `#0d0d0db2` | `#ffffffb2` | Ink at 70% over any ground (near-black in light, white in dark). Borders, soft fills, hovers. |
