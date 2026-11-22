# Canvas

`Canvas` renders a workflow graph in a pannable and zoomable surface. The host owns the graph and viewport. Node positions use logical coordinates, so `x` measures from inline start in both directions.

The viewport starts at `{ x: 0, y: 0, zoom: 1 }`. Pass `viewport` and `onViewportChange` to control it, or use `defaultViewport`. Zoom is limited to 50–200%. Drag the empty surface or use the wheel to pan. Hold Ctrl or ⌘ while scrolling to zoom at the pointer. Focus the surface and press `+`, `-`, or `0` to zoom.

Click a node or edge to select it. Hold Shift to toggle an item in the selection. Click empty space to clear it. Pass `selection` and `onSelectionChange` to control selection; omit `selection` to let Canvas manage it. `CanvasSelection` contains node and edge ID arrays.

Pass `onNodeMove` to make nodes movable. Canvas reports one logical integer position per moved node and waits for the host to pass the updated graph back. If the pressed node is selected, the selected node group moves together. Without `onNodeMove`, nodes stay fixed. In select mode, drag a node; Escape cancels the current drag. Dragging a selected group keeps its selection.

Pass `onConnect` to let users draw an edge from an output port to a node body or input port. Canvas reports `{ from, fromPort?, to }` with UI SDK change details and waits for the host to add the edge to `graph`. `fromPort` is present only for nodes with branches. Escape cancels the connection and keeps the current selection. Without `onConnect`, output ports behave like part of the node. The keyboard path for connecting is the Inspector.

## Keyboard

Canvas uses a listbox with options because workflow nodes are spatially arranged choices that can be selected together. Tab enters on the first selected node, or the first node, and leaves the group on the next Tab. Arrow keys move focus to the nearest node in that screen direction; Home and End move to the first and last node. Enter or Space selects the focused node, and Shift+Enter or Shift+Space toggles it. Escape clears the selection. Focused nodes outside the viewport are brought into view.

With `onNodeMove`, Shift+arrow moves the focused node or its selected group by 20 physical pixels. Focus stays on the node.

Use `ref` with `CanvasHandle` to read measured node sizes for `tidyLayout`. Before a node is measured, its edge uses the shared 180px estimate.

Canvas is used without an OpenUI definition because it is interactive application chrome, not streamed content.
