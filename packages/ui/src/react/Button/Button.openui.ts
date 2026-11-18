import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Button } from "./Button.js";

export const ButtonOpenUI = defineComponent({
	name: "Button",
	description: "An accessible button that runs an action.",
	props: z.object({
		label: z.string().min(1).describe("Visible button label"),
		variant: z.enum(["solid", "soft", "outline", "ghost", "danger"]).default("solid"),
		size: z.enum(["sm", "md", "lg"]).default("md"),
		pill: z.boolean().default(false),
		disabled: z.boolean().default(false),
	}),
	component: ({ props }) => {
		const { label, ...buttonProps } = props;
		return createElement(Button, buttonProps, label);
	},
});

registerComponent(ButtonOpenUI);
