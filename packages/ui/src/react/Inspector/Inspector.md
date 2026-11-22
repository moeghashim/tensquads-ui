# Inspector

`Inspector` is a panel for editing the selected workflow node. The host floats it at `page-gutter` from the inline end of the canvas, aligned at the top with the Palette. It does not position itself.

Import `Inspector`, `InspectorProps`, `InspectorField`, and `InspectorAction` from `@tensquads/ui/react`. Set `title`, `description`, and `fields`. This piece supports text, switch, and longtext fields. Each field has a stable `id`, a host-provided `label`, a controlled value, and a callback. The callback receives only the next string or boolean value. Text and longtext fields accept an optional placeholder. Longtext fields can include labeled icon actions with `id`, `icon`, and `onPress`.

Use `onDuplicate` and `onDelete` to show the corresponding head actions. `locale` selects the built-in labels in English or Arabic; it does not translate field labels. The default footer shows More and Evaluate when either callback is supplied. `footer` replaces that footer. Set `footer={null}` to hide it.

## Keyboard

Text and longtext use standard text editing, including IME composition. Tab moves between fields and actions. Switch toggles with Space. Icon actions and footer buttons activate with Enter or Space. Focused icon actions show their tooltip.

Inspector is used without an OpenUI definition because it is interactive application chrome that edits host-owned workflow state (D30).
