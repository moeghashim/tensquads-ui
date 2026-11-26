# Badge

Import `Badge` and the `BadgeProps` type from `@tensquads/ui/react`. Badge is a plain, non-interactive `<span>` because UI SDK does not ship a Badge component or behavior for this label. It has no hand-authored ARIA role and is not focusable. Each tone keeps at least 4.5:1 text contrast on a selected DataTable row.

`tone` accepts `default`, `success`, `warning`, `danger`, or `info` (default `default`). The default tone uses the primary soft surface with secondary text. Status tones use the matching semantic surface. Their text uses the status text token in light themes and the surface-text token in dark themes so the 12px labels keep readable contrast. Dark danger uses `red-300` because `danger-surface-text` falls below the contrast target on the danger surface. Keep a state name in the visible text; color alone does not convey the state.

All other props follow the native span API. Badge does not open a menu. The OpenUI definition accepts a visible `label` and `tone` because OpenUI props are serializable.
