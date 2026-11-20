# Toolbar

Import `Toolbar` from `@tensquads/ui/react`. It groups up to six icon controls in a floating toolbar. The toolbar has no OpenUI definition because it is application chrome with callbacks (D28).

Pass `label` as the accessible name and an `items` array of toggles, buttons and separators. Every control has a `label`, an icon and a tooltip with the same text. Toggle state is controlled by `pressed` and `onPressedChange`; buttons call `onClick`. Disabled controls remain reachable with toolbar arrow navigation.

Enabled, unpressed controls use `ghost-hover` on hover. Pressed controls use `primary` ink and a `primary-soft` fill. In light mode, their hover fill is `primary-soft-hover`. In dark mode, a `ghost-active` overlay lifts the pressed fill above the toolbar background, including on hover.

The consumer owns mode groups. To make Pan and Select exclusive, keep one mode in host state and pass `pressed={mode === "pan"}` and `pressed={mode === "select"}` to the two toggle items. Update that one state from both `onPressedChange` callbacks. Place Pan and Select first, then history actions. The spec limits the toolbar to six controls.

The toolbar does not position itself. For a bottom-centre canvas toolbar, use:

```css
.canvas-toolbar {
  position: absolute;
  inset-block-end: var(--ts-space-6);
  inset-inline: 0;
  margin-inline: auto;
  inline-size: fit-content;
}
```

It uses the UI SDK toolbar's one-tab-stop arrow navigation, including Home, End and reading-direction-aware arrows.
