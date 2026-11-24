# Review notes

- Home uses Signal and three squadmates in one specimen. The actions sit immediately below the copy, and the pinned install example, Get started, and plain-text formats share a setup row.
- The catalog groups 33 documented React components. The examples are static and illustrative. Node covers branching through its `branches` prop. MiniMap and WorkflowCard have upstream design specs and no component docs in the checkout used for the comps.
- Colour shows a paired light and dark specimen and all 265 colour tokens. Status and workflow roles have dedicated tables. Nine expandable primitive families keep the initial page easier to scan. On narrow screens the tables retain the copy control and both values. Usage text is available in the Markdown twin.
- The four HTML comps inline the generated Agent-UI token stylesheet and use the existing local fonts, logo, and mascot assets. Foundations outside of Colour point into the local upstream reference. Component details and Get started point to the existing Workers site. The component Markdown index links to the current library source docs. The Arabic navigation links to the English reference comps where an Arabic comp has not been created.
- The PNGs are full-page Chromium captures, with a 1,440 px desktop viewport and a 390 px mobile viewport. The board uses viewport crops. The mobile home and component captures include both themes.

## Open questions for implementation

- Should Foundations have its own landing page when more foundation pages ship, or land on Colour until then?
- Should Screens and Pages stay under Design reference on the home page, or have a dedicated examples section once they migrate?
- Should the unified site publish locale-specific Markdown at locale-specific paths, or carry locale through the same URLs as the HTML pages?

## Verification

Playwright checked all 16 combinations of comp, theme, and viewport. The pages loaded their fonts and assets and had no horizontal overflow at 390 px. Each catalog specimen was centred inside its 136 px frame and fit inside its bounds. Component captions aligned within each row. The filter, copy controls, and theme-preserving language link passed interaction checks. Axe reported zero WCAG A/AA violations across the same 16 combinations.
