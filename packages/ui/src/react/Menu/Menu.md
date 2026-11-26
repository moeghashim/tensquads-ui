# Menu

Import `Menu`, its parts, and their prop types from `@tensquads/ui/react`. It wraps the UI SDK Menu from `@ui-sdk/react/menu`. The exported parts keep the SDK slots, `render` prop, forwarded props, and action callback shape. `MenuTrigger` supports solid, soft, and ghost styles. Checkbox and radio items show their checked state.

Compose `Menu`, `MenuTrigger`, and `MenuContent`, then add `MenuItem` and `MenuSeparator` as needed. Use `defaultOpen` for an uncontrolled menu, or `open` with `onOpenChange(open, details)` for controlled state. `MenuTrigger` uses a solid `Button` by default. Set `variant="soft"` for a muted fill or `variant="ghost"` for a transparent fill at rest. Supply visible children or an accessible name. Pass `render` to supply a custom trigger with its own styles. `MenuContent` defaults to the SDK placement behavior; `side="bottom"` and `align="start"` keep its start edge aligned with the reading direction in RTL.

Each `MenuItem` accepts a serializable `value` and reports it through `Menu`'s `onAction(value, details)`. UI SDK handles Enter, Space, ArrowDown, arrow navigation, typeahead, Escape, outside press, focus return, and disabled-item focus. It also supports groups, shortcuts, icons, async actions, and submenus through the exported SDK parts. A disabled item stays focusable but cannot run.

Use `MenuCheckboxItem` for independent options and `MenuRadioGroup` with `MenuRadioItem` for a single choice. A `MenuItemIndicator` with no children draws the check or dot. Use `keepMounted` to show its empty outline while the item is unchecked. An indicator with custom children reserves space while unchecked.

```tsx
<Menu>
  <MenuTrigger variant="ghost">View options</MenuTrigger>
  <MenuContent>
    <MenuCheckboxItem value="guides" defaultChecked>
      <MenuItemIndicator keepMounted />
      Show guides
    </MenuCheckboxItem>
    <MenuRadioGroup defaultValue="compact" aria-label="Density">
      <MenuRadioItem value="compact">
        <MenuItemIndicator keepMounted />
        Compact
      </MenuRadioItem>
      <MenuRadioItem value="comfortable">
        <MenuItemIndicator keepMounted />
        Comfortable
      </MenuRadioItem>
    </MenuRadioGroup>
  </MenuContent>
</Menu>
```

The OpenUI definition accepts a non-empty trigger `label` and an `items` array with one to six actions. Each action requires non-empty `label` and `value` strings. The optional `danger` and `disabled` flags default to `false`. At most one action can be destructive. The renderer validates these limits before rendering; invalid props produce a Menu render error through `TensquadsRenderer`'s `onError` callback. OpenUI streams cannot serialize action functions. The OpenUI renderer dispatches a `tensquads:menu-action` `CustomEvent` on `document` with `{ value }` in `detail`. A client can listen for that event and run the matching local action. Hand-built React menus use the UI SDK `onAction(value, details)` callback instead.

OpenUI places the destructive action last, after a separator. For hand-built React menus, place a `MenuItem` with `destructive` last and add the separator yourself. Menu styles use Agent-UI surface, border, shadow, radius, motion, and danger color tokens. Popup placement and collision handling come from UI SDK and follow page direction.
