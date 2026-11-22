import { bindDrag, type ChangeSource, dragThreshold } from "@ui-sdk/core";
import { Button as UiButton } from "@ui-sdk/react/button";
import { ToolbarButton, ToolbarGroup, Toolbar as UiToolbar } from "@ui-sdk/react/toolbar";
import { type ComponentProps, type RefObject, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../icons/Icon.js";
import { WORKFLOW_KIND_FAMILY, WORKFLOW_KIND_ICON, type WorkflowNodeKind } from "../../schemas/workflow.js";
import type { CanvasHandle } from "../Canvas/Canvas.js";
import { kindLabel } from "../workflow/labels.js";

export type PaletteItem = { kind: WorkflowNodeKind; label: string };
export type PaletteSection = { id: string; label: string; items: readonly PaletteItem[] };
export type PaletteInsertDetails = { source: ChangeSource; position?: { x: number; y: number } };
export type PaletteProps = Omit<ComponentProps<typeof UiToolbar>, "children" | "aria-label" | "orientation"> & {
	label: string;
	sections: readonly PaletteSection[];
	onInsert: (kind: WorkflowNodeKind, details: PaletteInsertDetails) => void;
	canvas?: RefObject<CanvasHandle | null>;
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

export function Palette({ label, sections, onInsert, className, canvas, ...props }: PaletteProps) {
	const id = useId();
	const [drag, setDrag] = useState<PaletteItem | null>(null);
	const ghost = useRef<HTMLDivElement | null>(null);
	const ghostPlace = useRef({ x: 0, y: 0 });
	const stopDrag = useRef<(() => void) | null>(null);
	useEffect(() => () => stopDrag.current?.(), []);
	const placeGhost = () => {
		const { x, y } = ghostPlace.current;
		if (ghost.current) ghost.current.style.translate = `${x}px ${y}px`;
	};
	const startDrag = (event: PointerEvent, row: HTMLElement, item: PaletteItem) => {
		if (!canvas || props.disabled || event.pointerType === "touch" || event.button !== 0) return;
		stopDrag.current?.();
		// The ghost keeps the place under the pointer where the row was pressed.
		const box = row.getBoundingClientRect();
		const grab = { x: event.clientX - box.left, y: event.clientY - box.top };
		let dragged = false;
		stopDrag.current = bindDrag(row, event, {
			threshold: dragThreshold,
			cancelOnEscape: true,
			onMove: ({ x, y }) => {
				ghostPlace.current = { x: x - grab.x, y: y - grab.y };
				placeGhost();
				if (dragged) return;
				dragged = true;
				setDrag(item);
			},
			onEnd: (end, canceled) => {
				stopDrag.current = null;
				setDrag(null);
				if (!dragged || canceled) return;
				const position = canvas.current?.pointAt(end.clientX, end.clientY);
				if (position) onInsert(item.kind, { source: end.pointerType === "pen" ? "pen" : "mouse", position });
			},
		});
	};
	return (
		<>
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
							{section.items.map((item) => (
								<ToolbarButton
									key={item.kind}
									className="ts-palette__item"
									data-dragging={drag?.kind === item.kind ? "" : undefined}
									onPointerDown={(event) => startDrag(event.nativeEvent, event.currentTarget, item)}
									render={<UiButton onClick={(_event, { source }) => onInsert(item.kind, { source })} />}
								>
									<PaletteRow {...item} />
								</ToolbarButton>
							))}
						</ToolbarGroup>
					);
				})}
			</UiToolbar>
			{drag &&
				createPortal(
					<div
						ref={(element) => {
							ghost.current = element;
							placeGhost();
						}}
						className="ts-palette__ghost"
						aria-hidden="true"
					>
						<PaletteRow {...drag} />
					</div>,
					document.body,
				)}
		</>
	);
}

function PaletteRow({ kind, label }: PaletteItem) {
	return (
		<>
			<span className="ts-palette__tile" data-family={WORKFLOW_KIND_FAMILY[kind]} aria-hidden="true">
				<Icon name={WORKFLOW_KIND_ICON[kind]} size={14} />
			</span>
			<span className="ts-palette__name">{label}</span>
		</>
	);
}
