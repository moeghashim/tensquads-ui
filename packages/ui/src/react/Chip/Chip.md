# Chip

Import `Chip` and `ChipProps` from `@tensquads/ui/react`. Chip wraps UI SDK `Button` from `@ui-sdk/react/button`. A chip opens an attached object, so it uses button action behavior without a pressed state.

`name` is the object's identifier, including `snake_case` names. `icon` is a required React node and is hidden from assistive technology because the visible name labels the button. Pass `null` for no icon. Supply `onClick` to open the object, or use `render` with a link to its destination. All remaining props follow the UI SDK Button API, including `disabled` and `className`.

The chip is a `primary-soft` pill with a minimum height of 28px. Its icon uses `text-secondary`; its name uses `button-md`. Hover uses `primary-soft-hover`. Long identifiers remain visible and can wrap inside the pill, increasing its height.

OpenUI requires `Chip(name, icon, href)`. Supply the object identifier, a serializable icon glyph string, and the object's destination URL. It renders Chip through UI SDK Button's `render` prop as an anchor to `href`. Mouse click and Enter open the destination. Space follows native link behavior. React consumers can still supply a React node icon and an `onClick` action or `render` element.
