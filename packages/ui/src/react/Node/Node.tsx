import type { ComponentProps } from "react";
import { Icon } from "../../icons/Icon.js";
import { WORKFLOW_KIND_FAMILY, WORKFLOW_KIND_ICON, type WorkflowNodeKind } from "../../schemas/workflow.js";

export type NodeProps = ComponentProps<"div"> & {
	kind: WorkflowNodeKind;
	title: string;
	meta?: string;
	branches?: string[];
	selected?: boolean;
};

export function Node({ kind, title, meta, branches, selected = false, className, ...props }: NodeProps) {
	return (
		<div
			{...props}
			data-slot="workflow-node"
			data-family={WORKFLOW_KIND_FAMILY[kind]}
			data-kind={kind}
			data-selected={selected ? "true" : undefined}
			className={["ts-node", className].filter(Boolean).join(" ")}
		>
			{kind !== "start" && (
				<span className="ts-node__port ts-node__port--in" data-port="in" data-port-index="0" aria-hidden="true" />
			)}
			<div className="ts-node__head">
				<span className="ts-node__icon">
					<Icon name={WORKFLOW_KIND_ICON[kind]} size={16} />
				</span>
				<span className="ts-node__copy">
					<span className="ts-node__title">{title}</span>
					{kind !== "note" && meta && <span className="ts-node__meta">{meta}</span>}
				</span>
			</div>
			{branches?.length ? (
				<div className="ts-node__branches">
					{branches.map((branch, index) => (
						<div className="ts-node__branch" key={`${index}:${branch}`}>
							<span className="ts-node__branch-label">{branch}</span>
							<span
								className="ts-node__port ts-node__port--out"
								data-port="out"
								data-port-index={index}
								aria-hidden="true"
							/>
						</div>
					))}
				</div>
			) : kind !== "end" ? (
				<span className="ts-node__port ts-node__port--out" data-port="out" data-port-index="0" aria-hidden="true" />
			) : null}
		</div>
	);
}
