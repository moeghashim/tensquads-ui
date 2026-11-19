# Form

Import `Form` and `FormProps` from `@tensquads/ui/react`. Form composes a native form and the library FieldSet. It prevents page navigation on submit, forwards native form props, and calls `onSubmit` when enabled. `disabled` disables the field set and blocks submission. Name the form with `aria-label` or `aria-labelledby`. Compose its fields and submit button from the library.

The OpenUI definition accepts `name`, an array of `children`, `submitLabel`, `action: { type, params? }`, and optional `disabled`. Use a unique form name within each OpenUI block. Children are Field or Input elements with distinct names and optional Button actions. Field requires `name`; Input accepts `name` as its last positional prop and otherwise uses its accessible label. This contract covers text fields. Nesting forms is not supported.

The submit button and Enter in a text field use native form submission and emit one OpenUI action. The event includes the form name, action parameters, and current OpenUI form state. Defaults are registered and edits update that state. Field and Input controls are disabled during streaming and when the reply block is locked. Values remain visible when locked. A host veto leaves the form editable. Wire ChatReply to `useChat().act` as described in [Chat](../Chat/Chat.md) to append the user action pill and send the next turn.

OpenUI form state uses the upstream shape: `{ formName: { fieldName: { value, componentType } } }`. The action turn keeps this shape in `values`, alongside action parameters. Text fields keep edits when the same generated value is rendered again; a changed generated value replaces the field value.

Example OpenUI program: `root = Form("Project", [Field("Project name", "project", "", "Northstar")], "Save project", {type: "SaveProject"})`.
