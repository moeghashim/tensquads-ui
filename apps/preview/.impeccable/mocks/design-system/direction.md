# tensquads design system

One documentation site connects the foundations of Agent-UI, the React component library, and the OpenUI entry points for agents. The design uses the shipped Signal mark, squadmate artwork, and theme tokens.

## Grid and rhythm

- Use one 1,216 px maximum-width shell. Header, page intro, footer, and main sections share its inline edges.
- At desktop, use 12 columns with 24 px gutters. The home introduction spans seven columns and the brand specimen spans five. Reference pages reserve two columns for the local index and ten for content.
- On smaller screens, use a 24 px outer gutter, reducing to 16 px at 720 px and below. Move the reference rail into a wrapping index above content. Keep two card columns down to 356 px and use one below that.
- Use Agent-UI’s 4 px spacing unit. Use 8–16 px within controls and specimens, 24–32 px between related groups, and 40–48 px between major sections. Logical properties carry the same rhythm into RTL.

## Type and surfaces

- Inter sets English, IBM Plex Sans Arabic sets Arabic, and JetBrains Mono sets code and literal token values. Home display is 42–80 px. Reference titles are 60 px desktop and 36 px on mobile. Section headings use 24 px or 32 px. Body and utilities use 18/29, 16/24, 14/20, and 12/18 px as appropriate.
- Keep surfaces neutral. Use hue for status and workflow roles. Use panel borders for structure and reserve a 16 px radius for specimens and gallery cards.
- Each component card has a 136 px preview and a 52 px label band. Centre the specimen on both axes. Every label starts on the same baseline in its row. Keep a small, explicit preview layout for each component. BarChart uses six bars and six short day labels in matching tracks. Its plot and axis fit inside the preview at desktop and mobile widths.

## Navigation and page structure

- Pair Signal with the name **Design system** in the masthead. Use the primary navigation specified in [task 002](../../../../../dev/milestones/v0.3-design-system/002-build-site.md). Place language and theme controls at the inline end. The mobile header uses a second row for navigation.
- Keep the home calls to action in the same column as the headline and lead. Put the install command, copy control, and getting-started link on the shared setup row directly below the masthead. The brand specimen has its own aligned grid area with a shared baseline for the squadmates.
- Present **Foundations** and **UI system** as peer sections. Give their headings, leads, and first links shared rows on desktop, including in Arabic. Foundations covers visual tokens and brand assets. The UI system links to the grouped React catalog at `/components` and to React and OpenUI setup. Detail pages live at `/components/<Name>`.
- Give each page a quiet **View as Markdown** and **llms.txt** pair. On home, put the links on the setup row. On reference pages, align them with the end of the intro. Both remain visible in the normal flow on mobile. Publish equivalent headings, copyable values, component links, and installation text in the Markdown twins. Link each twin from the `/llms.txt` index.
