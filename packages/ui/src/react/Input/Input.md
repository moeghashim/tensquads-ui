# Input

Import `Input` and `InputProps` from `@tensquads/ui/react`. Input wraps UI SDK's `Input` from `@ui-sdk/react/input`, preserving its native input, `data-slot`, `render`, value handling, and forwarded props. Use it in a `Field` or provide an `aria-label`.

`variant` is `soft` (default) or `outline`. The value API accepts `defaultValue`, or `value` with `onValueChange(value, details)`. Native input props include `disabled`, `readOnly`, and `placeholder`.

OpenUI accepts a required accessible `label`, `placeholder`, `value`, `variant`, `disabled`, and `readOnly`. OpenUI cannot pass event handlers or arbitrary React nodes.
