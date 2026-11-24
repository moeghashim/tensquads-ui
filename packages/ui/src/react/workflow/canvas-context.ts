import { createContext } from "react";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import type { NodeSize } from "./geometry.js";
import type { CanvasViewport } from "./viewport.js";

export type CanvasPan = (viewport: CanvasViewport, reason: "drag" | "imperative", event: Event) => void;

export const CanvasContext = createContext<{
	graph: WorkflowGraph;
	viewport: CanvasViewport;
	nodeSizes: Readonly<Record<string, NodeSize>>;
	size: NodeSize;
	locale: "en" | "ar";
	pan: CanvasPan;
} | null>(null);
