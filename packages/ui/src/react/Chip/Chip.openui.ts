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
	}),
	component: ({ props }) => createElement(Chip, { ...props, icon: createElement("span", null, "◈") }),
});

registerComponent(ChipOpenUI);
