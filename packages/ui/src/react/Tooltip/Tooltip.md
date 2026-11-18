# Tooltip

Import `Tooltip`, its parts, and their prop types from `@tensquads/ui/react`. It wraps the UI SDK Tooltip from `@ui-sdk/react/tooltip` and keeps its root, trigger, content, arrow, and shortcut parts, `data-slot` values, `render` props, placement, open and delay options, and forwarded props.

Use `Tooltip` with `TooltipTrigger` and `TooltipContent`. `TooltipArrow` and `TooltipShortcut` are optional. UI SDK opens the hint on hover and keyboard focus and closes it on Escape. By default, it describes a named trigger with `aria-describedby` and names an unnamed trigger with the tooltip text. Set `type="label"` or `type="description"` to override this choice. Keep an icon-only button's own `aria-label` when the tooltip provides extra help. For touch-only help buttons, set `toggleable`.

`TooltipContent` accepts `side` (`top`, `right`, `bottom`, or `left`) and `align` (`start`, `center`, or `end`). Side names refer to physical sides in every locale and direction. UI SDK flips and shifts placements to avoid viewport edges and mirrors `start` and `end` in RTL. The root accepts `open`, `defaultOpen`, `delay`, `closeDelay`, `disabled`, `toggleable`, `closeOnPress`, `type`, and shortcut props as documented by UI SDK.

The OpenUI definition accepts an accessible trigger `label`, short `hint`, and `side`. Fixtures render a named icon-only button with a tooltip because a tooltip has no meaningful standalone output without a trigger.
