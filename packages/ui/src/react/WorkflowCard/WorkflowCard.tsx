import { Icon } from "../../icons/Icon.js";
import { WORKFLOW_KIND_FAMILY, type WorkflowGraph } from "../../schemas/workflow.js";
import { Badge } from "../Badge/Badge.js";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../Menu/Menu.js";
import { DEFAULT_NODE_WIDTH, edgePath, graphBounds, nodeHeight, portPosition } from "../workflow/geometry.js";

export type WorkflowCardAction = "open" | "duplicate" | "publish" | "unpublish" | "delete";
export type WorkflowCardStat = { label: string; value: string };
export type WorkflowCardProps = {
	name: string;
	status: "draft" | "live";
	meta: string;
	stats: readonly [WorkflowCardStat, WorkflowCardStat, WorkflowCardStat];
	graph: WorkflowGraph;
	href?: string;
	onAction?: (action: WorkflowCardAction) => void;
	locale?: "en" | "ar";
};

function Thumbnail({ graph }: { graph: WorkflowGraph }) {
	const nodes = graph.nodes.map((node) => ({ ...node.position, width: DEFAULT_NODE_WIDTH, height: nodeHeight(node) }));
	const bounds = graphBounds(nodes);

	return (
		<div className="ts-workflow-card__thumbnail" aria-hidden="true">
			{bounds && <ThumbnailGraph graph={graph} bounds={bounds} />}
		</div>
	);
}

function ThumbnailGraph({
	graph,
	bounds,
}: {
	graph: WorkflowGraph;
	bounds: NonNullable<ReturnType<typeof graphBounds>>;
}) {
	const width = Math.max(480, bounds.width + 2 * 20);
	const height = Math.max(220, bounds.height + 2 * 20);
	const x = bounds.x + (bounds.width - width) / 2;
	const y = bounds.y + (bounds.height - height) / 2;
	const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
	return (
		<svg viewBox={`${x} ${y} ${width} ${height}`} focusable="false" aria-hidden="true">
			{graph.edges.map((edge) => {
				const from = nodesById.get(edge.from);
				const to = nodesById.get(edge.to);
				if (!from || !to) return null;
				const start = portPosition(from, { out: edge.fromPort ?? 0 }, DEFAULT_NODE_WIDTH);
				const end = portPosition(to, "in", DEFAULT_NODE_WIDTH);
				return (
					<path key={edge.id} className="ts-workflow-card__edge" d={edgePath(start.x, start.y, end.x, end.y)} />
				);
			})}
			{graph.nodes.map((node) => (
				<g
					key={node.id}
					className="ts-workflow-graph-node"
					data-family={WORKFLOW_KIND_FAMILY[node.kind]}
					transform={`translate(${node.position.x} ${node.position.y})`}
				>
					<rect className="ts-workflow-card__node" width={DEFAULT_NODE_WIDTH} height={nodeHeight(node)} />
					<rect className="ts-workflow-card__tile" x={10} y={10} width={30} height={30} />
				</g>
			))}
		</svg>
	);
}

const copy = {
	en: {
		draft: "Draft",
		live: "Live",
		actions: (name: string) => `Actions for ${name}`,
		open: "Open",
		duplicate: "Duplicate",
		publish: "Publish",
		unpublish: "Unpublish",
		delete: "Delete",
		confirmUnpublish: (name: string) => `Unpublish the workflow “${name}”.`,
		confirmDelete: (name: string) => `Delete the workflow “${name}”.`,
	},
	ar: {
		draft: "مسودة",
		live: "منشور",
		actions: (name: string) => `إجراءات «${name}»`,
		open: "فتح",
		duplicate: "إنشاء نسخة",
		publish: "نشر",
		unpublish: "إلغاء النشر",
		delete: "حذف",
		confirmUnpublish: (name: string) => `إلغاء نشر سير العمل «${name}».`,
		confirmDelete: (name: string) => `حذف سير العمل «${name}».`,
	},
};

export function WorkflowCard({ name, status, meta, stats, graph, href, onAction, locale = "en" }: WorkflowCardProps) {
	const labels = copy[locale];
	const live = status === "live";
	const publishAction = live ? "unpublish" : "publish";
	const [runs, passRate, lastRun] = stats;
	return (
		<article data-slot="workflow-card" className="ts-workflow-card">
			<Thumbnail graph={graph} />
			<div className="ts-workflow-card__body">
				<div className="ts-workflow-card__title">
					{href ? (
						<a className="ts-workflow-card__link" href={href}>
							{name}
						</a>
					) : (
						<strong>{name}</strong>
					)}
					<Badge tone={live ? "success" : "default"}>{labels[status]}</Badge>
				</div>
				<p className="ts-workflow-card__meta">{meta}</p>
				<dl className="ts-workflow-card__stats">
					{Object.entries({ runs, passRate, lastRun }).map(([id, { label, value }]) => (
						<div key={id}>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</div>
					))}
				</dl>
			</div>
			{href && (
				<Menu>
					<MenuTrigger
						aria-label={labels.actions(name)}
						className="ts-workflow-card__actions"
						render={<button type="button" />}
					>
						<Icon name="more" />
					</MenuTrigger>
					<MenuContent align="end">
						<MenuItem
							value="open"
							render={onAction ? undefined : <a href={href}>{labels.open}</a>}
							onSelect={onAction && (() => onAction("open"))}
						>
							{labels.open}
						</MenuItem>
						<MenuItem value="duplicate" disabled={!onAction} onSelect={() => onAction?.("duplicate")}>
							{labels.duplicate}
						</MenuItem>
						<MenuItem
							value={publishAction}
							disabled={!onAction}
							onSelect={() => onAction?.(publishAction)}
							data-agent-confirm={live ? labels.confirmUnpublish(name) : undefined}
						>
							{labels[publishAction]}
						</MenuItem>
						<MenuSeparator />
						<MenuItem
							value="delete"
							disabled={!onAction}
							onSelect={() => onAction?.("delete")}
							destructive
							data-agent-confirm={labels.confirmDelete(name)}
						>
							{labels.delete}
						</MenuItem>
					</MenuContent>
				</Menu>
			)}
		</article>
	);
}
