# Field

Import `Field`, `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`, and their prop types from `@tensquads/ui/react`. These parts wrap UI SDK's field entry and preserve its root, label, control, description, and error slots, `render` props, state, and forwarded props. Place `Input` inside the field so UI SDK connects the label, description, and validation state to it. The default layout puts the label and control side by side.

The root accepts UI SDK field props such as `name`, `disabled`, and `invalid`. A `FieldLabel` names the control. `FieldDescription` supplies help text. By default, `FieldError` shows validation errors after a submit attempt, or immediately with `invalid`. For a custom error, pass `invalid` to `Field` and `match={true}` to `FieldError`. The `FieldControl` part is available for another native input control.

The default grid has a label column at inline start and a flexible control column. The label column is at least 60 pixels wide and grows to fit the label. Put the label first, then the control, description, and error. The description and visible error align below the control. In LTR the label is on the left. In RTL it is on the right.

```tsx
<div lang="en" dir="ltr">
  <Field name="email" invalid>
    <FieldLabel>Email</FieldLabel>
    <Input />
    <FieldDescription>Used for order updates.</FieldDescription>
    <FieldError match={true}>Enter an email address.</FieldError>
  </Field>
</div>

<div lang="ar" dir="rtl">
  <Field name="email" invalid>
    <FieldLabel>البريد الإلكتروني</FieldLabel>
    <Input />
    <FieldDescription>يُستخدم لإرسال تحديثات الطلب.</FieldDescription>
    <FieldError match={true}>أدخل عنوان بريد إلكتروني.</FieldError>
  </Field>
</div>
```

To stack the label above its control, pass an app class such as `className="profile-field"` to `Field`. Set one grid column in the app stylesheet outside the library layer. To put multiple fields in one row, wrap them in a flex container with wrapping and a token gap. Each Field keeps its own label and control layout.

```css
.profile-field[data-slot="field"] {
  grid-template-columns: minmax(0, 1fr);
}

.profile-field > :is([data-slot="field-description"], [data-slot="field-error"]) {
  grid-column: 1;
}

.profile-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ts-space-4);
}
```

The OpenUI definition produces a complete text field from `label`, `name`, optional `placeholder`, `value`, `description`, `error`, `disabled`, and `readOnly`. Inside [Form](../Form/Form.md), defaults and edits update OpenUI form state under `name`. Streaming and locked renderers disable edits. This definition does not accept event handlers or arbitrary React nodes.

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
