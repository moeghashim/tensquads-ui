# TensquadsRenderer

Import `TensquadsRenderer` from `@tensquads/ui/openui`. Pass OpenUI Lang text as `stream` and set `locale` to `en` or `ar` to select the component library. Use `onError` to receive parse and render errors.

## Hide the OpenUI Inspect button

`@openuidev/react-lang` 1.1.1 loads the Inspect widget as soon as its browser entry is imported in development, before any renderer props are passed. This version has no public option to disable that auto-mount. To hide the widget, add this rule to your app's global stylesheet after the imports.

```css
[data-openui-devtools-root] {
  display: none;
}
```

The selector matches the devtools root attached to `document.body`. The rule hides the widget and leaves the OpenUI stream visible. Remove it to show the widget during development.
