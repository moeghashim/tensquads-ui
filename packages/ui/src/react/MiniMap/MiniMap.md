# MiniMap

`MiniMap` shows the shape of a workflow that is larger than the visible Canvas. The map shows family-tinted node rectangles and a mask for the current viewport.

Render it as a child of `Canvas`. Use `placement="start"` to put it at the bottom inline start. It defaults to `"end"`. Both corners follow the Canvas direction. Empty graphs and graphs whose dimensions fit at the current zoom hide the map.

Click a point in the map to center the Canvas there, or drag the viewport mask to pan. Tab to the Minimap region and use the arrow keys to pan by 10 percent of the visible width or height. Canvas reports these changes through its usual `onViewportChange` callback.

MiniMap is without an OpenUI definition because it controls an application-owned Canvas.
