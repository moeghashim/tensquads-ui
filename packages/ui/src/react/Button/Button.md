# Button

Import `Button` and the `ButtonProps` type from `@tensquads/ui/react`. It wraps UI SDK's `Button` from `@ui-sdk/react/button` and keeps its native button behavior, `data-slot`, `render` prop, and forwarded props.

`variant` accepts `solid`, `soft`, `outline`, `ghost`, or `danger` (default `solid`). `size` accepts `sm`, `md`, or `lg` (default `md`). `pill` makes the corners fully rounded. `iconOnly` sizes an icon-only button and requires an `aria-label`. Pass icons as React children; this task does not port the Agent-UI icon set.

The danger variant uses `gray-0` text in light mode and maps its component text property to `gray-1000` in explicit and system dark modes. Both tokens resolve to white in their respective themes, matching the white text specified for `danger-solid`.

All other props follow the UI SDK Button API. It supports native button props, pending async actions, focusable disabled state, and rendering a link through `render`. Use a clear text label unless the button contains only an icon.

The OpenUI definition accepts a visible `label`, `variant`, `size`, `pill`, and `disabled`. It does not accept arbitrary icon nodes because OpenUI props are serializable.
