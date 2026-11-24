import { Icon } from "@tensquads/ui/icons/Icon";
import { Button, Inspector, type InspectorField, squadmateCharacterName } from "@tensquads/ui/react";
import { kindLabel } from "@tensquads/ui/react/workflow/labels";
import { AGENT_ROLE_TO_SLUG, WORKFLOW_KIND_ICON, type WorkflowGraph, type WorkflowNode } from "@tensquads/ui/schemas";
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectTrigger } from "@ui-sdk/react/select";
import type { Locale } from "../../state";
import { builderCopy } from "./copy";
import type { StepSettings } from "./demo-workflows";

const squadmates = [
	{ value: "pisa", role: { en: "Orders", ar: "الطلبات" } },
	{ value: "delphi", role: { en: "Analytics", ar: "التحليلات" } },
	{ value: AGENT_ROLE_TO_SLUG.master, role: { en: "Coordinator", ar: "التنسيق" } },
] as const;

export function StepInspector({
	node,
	graph,
	settings,
	nameOf,
	locale,
	onTitle,
	onSettings,
	onConnections,
	onDuplicate,
	onDelete,
}: {
	node?: WorkflowNode;
	graph: WorkflowGraph;
	settings?: StepSettings;
	nameOf: (node: WorkflowNode) => string;
	locale: Locale;
	onTitle: (value: string) => void;
	onSettings: (patch: Partial<StepSettings>) => void;
	onConnections: (port: number | undefined, targets: string[]) => void;
	onDuplicate: () => void;
	onDelete: () => void;
}) {
	const copy = builderCopy[locale];
	if (!node) return <Inspector title={copy.inspector} description={copy.emptySelection} fields={[]} locale={locale} />;
	const title = nameOf(node);
	const fields: InspectorField[] = [
		{ id: "title", type: "text", label: copy.title, value: node.title, onValueChange: onTitle },
	];
	if (node.kind === "agent") {
		fields.push({
			id: "squadmate",
			type: "select",
			label: copy.squadmate,
			value: settings?.squadmate ?? "",
			options: squadmates.map(({ value, role }) => ({
				value,
				label: `${squadmateCharacterName(value, locale)} · ${role[locale]}`,
			})),
			onValueChange: (value) => {
				const squadmate = squadmates.find((item) => item.value === value);
				if (squadmate) onSettings({ squadmate: squadmate.value });
			},
		});
	}
	fields.push({
		id: "instructions",
		type: "longtext",
		label: copy.instructions,
		value: settings?.instructions ?? "",
		onValueChange: (instructions) => onSettings({ instructions }),
	});

	const byId = new Map(graph.nodes.map((step) => [step.id, step]));
	const links = graph.edges.flatMap((edge) => {
		const from = byId.get(edge.from);
		const to = byId.get(edge.to);
		if (!from || !to || (from.id !== node.id && to.id !== node.id)) return [];
		const direction = from.id === node.id ? copy.to : copy.from;
		const peer = from.id === node.id ? to : from;
		const label = from.branches?.[edge.fromPort ?? 0] ?? copy.output;
		return [{ id: edge.id, text: `${direction} ${nameOf(peer)}`, label }];
	});
	const targets = graph.nodes
		.filter((step) => step.id !== node.id && step.kind !== "start")
		.map((step) => ({ value: step.id, label: nameOf(step) }));
	const ports =
		node.kind === "end"
			? []
			: (node.branches?.map((label, port) => ({ label, port })) ?? [{ label: "", port: undefined }]);

	return (
		<div className="builder-step-inspector">
			<span className="builder-inspector-icon" data-kind={node.kind}>
				<Icon name={WORKFLOW_KIND_ICON[node.kind]} />
			</span>
			<Inspector
				title={title}
				description={`${kindLabel(node.kind, locale)} · ${copy.selected}`}
				fields={fields}
				locale={locale}
				footer={
					<>
						<section className="builder-connections" aria-label={copy.connections}>
							<h3>{copy.connections}</h3>
							{links.length > 0 && (
								<ul>
									{links.map((link) => (
										<li key={link.id}>
											<span>{link.text}</span>
											<span>{link.label}</span>
										</li>
									))}
								</ul>
							)}
							{ports.map(({ label, port }) => {
								const prompt = label ? `+ ${copy.connect} · ${label}` : `+ ${copy.connect}`;
								return (
									<Select
										key={port ?? "output"}
										multiple
										items={targets}
										value={graph.edges
											.filter((edge) => edge.from === node.id && edge.fromPort === port)
											.map((edge) => edge.to)}
										disabled={targets.length === 0}
										onValueChange={(ids) => onConnections(port, ids)}
									>
										<SelectTrigger
											aria-label={prompt}
											className="builder-connect-trigger"
											render={<Button variant="ghost" size="sm" />}
										>
											<span>{prompt}</span>
											<Icon name="chevron" size={14} />
										</SelectTrigger>
										<SelectContent className="ts-inspector__select-content">
											{targets.map((target) => (
												<SelectItem key={target.value} value={target.value}>
													{target.label}
													<SelectItemIndicator>
														<Icon name="check" size={14} />
													</SelectItemIndicator>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								);
							})}
						</section>
						<div className="builder-inspector-actions">
							<Button size="sm" variant="soft" onClick={onDuplicate}>
								{copy.duplicate} <kbd>⌘D</kbd>
							</Button>
							<Button
								className="builder-delete"
								size="sm"
								variant="soft"
								onClick={onDelete}
								data-agent-confirm={copy.deleteConfirm(title)}
							>
								{copy.deleteStep} <kbd>⌫</kbd>
							</Button>
						</div>
					</>
				}
			/>
		</div>
	);
}
