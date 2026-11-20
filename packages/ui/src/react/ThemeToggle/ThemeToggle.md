# ThemeToggle

Import `ThemeToggle` from `@tensquads/ui/react`. It switches between light and dark themes. The uncontrolled version uses `themePreference` to set `data-theme` on `<html>` and save the choice as `tensquads.theme`. A controlled version calls `onValueChange` and does not read or write browser state.

ThemeToggle has no OpenUI definition. It is application chrome with callbacks and cannot be streamed (D28).

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
