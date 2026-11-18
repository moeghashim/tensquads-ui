# Switch

Import `Switch` and `SwitchThumb` from `@tensquads/ui/react`. They wrap the UI SDK switch parts from `@ui-sdk/react/switch` and preserve their slots, render props, checked state, callbacks and forwarded props.

Use `defaultChecked` or controlled `checked` with `onCheckedChange(checked, details)`. Give the switch a visible external label or `aria-label`. `disabled`, `readOnly`, `required`, `name` and `value` follow the UI SDK API. Space toggles the switch; Enter does not.

The UI SDK implements switch semantics and keyboard handling. It does not use arrow navigation for a standalone switch. Track motion mirrors in RTL. Reduced-motion preferences disable the transition.

The OpenUI definition accepts a label, initial checked state and disabled state.
