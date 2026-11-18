import { createElement, useEffect, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Button } from "../Button/Button.js";

const dialogPropsSchema = z.object({
	triggerLabel: z.string().min(1).describe("Visible label that opens the dialog"),
	title: z.string().min(1).describe("Dialog title"),
	description: z.string().min(1).describe("Short explanation of the task"),
	body: z.string().min(1).describe("Dialog body text"),
	cancelLabel: z.string().min(1).describe("Label for the cancel action"),
	actionLabel: z.string().min(1).describe("Label for the primary action"),
	destructive: z.boolean().default(false).describe("Use a destructive style for the primary action"),
});

type DialogParts = typeof import("./Dialog.js");
const loadDialogParts = (import.meta as ImportMeta & { env?: { SSR?: boolean } }).env?.SSR
	? undefined
	: () => import("./Dialog.js");

function DialogOpenUIView({ props }: { props: z.infer<typeof dialogPropsSchema> }) {
	const [parts, setParts] = useState<DialogParts>();
	const [loadError, setLoadError] = useState("");
	useEffect(() => {
		let active = true;
		void loadDialogParts?.()
			.then((module) => {
				if (active) setParts(module as DialogParts);
			})
			.catch(() => {
				if (active) setLoadError("Dialog could not be loaded.");
			});
		return () => {
			active = false;
		};
	}, []);
	if (!parts) return loadError ? createElement("p", { role: "status" }, loadError) : null;
	const { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } = parts;
	return createElement(
		Dialog,
		null,
		createElement(DialogTrigger, { render: createElement(Button, { variant: "outline" }) }, props.triggerLabel),
		createElement(DialogBackdrop, null),
		createElement(
			DialogContent,
			null,
			createElement(DialogTitle, null, props.title),
			createElement(DialogDescription, null, props.description),
			createElement("p", { "data-slot": "dialog-body" }, props.body),
			createElement(
				"div",
				{ "data-slot": "dialog-actions" },
				createElement(
					DialogClose,
					{ render: createElement(Button, { variant: "outline" }) },
					props.cancelLabel,
				),
				createElement(
					DialogClose,
					{
						render: createElement(Button, { variant: props.destructive ? "danger" : "solid" }),
					},
					props.actionLabel,
				),
			),
		),
	);
}

export const DialogOpenUI = defineComponent({
	name: "Dialog",
	description: "A focused modal window that explains a task and offers a clear action.",
	props: dialogPropsSchema,
	component: DialogOpenUIView,
});

registerComponent(DialogOpenUI);
