# Chip

Import `Chip` and `ChipProps` from `@tensquads/ui/react`. Chip wraps UI SDK `Button` from `@ui-sdk/react/button`. A chip opens an attached object, so it uses button action behavior without a pressed state.

`name` is the object's identifier, including `snake_case` names. `icon` is a required React node and is hidden from assistive technology because the visible name labels the button. All remaining props follow the UI SDK Button API, including `onClick`, `disabled`, `render`, and `className`.

The chip is a 28px `primary-soft` pill. Its icon uses `text-secondary`; its name uses `button-md`. Hover uses `primary-soft-hover`. Long identifiers remain visible and can wrap inside the pill.

OpenUI accepts a serializable `name`. It supplies a generic decorative glyph because arbitrary React nodes cannot be represented in OpenUI streams.
