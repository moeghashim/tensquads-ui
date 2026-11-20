# CommandPalette

Import `CommandPalette` and `useCommandPaletteShortcut` from `@tensquads/ui/react`. Provide flat groups, labels and an `onSelect` callback for each item. The palette filters labels and keywords, and closes after an item runs.

This component has no OpenUI definition because it is application chrome with callbacks, as set by D28.

Control visibility with `open` and `onOpenChange(nextOpen)`. Pass `groups` as `{ id, label, items }[]`, without nested groups. Each item requires `id`, `label` and `onSelect`. Item IDs must be unique across the palette. Optional item fields are `keywords` (a string array), `icon` (a React node) and `hint` (a string array rendered as key hints, such as `["⌘", "D"]`). Hints only display keys; they do not bind shortcuts.

Pass all six strings in `labels`: `title` names the dialog, `placeholder` names the search input and supplies its placeholder, `empty` supplies the no-results message, and `navigate`, `select` and `close` label the footer hints. `locale` defaults to `"en"`; use `"ar"` for right-to-left command layout. The host supplies localized labels and group and item text. `className` is added to the dialog content. The entry also exports `CommandPaletteProps`, `CommandPaletteGroup`, `CommandPaletteItem` and `CommandPaletteLabels`.

Search matches substrings in item labels and keywords, ignoring case and diacritics. Within each group, label prefixes rank first, followed by other label matches, then keyword-only matches. Groups rank by their highest item score and remain intact. Ties preserve the supplied order. An empty query preserves the supplied group and item order. Groups with no matches disappear. With no matching items, the palette shows `labels.empty`; otherwise, the empty message reserves no space. The query resets each time the palette opens.

A group reserves an icon column only when at least one of its supplied items has an icon. In that group, rows without icons keep the same label alignment. Groups without icons omit the column.

The palette uses UI SDK `Dialog` and `Command` for focus management, dismissal, filtering and keyboard selection. Arrow keys move the highlight and wrap at the ends. Enter runs the highlighted item's callback, then requests closure through `onOpenChange(false)`. Escape closes the palette even when the query is nonempty. Clicking the backdrop also closes it. Focus returns to the previously focused element.

Call `useCommandPaletteShortcut(() => setOpen(true))` in the host component to open the palette with `⌘K` on Apple platforms or `Ctrl+K` elsewhere. The hook attaches its listener in an effect and removes it on cleanup. It prevents the browser default for the shortcut and ignores events during IME composition.
