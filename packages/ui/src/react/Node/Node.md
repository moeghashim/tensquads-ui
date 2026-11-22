# Node

`Node` displays one workflow step. Pass its `kind`, `title`, optional `meta`, and optional `branches`. Set `selected` to show the selected ring. The component draws its input and output ports. A `start` node has no input, an `end` node has no output, and a branch node has one output for each branch row. `BranchNode` is the same component with `branches` set.

Node is without an OpenUI definition because it is application chrome. A host maps its workflow data to the display schema and places nodes on the Canvas.
