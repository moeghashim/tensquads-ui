# Canvas

`Canvas` renders a workflow graph in a pannable and zoomable surface. The host owns the graph. Node positions use logical coordinates, so `x` measures from inline start in both directions.

Import `Canvas`, `CanvasProps`, `CanvasSelection`, `CanvasViewport`, `CanvasConnection`, and `CanvasHandle` from `@tensquads/ui/react`. Pass `graph` and a required accessible `label`. Canvas fills its container; give the container a height. Set `grid={false}` to hide the default dot grid. Use `children` for overlays such as a toolbar; overlay controls do not trigger canvas gestures.

`locale` defaults to `"en"` and selects generated accessible labels and announcements. Supply translated node titles, metadata, and branches in `graph`. Direction defaults to LTR for English and RTL for Arabic; pass `dir="ltr"` or `dir="rtl"` to override it. Canvas uses this direction rather than inheriting the document direction.

The viewport starts at `{ x: 0, y: 0, zoom: 1 }`. Pass `viewport` and `onViewportChange` to control it. When `viewport` is omitted, Canvas manages it internally, with an optional `defaultViewport` initial value. Zoom is limited to 50–200%. Drag the empty surface or use the wheel to pan. Hold Ctrl or ⌘ while scrolling to zoom at the pointer. With focus in the canvas, press `+`, `-`, or `0` to zoom.

`mode` defaults to `"select"`. In `mode="pan"`, dragging nodes or edges also pans, and pointer selection, movement, and connection are disabled. Keyboard selection remains available.

Click a node or edge to select it. Hold Shift to toggle an item in the selection. Click empty space to clear it. Pass `selection` and `onSelectionChange` to control selection; omit `selection` to let Canvas manage it. `CanvasSelection` contains node and edge ID arrays.

Pass `onNodeMove` to make nodes movable. Canvas reports one logical integer position per moved node and waits for the host to pass the updated graph back. If the pressed node is selected, the selected node group moves together. Without `onNodeMove`, nodes stay fixed. In select mode, drag a node; Escape cancels the current drag. Dragging a selected group keeps its selection and calls `onNodeMove` once per node with the same `details.event`, so a host can make it one undo step.

Pass `onConnect` to let users draw an edge from an output port to a node body or input port. Canvas reports `{ from, fromPort?, to }` with UI SDK change details and waits for the host to add the edge to `graph`. `fromPort` is present only for nodes with branches. Self-connections, connections into Start or out of End, and duplicate connections from the same output to the same target are refused. Escape cancels the connection and keeps the current selection. Without `onConnect`, output ports behave like part of the node. Use [Inspector connections fields](../Inspector/Inspector.md) for the keyboard path; Canvas itself has no keyboard connection control.

Pass `onDelete` to handle Delete or Backspace on a focused node or the canvas root. Canvas reports the current node and edge selection; the host removes selected items and edges attached to removed nodes. When the focused node is removed, focus goes to the node that takes its place, or to the canvas when no node is left.

The Canvas agent bridge offers `select(nodes, edges?)`, `move(id, x, y)`, and `connect(from, to, fromPort?)`. Selection ignores IDs outside the graph. Movement rounds logical positions and works in pan mode. Movement and connection return `false` when the host has no matching callback, their input is invalid, or the host cancels the change. The bridge reports change details with the source `agent` to host callbacks.

Use `ref` with `CanvasHandle` and call `getNodeSizes()` to read measured node sizes for `tidyLayout`. `pointAt(clientX, clientY)` returns the rounded logical graph position under a client point, or `null` outside the Canvas, on an overlay, or when another element is topmost there. Before a node is measured, its edge uses the shared width estimate from the [layout implementation](../workflow/tidy.ts).

## Keyboard

The nodes are options in a multi-select listbox, the role for a group of items people move through and select. Each option is named by its card and described by its outgoing connections. Tab enters on the first selected node, or the first node, and leaves the group on the next Tab. Arrow keys move focus to the nearest node in that screen direction; Home and End move to the first and last node. Enter or Space selects the focused node, and Shift+Enter or Shift+Space toggles it. Escape clears the selection. Focused nodes outside the viewport are brought into view.

With `onNodeMove` in select mode, Shift+arrow moves the focused node or its selected group by 20 graph units in the arrow's screen direction. Zoom scales the visible distance. Focus stays on the node.

Canvas is used without an OpenUI definition because it is interactive application chrome, not streamed content.
