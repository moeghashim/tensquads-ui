# Canvas

`Canvas` renders a workflow graph in a pannable and zoomable surface. The host owns the graph and viewport. Node positions use logical coordinates, so `x` measures from inline start in both directions.

The viewport starts at `{ x: 0, y: 0, zoom: 1 }`. Pass `viewport` and `onViewportChange` to control it, or use `defaultViewport`. Zoom is limited to 50–200%. Drag the empty surface or use the wheel to pan. Hold Ctrl or ⌘ while scrolling to zoom at the pointer. Focus the surface and press `+`, `-`, or `0` to zoom.

Use `ref` with `CanvasHandle` to read measured node sizes for `tidyLayout`. Before a node is measured, its edge uses the shared 180px estimate.

Canvas is used without an OpenUI definition because it is interactive application chrome, not streamed content.
