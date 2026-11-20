# CommandPalette

Import `CommandPalette` and `useCommandPaletteShortcut` from `@tensquads/ui/react`. Provide flat groups, labels and an `onSelect` callback for each item. The palette filters labels and keywords, and closes after an item runs.

This component has no OpenUI definition because it is application chrome with callbacks, as set by D28.

The palette uses UI SDK `Dialog` and `Command` for focus management, dismissal, filtering and keyboard selection. Use `useCommandPaletteShortcut` to bind the platform search shortcut from an effect.
