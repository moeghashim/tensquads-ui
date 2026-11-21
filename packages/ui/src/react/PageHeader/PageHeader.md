# PageHeader

Import `PageHeader` and `PageHeaderProps` from `@tensquads/ui/react`. PageHeader begins a full-page view with a title, one subtitle line, optional actions at the inline end, and an optional metadata row. Keep the subtitle concise and name the counts the page describes. `headingLevel` defaults to `1`; use `2` when the header appears inside a nested preview or section.

Actions wrap below the copy when the container cannot fit both side by side. At viewport widths of 48rem or less, actions always sit below the copy and align to the inline start.

The OpenUI definition accepts serializable text for `title`, `subtitle`, `meta`, and `actions`. Use React composition when actions need controls or metadata needs badges.
