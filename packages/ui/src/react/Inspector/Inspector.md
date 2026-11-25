# Inspector

`Inspector` is a panel for editing the selected workflow node. The host floats it at `page-gutter` from the inline end of the canvas, aligned at the top with the Palette. It does not position itself.

Import `Inspector`, `InspectorProps`, `InspectorField`, and `InspectorAction` from `@tensquads/ui/react`. Set `title`, `description`, and `fields`. Fields support text, select, switch, longtext, chips, and connections. Each field has a stable `id` and a host-provided `label`. Select, text, longtext, switch, and connections are controlled by the host. Select callbacks receive the next string; connections callbacks receive the selected target ids. Text and longtext accept an optional placeholder. Longtext fields can include labeled icon actions with `id`, `icon`, and `onPress`. Chips may provide `onAdd` and `onRemove`. With `onRemove`, each chip has its own remove button; the chip itself is not a button. Item ids must be unique.

Connections use a multiple Select as the keyboard path for connecting nodes. A node with branches has one connections field for each branch. The host offers only targets that can be connected: no self-connection, Start nodes, or connections from End nodes. The host maps changes to its edges. `onValueChange` receives every connected id in the order of `targets`; connected ids that are not in `targets` stay at the end.

Use `onDuplicate` and `onDelete` to show the corresponding head actions. `locale` selects the built-in labels in English or Arabic; it does not translate field labels. The default footer shows More when `onMore` is supplied and Evaluate when `onEvaluate` is supplied. It is hidden when neither callback is supplied. `footer` replaces that footer. Set `footer={null}` to hide it.

## Keyboard

Text and longtext use standard text editing, including IME composition. Tab moves between fields and actions. Select uses arrow keys and Enter to choose; connections keep the list open for multiple choices and Escape closes it. Switch toggles with Space. A remove button removes its chip; focus then goes to the next chip, the last chip, or the add button. Icon actions and footer buttons activate with Enter or Space. Focused icon actions show their tooltip.

Inspector is used without an OpenUI definition because it is interactive application chrome that edits host-owned workflow state (D30).
