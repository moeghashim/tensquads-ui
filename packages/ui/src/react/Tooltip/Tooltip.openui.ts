import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Button } from "../Button/Button.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip.js";

export const TooltipOpenUI = defineComponent({
	name: "Tooltip",
	description: "A short hint shown when a control receives focus or hover.",
	props: z.object({
		label: z.string().min(1).describe("Accessible name of the trigger"),
		hint: z.string().min(1).describe("Short tooltip text"),
		side: z.enum(["top", "right", "bottom", "left"]).default("top"),
	}),
	component: ({ props }) =>
		createElement(
			Tooltip,
			{},
			createElement(
				TooltipTrigger,
				{ render: createElement(Button, { iconOnly: true, "aria-label": props.label }) },
				createElement("span", { "aria-hidden": true }, "+"),
			),
			createElement(TooltipContent, { side: props.side }, props.hint),
		),
});

registerComponent(TooltipOpenUI);
