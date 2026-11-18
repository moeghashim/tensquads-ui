# Menu

Import `Menu`, its parts, and their prop types from `@tensquads/ui/react`. It wraps the UI SDK Menu from `@ui-sdk/react/menu`. The exported parts keep the SDK slots, `render` prop, forwarded props, and action callback shape.

Compose `Menu`, `MenuTrigger`, and `MenuContent`, then add `MenuItem` and `MenuSeparator` as needed. The default `MenuTrigger` renders our `Button`. Pass `render` to the trigger to use another element. `MenuContent` defaults to the SDK placement behavior; `side="bottom"` and `align="start"` keep its start edge aligned with the reading direction in RTL.

Each `MenuItem` accepts a serializable `value` and reports it through `Menu`'s `onAction(value, details)`. UI SDK handles Enter, Space, ArrowDown, arrow navigation, typeahead, Escape, outside press, focus return, and disabled-item focus. It also supports groups, shortcuts, icons, async actions, and submenus through the exported SDK parts. A disabled item stays focusable but cannot run.

The OpenUI definition accepts a trigger `label` and an `items` array of `{ label, value, danger, disabled }` entries. It allows up to six actions and one destructive item. OpenUI streams cannot serialize action functions. The OpenUI renderer dispatches a `tensquads:menu-action` `CustomEvent` on `document` with `{ value }` in `detail`. A client can listen for that event and run the matching local action. Hand-built React menus use the UI SDK `onAction(value, details)` callback instead.

Destructive actions render last, after a separator. Keep one or fewer destructive items. Menu styles use Agent-UI surface, border, shadow, radius, motion, and semantic danger tokens. Popup placement and collision handling come from UI SDK and follow page direction.
