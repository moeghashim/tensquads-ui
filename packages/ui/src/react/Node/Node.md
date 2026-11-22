# Node

`Node` displays one workflow step. Pass its `kind`, `title`, optional `meta`, and optional `branches`. Set `selected` to show the selected ring. The component draws its input and output ports. A `start` node has no input, an `end` node has no output, and a branch node has one output for each branch row. Use `Node` with `branches` for BranchNode; there is no separate `BranchNode` export.

Node is without an OpenUI definition because it is application chrome. Import `Node` and `NodeProps` from `@tensquads/ui/react`. It forwards div props and has no positioning, selection events, dragging, or keyboard behavior of its own. The host supplies placement and interaction. Notes hide `meta`. Meta and branch text use `text-secondary`, because the spec's `text-tertiary` fails AA contrast. Ports are decorative and hidden from assistive technology; the host provides accessible connection information and controls. Direction follows the document, with inputs at inline start and outputs at inline end.

```tsx
import { Node } from "@tensquads/ui/react";

<Node
  kind="if-else"
  title="Check availability"
  meta="Two conditions"
  branches={["In stock", "Preorder", "Else"]}
  selected
/>;
```

## Workflow data

Map host data to the display contract before rendering or laying it out. Import `WorkflowGraphSchema` and the inferred `WorkflowGraph`, `WorkflowNode`, and `WorkflowEdge` types from `@tensquads/ui/schemas`. Validate external data with `WorkflowGraphSchema.parse(input)` or `safeParse(input)`. The [schema source](../../schemas/workflow.ts) owns the accepted fields, kinds, branch restrictions, and edge validation. The same entry exports `WorkflowNodeKindSchema`, `WorkflowNodeKind`, `WorkflowNodeFamily`, `WORKFLOW_KIND_FAMILY`, and `WORKFLOW_KIND_ICON` for kind validation and presentation mappings.

## Layout and connectors

Import `tidyLayout` and the `NodeSize` type from `@tensquads/ui/react`. Call `tidyLayout(graph, sizes?)` with a validated graph and optional measured sizes keyed by node id. It returns positions keyed by node id without changing the graph. Apply those positions in the host as one undo step:

```ts
import { tidyLayout } from "@tensquads/ui/react";
import type { WorkflowGraph } from "@tensquads/ui/schemas";

function arrange(graph: WorkflowGraph): WorkflowGraph {
  const positions = tidyLayout(graph);
  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({ ...node, position: positions[node.id]! })),
  };
}
```

The layout orders columns by predecessors, ignores loop-closing edges for column assignment, and orders each column by its parents and branch ports. It centres columns on a shared horizontal axis, snaps positions to the grid, and puts unconnected nodes in a row below the flow. Missing sizes use estimates; pass measured widths and heights for content-sized cards. See the [layout implementation](../workflow/tidy.ts) for spacing and fallback dimensions.

Coordinates are logical: `x` increases toward inline end. The host mirrors placement and connectors in RTL; `tidyLayout` takes no direction argument. `portPosition(node, "in", measuredWidth)` and `portPosition(node, { out: branchIndex }, measuredWidth)` return port centres in these graph coordinates. Request only ports the node renders. `edgePath(x1, y1, x2, y2)` returns an SVG cubic path between endpoints with horizontal tangents. These helpers and the token-derived `NODE_METRICS` are exported from `@tensquads/ui/react`; see [geometry](../workflow/geometry.ts) for their definitions.
