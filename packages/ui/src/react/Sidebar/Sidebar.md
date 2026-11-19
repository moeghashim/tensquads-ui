# Sidebar

`Sidebar` is app navigation and has no OpenUI definition because navigation belongs to application chrome, not streamed content. Import `Sidebar`, `SidebarBrand`, `SidebarItem`, `SidebarSection`, `SidebarUser`, and `SidebarAgent` from `@tensquads/ui/react`.

Provide an accessible `label` and compose the navigation from the parts. `SidebarItem` accepts an icon node, optional `count`, and `active` props. Set `active` for the current page; it controls the selected style and `aria-current="page"`. Pass UI SDK's `render` prop to render a router link. Set `disabled` for unavailable items; they remain readable to assistive technology and are not focusable. `SidebarSection` labels a group. `SidebarUser` stays at the bottom when the sidebar has available height.

Use `SidebarAgent` for squad rows. Pass `roleLabel` for the agent role and `status` as `online` or `idle`. It renders a localized `Squadmate` and a screen-reader status label. Set `featured` and `meta` for the lead row. `SidebarUser` takes `userRole` for the account role.

At widths below 960px, Sidebar shows a menu button and opens its navigation in a Dialog sheet. Dialog manages focus and returns it to the menu button when closed. Selecting a link closes the sheet.

The sidebar uses a 248px width, canvas background, and Agent-UI spacing, typography, radius, status and surface tokens. The host dashboard places its content in a surface panel with radius-2xl corners at the inline start.
