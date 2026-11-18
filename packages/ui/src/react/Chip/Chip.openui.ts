import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Chip } from "./Chip.js";

export const ChipOpenUI = defineComponent({
	name: "Chip",
	description: "A pill that opens an attached object such as an output schema or tool.",
	props: z.object({
		name: z.string().min(1).describe("Object identifier"),
		icon: z.string().min(1).describe("Consumer-provided icon glyph"),
		href: z.string().min(1).describe("Object destination URL"),
	}),
	component: ({ props: { name, icon, href } }) =>
		createElement(Chip, { name, icon, render: createElement("a", { href }) }),
});

registerComponent(ChipOpenUI);
