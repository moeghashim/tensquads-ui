# Field

Import `Field`, `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`, and their prop types from `@tensquads/ui/react`. These parts wrap UI SDK's field entry and preserve its root, label, control, description, and error slots, `render` props, state, and forwarded props. Place `Input` inside the field so UI SDK connects the label, description, and validation state to it.

The root accepts UI SDK field props such as `name`, `disabled`, and `invalid`. A `FieldLabel` names the control. `FieldDescription` supplies help text. By default, `FieldError` shows validation errors after a submit attempt, or immediately with `invalid`. For a custom error, pass `invalid` to `Field` and `match={true}` to `FieldError`. The `FieldControl` part is available for another native input control.

The OpenUI definition produces a complete text field from `label`, `name`, optional `placeholder`, `value`, `description`, `error`, `disabled`, and `readOnly`. This definition does not accept event handlers or arbitrary React nodes.

`FieldSet`, `FieldLegend`, and `FieldGroup`, with their prop types, wrap the remaining public field parts. Keep the legend first so it names the set. A description directly inside the set describes the group. Disabling the set disables its controls. Each part preserves SDK slots, `render`, class callbacks, and native props.

```tsx
<FieldSet>
  <FieldLegend>Address</FieldLegend>
  <FieldDescription>Used for delivery.</FieldDescription>
  <FieldGroup>
    <Field name="city">
      <FieldLabel>City</FieldLabel>
      <Input />
    </Field>
  </FieldGroup>
</FieldSet>
```

OpenUI values update as the stream grows. The field remains editable after generation. Use React for field-set compositions; this OpenUI definition exposes only a single text field.
