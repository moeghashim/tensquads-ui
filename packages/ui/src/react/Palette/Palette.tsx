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
	const [drag, setDrag] = useState<{ kind: WorkflowNodeKind; label: string; family: string } | null>(null);
	const ghost = useRef<HTMLDivElement | null>(null);
	const stopDrag = useRef<(() => void) | null>(null);
	const swallowClick = useRef(false);
	useEffect(() => () => stopDrag.current?.(), []);
	const startDrag = (event: PointerEvent, element: HTMLElement, kind: WorkflowNodeKind, itemLabel: string) => {
		if (!canvas || props.disabled || event.pointerType === "touch" || event.button !== 0) return;
		stopDrag.current?.();
		let started = false;
		stopDrag.current = bindDrag(element, event, {
			threshold: dragThreshold,
			cancelOnEscape: true,
			onStart: () => {
				started = true;
				swallowClick.current = true;
				setDrag({ kind, label: itemLabel, family: WORKFLOW_KIND_FAMILY[kind] });
			},
			onMove: ({ x, y }) => {
				if (ghost.current)
					ghost.current.style.translate = `${document.documentElement.dir === "rtl" ? -x : x}px ${y}px`;
			},
			onEnd: (endEvent, canceled) => {
				stopDrag.current = null;
				setDrag(null);
				if (canceled) swallowClick.current = false;
				if (!started || canceled) return;
				const position = canvas.current?.pointAt(endEvent.clientX, endEvent.clientY);
				if (position) onInsert(kind, { source: endEvent.pointerType as "mouse" | "pen", position });
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
							{section.items.map(({ kind, label: itemLabel }) => (
								<ToolbarButton
									key={kind}
									data-palette-kind={kind}
									data-palette-label={itemLabel}
									ref={(element) => {
										if (!element) return;
										const pointerDown = (event: PointerEvent) => startDrag(event, element, kind, itemLabel);
										element.addEventListener("pointerdown", pointerDown);
										return () => element.removeEventListener("pointerdown", pointerDown);
									}}
									className={`ts-palette__item${drag?.kind === kind ? " ts-palette__item--dragging" : ""}`}
									data-dragging={drag?.kind === kind ? "" : undefined}
									render={
										<UiButton
											onClick={(_event, { source }) => {
												if (swallowClick.current) {
													swallowClick.current = false;
													return;
												}
												onInsert(kind, { source });
											}}
										/>
									}
								>
									<span
										className="ts-palette__tile"
										data-family={WORKFLOW_KIND_FAMILY[kind]}
										aria-hidden="true"
									>
										<Icon name={WORKFLOW_KIND_ICON[kind]} size={14} />
									</span>
									<span className="ts-palette__name">{itemLabel}</span>
								</ToolbarButton>
							))}
						</ToolbarGroup>
					);
				})}
			</UiToolbar>
			{drag && typeof document !== "undefined"
				? createPortal(
						<div
							ref={ghost}
							className="ts-palette__ghost"
							aria-hidden="true"
							dir={typeof document !== "undefined" ? document.documentElement.dir : undefined}
						>
							<span className="ts-palette__tile" data-family={drag.family}>
								<Icon name={WORKFLOW_KIND_ICON[drag.kind]} size={14} />
							</span>
							<span className="ts-palette__name">{drag.label}</span>
						</div>,
						document.body,
					)
				: null}
		</>
	);
}
