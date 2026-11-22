import type { ChangeSource } from "@ui-sdk/core";
import { Button as UiButton } from "@ui-sdk/react/button";
import { ToolbarButton, ToolbarGroup, Toolbar as UiToolbar } from "@ui-sdk/react/toolbar";
import { type ComponentProps, useId } from "react";
import { Icon } from "../../icons/Icon.js";
import { WORKFLOW_KIND_FAMILY, WORKFLOW_KIND_ICON, type WorkflowNodeKind } from "../../schemas/workflow.js";
import { kindLabel } from "../workflow/labels.js";

export type PaletteItem = { kind: WorkflowNodeKind; label: string };
export type PaletteSection = { id: string; label: string; items: readonly PaletteItem[] };
export type PaletteInsertDetails = { source: ChangeSource; position?: { x: number; y: number } };
export type PaletteProps = Omit<ComponentProps<typeof UiToolbar>, "children" | "aria-label" | "orientation"> & {
	label: string;
	sections: readonly PaletteSection[];
	onInsert: (kind: WorkflowNodeKind, details: PaletteInsertDetails) => void;
};

const sectionLabels = {
	en: { core: "Core", tools: "Tools", logic: "Logic", data: "Data" },
	ar: { core: "الأساسيات", tools: "الأدوات", logic: "المنطق", data: "البيانات" },
} as const;
const sectionKinds = {
	core: ["agent", "end", "note"],
	tools: ["file-search", "guardrails", "mcp"],
	logic: ["if-else", "while", "user-approval", "classify"],
	data: ["transform", "set-state"],
} as const satisfies Record<string, readonly WorkflowNodeKind[]>;

export const DEFAULT_PALETTE_SECTIONS: Record<"en" | "ar", readonly PaletteSection[]> = {
	en: Object.entries(sectionKinds).map(([id, kinds]) => ({
		id,
		label: sectionLabels.en[id as keyof typeof sectionLabels.en],
		items: kinds.map((kind) => ({ kind, label: kindLabel(kind, "en") })),
	})),
	ar: Object.entries(sectionKinds).map(([id, kinds]) => ({
		id,
		label: sectionLabels.ar[id as keyof typeof sectionLabels.ar],
		items: kinds.map((kind) => ({ kind, label: kindLabel(kind, "ar") })),
	})),
};

export function Palette({ label, sections, onInsert, className, ...props }: PaletteProps) {
	const id = useId();
	return (
		<UiToolbar
			{...props}
			aria-label={label}
			orientation="vertical"
			loop={false}
			className={
				typeof className === "function"
					? (state) => ["ts-palette", className(state)].filter(Boolean).join(" ")
					: ["ts-palette", className].filter(Boolean).join(" ")
			}
		>
			{sections.map((section) => {
				const headingId = `${id}-${section.id}`;
				return (
					<ToolbarGroup key={section.id} aria-labelledby={headingId} className="ts-palette__section">
						<div id={headingId} className="ts-palette__heading">
							{section.label}
						</div>
						{section.items.map(({ kind, label: itemLabel }) => (
							<ToolbarButton
								key={kind}
								className="ts-palette__item"
								render={<UiButton onClick={(_event, { source }) => onInsert(kind, { source })} />}
							>
								<span className="ts-palette__tile" data-family={WORKFLOW_KIND_FAMILY[kind]} aria-hidden="true">
									<Icon name={WORKFLOW_KIND_ICON[kind]} size={14} />
								</span>
								<span className="ts-palette__name">{itemLabel}</span>
							</ToolbarButton>
						))}
					</ToolbarGroup>
				);
			})}
		</UiToolbar>
	);
}
