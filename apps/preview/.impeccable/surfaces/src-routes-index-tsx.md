---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: []
---

# Home page (`/`)

Mode: Persuade. Audience: developers and the coding agents they direct (PRODUCT.md). Action: copy the install line, then Get started or browse components. Proof: the real components rendering from a real OpenUI fixture. Constraints: D21 (no playground, no key), tokens only, en/ar RTL, light/dark.

## Direction contract

THESIS: One component set, hand-built or streamed by an agent. The first screen proves it by showing an OpenUI stream turning into live library components. It refuses the gallery default: a title over a list of links.

OWN-WORLD: Agent-UI as shipped: grey canvas, panel cards with 0.5px hairlines, white node cards with a 1px ring, near-black pill primary, soft 6–8% ink fills, radius 16/8/full. The one dark surface is the stream pane (near-black ground, JetBrains Mono, string literals in a squadmate tint). Squadmates are the only illustration. Inter / IBM Plex Sans Arabic.

STORY: The visitor learns what the library is in one line, sees an agent build a screen from it, sees the same screen in Arabic, copies the install line, and goes to Get started or Components.

FIRST VIEWPORT: Header: logo + "tensquads ui", pill nav (Home, Components, Get started), segmented pill toggles for English/العربية and Light/Dark/System at the inline end (no native selects). Hero row: 64px/600 headline in two lines at the start, 18px lead below; at the end, the install line in a panel with a Copy control, then Get started (primary) and Browse 11 components (soft). Below, a full-width panel ~520px tall: stream pane (~460px) at the start and the rendered screen at the end (Petra Squadmate running with a Checking badge, Field+Input, Switch, SegmentedControl, Send back/Approve plan buttons), plus a "Same stream in English / العربية" chip pair that flips the rendered pane's locale and direction.

FORM: Stream to screen, position 4 of 7 on the ordered list; seed:0ae283d52c205230.

SIGNATURE INTERACTION: On load the stream types line by line (about 2 s total) and each component appears in the rendered pane as its line completes. Reduced motion shows the final state at once. A Replay control restarts it. The locale chips re-run the stream from the matching `.fixture.ar.txt`.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Below the fold
1. Component index: a grid of all registry components, each card showing the component live in one state with its name, linking to `/components/$name`.
2. Two paths: short "Coding agents" and "Server agents" columns with one code sample each (import vs `streamOpenUIResponse`), linking to Get started.
3. The squad: a row of squadmates with names (localized), linking to the Squadmate page.
4. Footer: GitHub, llms.txt, licence notes for fonts.

## Unresolved
- None. Reference sketch: `.impeccable/mocks/decision/stream-to-screen.html`.
