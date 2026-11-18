# SegmentedControl

Import `SegmentedControl`, `SegmentedControlItem` and `SegmentedControlIndicator` from `@tensquads/ui/react`. They wrap UI SDK's public segmented-control parts from `@ui-sdk/react/segmented-control` and preserve their slots, render props, value callbacks and forwarded props.

Set a visible external label or `aria-label`. Put the indicator and two to four items inside the root. Each item needs a stable `value`. Use `defaultValue` or controlled `value` with `onValueChange(value, details)`. Use this for exclusive modes, not actions.

UI SDK provides radio-group semantics, one tab stop, focus management, and arrow-key selection, skipping disabled items and wrapping by default. Left and right follow the page direction: in RTL, the physical arrow navigation reverses. Space selects the focused item; Enter submits its form.

The OpenUI definition accepts a label, two to four distinct text options and an optional initial value from those options. Its schema rejects duplicate options and values outside the option set. During streaming, each option keeps its identity as its text grows. Duplicate labels are omitted. An unmatched initial value is deferred, with the first available option selected until it matches. A user selection takes precedence over the initial value. Consumers can provide icon content through React children and must give icon-only items accessible names.
