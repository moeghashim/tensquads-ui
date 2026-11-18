# Input

Import `Input` and `InputProps` from `@tensquads/ui/react`. Input wraps UI SDK's `Input` from `@ui-sdk/react/input`, preserving its native input, `data-slot`, `render`, value handling, and forwarded props. Use it in a `Field` or provide an `aria-label`.

`variant` is `soft` (default) or `outline`. The value API accepts `defaultValue`, or `value` with `onValueChange(value, details)`. Native input props include `disabled`, `readOnly`, and `placeholder`.

OpenUI accepts a required accessible `label`, `placeholder`, `value`, `variant`, `disabled`, and `readOnly`. OpenUI cannot pass event handlers or arbitrary React nodes.

`InputGroup` and `InputClear`, with `InputGroupProps` and `InputClearProps`, wrap the remaining public input parts. Put `Input` and a named `InputClear` inside `InputGroup`. The clear button appears when text can be cleared. Pressing it clears the value, reports `clear-press`, and focuses the input. All parts preserve SDK slots, `render`, class callbacks, and native props.

```tsx
<InputGroup>
  <Input aria-label="Website" defaultValue="example.com" />
  <InputClear aria-label="Clear website">Clear</InputClear>
</InputGroup>
```

OpenUI values update as the stream grows. The input remains editable after generation. Group compositions use React because OpenUI does not accept arbitrary child nodes.
