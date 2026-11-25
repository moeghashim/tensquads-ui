import { z } from "zod/v4";
import type { IconName } from "../icons/icons.js";

export const WorkflowNodeKindSchema = z.enum([
	"agent",
	"classify",
	"if-else",
	"while",
	"user-approval",
	"start",
	"end",
	"note",
	"file-search",
	"guardrails",
	"mcp",
	"transform",
	"set-state",
]);
export type WorkflowNodeKind = z.infer<typeof WorkflowNodeKindSchema>;
export type WorkflowNodeFamily = "agent" | "logic" | "end" | "note" | "tool" | "data";

export const WORKFLOW_KIND_FAMILY = {
	agent: "agent",
	classify: "logic",
	"if-else": "logic",
	while: "logic",
	"user-approval": "logic",
	start: "end",
	end: "end",
	note: "note",
	"file-search": "tool",
	guardrails: "tool",
	mcp: "tool",
	transform: "data",
	"set-state": "data",
} as const satisfies Record<WorkflowNodeKind, WorkflowNodeFamily>;

export const WORKFLOW_KIND_ICON = {
	agent: "agent",
	classify: "classify",
	"if-else": "ifelse",
	while: "while",
	"user-approval": "approval",
	start: "play",
	end: "end",
	note: "note",
	"file-search": "file",
	guardrails: "shield",
	mcp: "mcp",
	transform: "transform",
	"set-state": "state",
} as const satisfies Record<WorkflowNodeKind, IconName>;

const BranchKindSchema = z.enum(["classify", "if-else", "guardrails"]);
const WorkflowNodeSchema = z
	.object({
		id: z.string().min(1),
		kind: WorkflowNodeKindSchema,
		title: z.string(),
		meta: z.string().optional(),
		position: z.object({ x: z.number().finite(), y: z.number().finite() }).strict(),
		branches: z.array(z.string()).optional(),
	})
	.strict()
	.superRefine((node, ctx) => {
		if (node.branches && node.branches.length < 2)
			ctx.addIssue({
				code: "custom",
				path: ["branches"],
				message: `Node ${node.id} requires at least two branches`,
			});
		if (node.branches && !BranchKindSchema.safeParse(node.kind).success)
			ctx.addIssue({
				code: "custom",
				path: ["branches"],
				message: `Node ${node.id} cannot have branches`,
			});
	});
const WorkflowEdgeSchema = z
	.object({
		id: z.string().min(1),
		from: z.string().min(1),
		fromPort: z.number().int().nonnegative().optional(),
		to: z.string().min(1),
	})
	.strict();

export const WorkflowGraphSchema = z
	.object({ nodes: z.array(WorkflowNodeSchema), edges: z.array(WorkflowEdgeSchema) })
	.strict()
	.superRefine((graph, ctx) => {
		const nodeById = new Map<string, (typeof graph.nodes)[number]>();
		graph.nodes.forEach((node, index) => {
			if (nodeById.has(node.id))
				ctx.addIssue({ code: "custom", path: ["nodes", index, "id"], message: `Duplicate node id: ${node.id}` });
			else nodeById.set(node.id, node);
		});
		const edgeIds = new Set<string>();
		graph.edges.forEach((edge, index) => {
			if (edgeIds.has(edge.id))
				ctx.addIssue({ code: "custom", path: ["edges", index, "id"], message: `Duplicate edge id: ${edge.id}` });
			edgeIds.add(edge.id);
			const from = nodeById.get(edge.from);
			const to = nodeById.get(edge.to);
			if (!from)
				ctx.addIssue({
					code: "custom",
					path: ["edges", index, "from"],
					message: `Unknown source node: ${edge.from}`,
				});
			if (!to)
				ctx.addIssue({ code: "custom", path: ["edges", index, "to"], message: `Unknown target node: ${edge.to}` });
			if (to?.kind === "start")
				ctx.addIssue({
					code: "custom",
					path: ["edges", index, "to"],
					message: `Edge ${edge.id} cannot enter start node ${to.id}`,
				});
			if (from?.kind === "end")
				ctx.addIssue({
					code: "custom",
					path: ["edges", index, "from"],
					message: `Edge ${edge.id} cannot leave end node ${from.id}`,
				});
			if (edge.fromPort !== undefined) {
				if (from && !from.branches)
					ctx.addIssue({
						code: "custom",
						path: ["edges", index, "fromPort"],
						message: `Edge ${edge.id} uses a port on non-branch node ${from.id}`,
					});
				else if (from?.branches && edge.fromPort >= from.branches.length)
					ctx.addIssue({
						code: "custom",
						path: ["edges", index, "fromPort"],
						message: `Edge ${edge.id} port is out of range for node ${from.id}`,
					});
			} else if (from?.branches)
				ctx.addIssue({
					code: "custom",
					path: ["edges", index, "fromPort"],
					message: `Edge ${edge.id} requires a branch port for node ${from.id}`,
				});
		});
	});

export type WorkflowGraph = z.infer<typeof WorkflowGraphSchema>;
export type WorkflowNode = WorkflowGraph["nodes"][number];
export type WorkflowEdge = WorkflowGraph["edges"][number];
