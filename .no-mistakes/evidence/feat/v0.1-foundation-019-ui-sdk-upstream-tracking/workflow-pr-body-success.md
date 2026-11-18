UI SDK 0.1.0-beta.8 update.

## Release notes
### @ui-sdk/core
https://github.com/vercel-labs/ui/releases/tag/%40ui-sdk/core%400.1.0-beta.8

### Patch Changes

- 6d7fcf1: An agent's `setValue` or `clear` that takes a `data-agent-confirm` item out of a value now needs a person, as adding that item does. Before, dropping a marked selection went through without asking. A step that touches several marks, like replacing one marked option with another, shows `allow` every mark's text, joined by semicolons, instead of only the first.
- 87f4ece: An agent can't choose a combobox's empty-query suggestion that the open list doesn't show, like one a query hides, since its marks can't be read. A marked option that mounts a moment after the list opens is waited for, so its confirm is still asked.
- 90a50f2: An agent can remove one file from a file input by its name or its item's value, like `removeFile("a.pdf")`. A name that matches no file fails the step and lists the files, and the file input lists its files to agents by name.
- f8a1e01: An agent's `run` on a Command takes one command, by its value or label. A list or an object is refused, so it can't reach a command other than the one whose marks were read.
- 2aabc99: A File Input inside `data-agent-secret` no longer shows its file names to an agent, in `snapshot`, `query` or a step's errors.
- 005c6eb: The agent snapshot leaves out a closed Tooltip whose trigger is a listed component, since its text is already that component's label. In web components, a dialog or menu trigger around a `<ui-button>` binds the button inside it, so a press by its label reaches it.
- dd4c683: An element that animates out keeps an `inert` its owner writes during the exit, and gets back one it had before, so a closed panel kept mounted with `inert` stays out of the Tab order.
- b7a82a2: Async options take `minLength`: text shorter than it, trimmed, loads nothing, cancels a load in flight and clears the items, so a server search waits for a few characters.
- 43ee542: An Autocomplete's `onValueChange` details carry `item`, the chosen suggestion's `value` and `label`, when a suggestion is chosen, so two suggestions with the same label can be told apart. The new `AutocompleteValueChangeDetails` type describes them.
- 3ecb591: `checkPattern` passes a native range input as a slider and native radios as a radio group: the testing kit's keys now move them the way a browser does, right to left too.
- a93c6e6: Combobox's `autoHighlight` takes `"selected"`: opening the list highlights the selected item, so the arrow keys move on from it, and highlights nothing when none is selected. While typing, it highlights the first match, like `true`.
- cf6c86f: Agents can run a Command's command with the `run` action, by its label or value, as Enter would. With no command it runs the highlighted one, whose marks it reads first. A disabled command is refused, and so is one the query or page hides, since its `data-agent-confirm` isn't in the page to read.
- 02938b8: A form reset leaves a controlled control with no default value alone, instead of returning it to the value it mounted with.
- 4c25b93: Enter submits a form with no submit button from a Date Input or Time Input segment, or from the form's one text field beside them, like it does next to a native date input.
- 1685a50: After a press on a modal popup's backdrop closes it, Space or Enter on the trigger opens it again the first time. The press's own click is still kept from the page.
- 22db74d: File Input's `validate` gets a second argument, `{ accepted }`, with the files of the same choice, drop or paste accepted before this one, so it can catch a duplicate within one batch.
- 1db765a: Tab and Shift+Tab from inside an iframe that is the last or first control of a modal Dialog, or another focus-trapping popup, now wrap around the popup. Before, focus left the page, or moved to the page behind a dialog that traps focus without making the page inert.
- e07158c: A Dialog, or another popup that keeps focus inside, now wraps Tab around a first or last control inside an open shadow root, and focuses such a control first when it comes first.
- e6604c8: `createGridFocus` finds a cell by the row and column its part last rendered with, not the ones it had when it bound. A keyed cell that a sort or a filter moves to another row, keeping its element, is now reached there by the arrow keys in every adapter. A drag selection from `createCellRange` finds the cell under the pointer the same way.
- 01de054: `onHighlight` runs with `null` when the highlighted item leaves the list, like when it's filtered out or the items are replaced, so it matches what the list shows.
- 28f70b2: A Popover or Hover Card the pointer opened closes when another one opens on hover, unless the new one is inside it, so hover popups no longer pile up when a trigger sits between another trigger and its popup.
- 433b696: `createInputHistory` takes `getEntryKey`, so entries made again from the same messages, and a new message arriving mid-recall, keep the entry brought back in place instead of starting over.
- 47c82a0: A popup that isn't measured yet no longer counts as fitting inside its anchor, so it keeps the browser's own anchor placement when its options change.
- 22e84b7: A Combobox, Autocomplete or Command list with no label part is named the way its input is (its `aria-label`, its own `aria-labelledby` or a `<label>`), not by the text typed in the input.
- 08027a8: PageDown and PageUp stop at the ends of a Combobox, Autocomplete or Command list instead of wrapping around.
- fafaeef: A Select or Combobox `maxLabels` text with the default "N more" joins its labels in English, so a page in another language no longer shows "Apple, Banana y 2 more".
- 5724068: A nested dialog or popup shown in the same commit as the one around it, like two nested dialogs mounted open or shown again by `<Activity>`, now opens above it and nests under it, so one Escape closes only the nested one.
- b67d81d: A Number Input reads back long unit and currency names in every plural form, like Russian "50 километров", and values some locales write as a word alone, like Arabic "يومان" for 2 days, which now show their minus sign when negative. It reads its text with the decimals it shows, and `formatNumberRange` writes both ends whole when both are negative.
- 616434e: A controlled OTP Input keeps the caret where a character was deleted or typed mid-code. Before, it jumped to the end once the owner passed the value back.
- 7e2ebe9: Pagination takes `disabled`: every page and step then does what a step at its end does (`aria-disabled`, `data-disabled`, no `href`, presses ignored), and the root gets `data-disabled`. A controller still changes the page.
- 2651c03: A Collapsible or Accordion panel that mounts open finishes its keyframes in the frame before the first paint, instead of reading its animations while the framework commits, which forced style for everything the commit changed.
- a434feb: `parseDate`, and so a Date Picker and Date Input, reads dates typed with a month name in more locales: in the long date's order (Swedish "16 oktober 2026"), with combining marks (Thai, Hindi), and with names that hold a space, an apostrophe, a number or a prefix (Irish, Catalan, Vietnamese, Hebrew), and a weekday's words (Danish "fredag den"). A locale whose numeric dates go year, day, month reads "2026-05-01" in its own order, and a date typed with the short date's separator reads in the short date's order.
- 839b44f: A popup with room on neither side of an anchor at least its own size, like a context menu opened with Shift+F10 on an area that fills the viewport, now opens on screen inside the anchor instead of past the viewport's edge.
- f29cbc4: Popover, Dialog, Drawer, Select and Date Picker handle Escape on their content, before it bubbles, so an ancestor's keydown listener sees `defaultPrevented` instead of acting on the same Escape. A field inside the popup can still handle Escape first and keep it open.
- 07fc806: A popup leaves the text unselected in a field whose own popup is open, like a combobox's input in its sheet, so typing there goes on where it was.
- af0d846: A popup that opens with focus on a text field that already holds a value selects its text, the way Tab does, so typing replaces it.
- 48f0310: Popups placed against an anchor now sit on the device's pixel grid, so text inside them renders the same each time, even when the anchor sits between pixels.
- 33c3c52: A primitive is assignable to `Primitive` under `exactOptionalPropertyTypes`: its `options` metadata may be `undefined`.
- 583c445: Escape during a resizable drag puts the panels back where they started, with no `onLayoutCommit`.
- 2e33e6f: Scroll Area takes its first measurement in its resize observer's first call, once the frame has laid it out, instead of in a microtask that forced style and layout of the new content, and registers its frame variables ahead of time instead of as the root binds.
- c8bb0c5: A modal popup no longer writes `--scrollbar-width` on `<html>` when the page has no scrollbar gutter, as with overlay scrollbars or a page that doesn't scroll. Closing one no longer restyles the whole page a second time for a value that was `0px`. Read it as `var(--scrollbar-width, 0px)`.
- 13a1ae4: Segmented Control's indicator gets `data-activation-direction`, like Tabs' indicator: `"none"` on its first placement, so a transition can skip it, then which way the checked item moved.
- 0295516: A closed React or Vue Select shows its selected item's current label when that label changes, instead of the one it first learned.
- 7e5834f: The hidden field a Select, Combobox or Listbox renders for its form is now a `<textarea>`, so Enter in the form's one text field submits a form without a submit button, like it does next to a native `<select>`.
- a1acd16: Select, Combobox and Listbox with `multiple` infer an inline list of objects as a list of that object, not of the object or a list. A single select whose one value is an inline list now needs its type, like `Select<Item[]>`.
- 1d21bee: `createSelection` returns `setAnchor(key)`, which starts the next Shift range at `key` without changing the selection, for lists where arrow keys move focus without selecting. `null` clears the anchor.
- f9c6473: Shortcuts take `repeat: true` to keep running while the keys are held, like `j` moving down a list. Without it, a shortcut still runs once per press.
- 901e49d: Uncontrolled Tabs keep their `defaultValue` selected while that tab's server markup waits for its boundary to hydrate, instead of selecting the first tab beside it, so streaming no longer shows two selected tabs or a hydration warning.
- b013fba: `@ui-sdk/core/testing` exports `settle`, which waits for what a component schedules after a render or an event, like a tooltip's name or focus moving into a menu. Framework tests can now wait the way `mount`'s `view.settle()` does.
- a979579: A Select or Combobox value with `maxLabels` and `getMoreLabel` joins its labels in English until the trigger or input binds, then in the page's language, so the server's markup matches the first client render.
- fce61f5: In `web.css`, a File Input drop zone's trigger has the same space above it in Web Components as in the other frameworks.
- 7259be5: `web.css` control edges and focused edges reach 3:1 against the page in light and dark: `--ui-input` and `--ui-ring-border` are darker in light and lighter in dark.

### @ui-sdk/react
https://github.com/vercel-labs/ui/releases/tag/%40ui-sdk/react%400.1.0-beta.8

### Patch Changes

- 43ee542: An Autocomplete's `onValueChange` details carry `item`, the chosen suggestion's `value` and `label`, when a suggestion is chosen, so two suggestions with the same label can be told apart. The new `AutocompleteValueChangeDetails` type describes them.
- 192136c: A part's `render` prop takes any React element, like one held in a variable or passed through a prop, whose props React 19 types as `unknown`.
- 13a1ae4: Segmented Control's indicator gets `data-activation-direction`, like Tabs' indicator: `"none"` on its first placement, so a transition can skip it, then which way the checked item moved.
- 7e5834f: The hidden field a Select, Combobox or Listbox renders for its form is now a `<textarea>`, so Enter in the form's one text field submits a form without a submit button, like it does next to a native `<select>`.
- f9c6473: Shortcuts take `repeat: true` to keep running while the keys are held, like `j` moving down a list. Without it, a shortcut still runs once per press.
- Updated @ui-sdk/core to 0.1.0-beta.8

## Public entries
Added: none
Removed: none

Verify: success
