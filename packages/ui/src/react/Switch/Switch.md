# Switch

Import `Switch` and `SwitchThumb` from `@tensquads/ui/react`. They wrap the UI SDK switch parts from `@ui-sdk/react/switch` and preserve their slots, render props, checked state, callbacks and forwarded props.

Use `defaultChecked` or controlled `checked` with `onCheckedChange(checked, details)`. Give the switch a visible external label or `aria-label`. `disabled`, `readOnly`, `required`, `name` and `value` follow the UI SDK API. Space toggles the switch; Enter does not.

The UI SDK implements switch semantics and keyboard handling. It does not use arrow navigation for a standalone switch. Track motion mirrors in RTL. Reduced-motion preferences disable the transition.

The OpenUI definition accepts `label`, initial `checked` state, `disabled`, and an optional `name` as its last positional prop. See [Form](../Form/Form.md) for naming and submission behavior. Streaming and locked renderers disable interaction. Arriving initial values update the checked state until the user interacts. The user's choice takes precedence over later initial values.
