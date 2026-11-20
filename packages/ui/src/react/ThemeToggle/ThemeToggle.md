# ThemeToggle

Import `ThemeToggle` from `@tensquads/ui/react`. It switches between light and dark themes. The uncontrolled version uses `themePreference` to set `data-theme` on `<html>` and save the choice as `tensquads.theme`. A controlled version calls `onValueChange` and does not read or write browser state.

ThemeToggle has no OpenUI definition. It is application chrome with callbacks and cannot be streamed (D28).

Without a saved choice, uncontrolled mode follows the operating system when the shared preference first initializes. Later mounts keep the session's choice, including when storage is blocked. Hosts can import `themePreference` from the same entry, read `themePreference.get().value`, and call `themePreference.set("dark")` or `themePreference.set("light")`.

Pass `value="light"` or `value="dark"` for controlled mode. Update the host's theme in `onValueChange(next)` and pass the new value back. The callback also runs after an uncontrolled press. `locale` defaults to `"en"`; use `"ar"` for Arabic names. Override either name with `labels={{ toLight: "Use light theme", toDark: "Use dark theme" }}`. The entry exports `ThemeToggleProps` and `ThemeToggleLabels`.

The sun shows the light state and the moon shows the dark state. The accessible name describes the next action. The button has no `aria-pressed`. Uncontrolled server rendering and the first hydration render show the light icon; after mount the button shows the current preference.

Add `themeInitScript` to the document head so the saved choice or operating system preference is applied before first paint. In a TanStack Start root document, render the script before `HeadContent`:

```tsx
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { themeInitScript } from "@tensquads/ui/react";

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

export const Route = createRootRoute({ shellComponent: Document });
```

The UI SDK preference handles blocked storage without stopping the theme change. `themeInitScript` also catches storage errors and falls back to the operating system preference.
