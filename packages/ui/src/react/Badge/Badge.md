# Badge

Import `Badge` and the `BadgeProps` type from `@tensquads/ui/react`. Badge is a plain, non-interactive `<span>` because UI SDK does not ship a Badge component or behavior for this label. It has no hand-authored ARIA role and is not focusable. Each tone keeps at least 4.5:1 text contrast on a selected DataTable row.

`tone` accepts `default`, `success`, `warning`, `danger`, or `info` (default `default`). Outside selected DataTable rows, the default tone uses the primary soft surface with secondary text. Status tones use the matching semantic surface. Outside selected rows, their text uses the status text token in light themes and the surface-text token in dark themes so the 12px labels keep readable contrast. Dark danger uses `red-300` because `danger-surface-text` falls below the contrast target on the danger surface. Keep a state name in the visible text; color alone does not convey the state.

On selected DataTable rows, the default tone uses the surface background and a hairline shadow, with unchanged text color. The info tone uses `info-surface-text` in light themes and `info-text` in dark themes. Dark success, warning, and danger use `green-300`, `orange-200`, and `red-200` text. These overrides preserve contrast when translucent badge surfaces blend with the selection fill.

All other props follow the native span API. Badge does not open a menu. The OpenUI definition accepts a visible `label` and `tone` because OpenUI props are serializable.
