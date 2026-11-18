import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Badge } from "./Badge.js";

export const BadgeOpenUI = defineComponent({
	name: "Badge",
	description: "A non-interactive label that names a state.",
	props: z.object({
		label: z.string().min(1).describe("Visible badge label"),
		tone: z.enum(["default", "success", "warning", "danger", "info"]).default("default"),
	}),
	component: ({ props }) => {
		const { label, ...badgeProps } = props;
		return createElement(Badge, badgeProps, label);
	},
});

registerComponent(BadgeOpenUI);
