# Palette

`Palette` lists workflow node kinds in named sections. Press a row to ask the host to insert that kind. It does not position itself. A host can float it at `page-gutter` from the inline start of the canvas, aligned at the top with the Inspector.

Import `Palette`, `PaletteProps`, `PaletteSection`, `PaletteItem`, `PaletteInsertDetails`, and `DEFAULT_PALETTE_SECTIONS` from `@tensquads/ui/react`. Supply localized `label`, `sections`, and `onInsert`. The default sections contain Core, Tools, Logic, and Data in order for English and Arabic. Start is omitted.

`onInsert(kind, details)` reports the node kind and UI SDK `source`. A pointer press reports its pointer source; Enter or Space reports `keyboard`. `position` is reserved for insertion by a future Canvas drop interaction.

## Keyboard

The vertical Toolbar has one Tab stop. Up and Down move between rows; Home and End move to the first and last row. Enter and Space insert the focused kind. Focus does not wrap past the ends.

Palette is used without an OpenUI definition because it is interactive application chrome, not streamed content.
