# Dialog

Import `Dialog`, its parts, and the matching prop types from `@tensquads/ui/react`. Dialog wraps UI SDK's `@ui-sdk/react/dialog` parts: `Dialog`, `DialogTrigger`, `DialogBackdrop`, `DialogContent`, `DialogTitle`, `DialogDescription`, and `DialogClose`. Each part keeps its UI SDK `data-slot`, `render` prop, open-state API, and forwarded props. The wrapper adds Agent-UI classes only.

Use all required parts and include a `DialogTitle` in every dialog. Use a visible trigger label. Dialog is modal by default. UI SDK manages focus, Tab containment, Escape and backdrop dismissal, scroll lock, and focus return. Use the root's `open` and `onOpenChange` props for controlled state, or `defaultOpen` for an initially open dialog. `DialogContent` supports `initialFocus`, `finalFocus`, and `keepMounted`.

The OpenUI definition accepts serializable `triggerLabel`, `title`, `description`, `body`, `cancelLabel`, `actionLabel`, and `destructive` props. Both actions dismiss the dialog. The OpenUI view loads its Dialog parts after mounting in the browser. It renders no server content or loading placeholder.

The content uses `panel`, `panel-border`, `radius-2xl`, `shadow-overlay`, and panel title and description typography tokens. The backdrop uses `duration-exit` and `ease-exit` for opacity transitions. The content uses `duration-enter` and `ease-enter` for opacity and scale transitions. Reduced-motion preferences disable transitions. Layout uses logical properties and constrains the content to the viewport.
