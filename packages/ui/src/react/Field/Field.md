# Field

Import `Field`, `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`, and their prop types from `@tensquads/ui/react`. These parts wrap UI SDK's field entry and preserve its root, label, control, description, and error slots, `render` props, state, and forwarded props. Place `Input` inside the field so UI SDK connects the label, description, and validation state to it.

The root accepts UI SDK field props such as `name`, `disabled`, and `invalid`. A `FieldLabel` names the control. `FieldDescription` supplies help text. `FieldError` appears while the field is invalid. The `FieldControl` part is available for another native input control.

The OpenUI definition produces a complete text field from `label`, `name`, optional `placeholder`, `value`, `description`, `error`, `disabled`, and `readOnly`. OpenUI cannot pass event handlers or arbitrary React nodes.
